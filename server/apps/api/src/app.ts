import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

import cors from "cors";
import ExcelJS from "exceljs";
import express from "express";
import multer from "multer";
import { z } from "zod";
import type { Pool } from "pg";

import { adminMiddleware, createToken, authMiddleware, authenticateUser, type AuthedRequest } from "./auth.js";
import type { ApiConfig } from "./config.js";
import { DashboardRepository } from "./dashboard-repository.js";
import type { InvoiceEvents } from "./events.js";
import { LiveOcrBatchManager } from "./live-ocr-batch.js";
import type { NormalizerClient } from "./normalizer-client.js";
import type { InvoiceJobQueue } from "./queue.js";
import type { InvoiceStore } from "./store.js";
import type { InvoiceStorage } from "./storage.js";
import { processInvoiceJob } from "./worker.js";

const allowedUploadTypes = new Set(["application/json", "text/plain", "text/csv"]);

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const batchStartSchema = z.object({
  limit: z.coerce.number().int().min(1).max(1000).optional()
});

const receiptMetadataSchema = z.object({
  externalReceiptId: z.string().min(1).max(120),
  source: z.enum(["scan", "manual"]),
  invoiceNumber: z.string().max(120).default(""),
  tax: z.number().finite().min(0).default(0),
  tip: z.number().finite().min(0).default(0),
  notes: z.string().max(4000).default("")
});

const receiptUpdateSchema = receiptMetadataSchema.pick({
  invoiceNumber: true,
  tax: true,
  tip: true,
  notes: true
});

const recipeSchema = z.object({
  id: z.string().min(1).max(120),
  name: z.string().trim().min(1).max(200),
  category: z.string().trim().max(120).default(""),
  ingredients: z.array(z.object({
    name: z.string().trim().min(1).max(200),
    qtyPerServing: z.number().finite().min(0),
    unit: z.string().trim().min(1).max(40)
  })).max(200)
});

const plannedEventSchema = z.object({
  id: z.string().min(1).max(120),
  name: z.string().trim().min(1).max(200),
  date: z.iso.date(),
  guests: z.number().int().min(0).max(1_000_000),
  notes: z.string().max(4000).default(""),
  recipes: z.array(z.object({
    recipeId: z.string().min(1).max(120),
    servings: z.number().int().min(0).max(1_000_000)
  })).max(200)
});

export function createApiApp(dependencies: {
  config: ApiConfig;
  pool: Pool;
  store: InvoiceStore;
  storage: InvoiceStorage;
  queue: InvoiceJobQueue;
  normalizer: NormalizerClient;
  events: InvoiceEvents;
}) {
  const { config, pool, store, storage, queue, normalizer, events } = dependencies;
  const app = express();
  const requireAuth = authMiddleware(config);
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: config.MAX_UPLOAD_BYTES, files: 1, fields: 4 },
    fileFilter: (_request, file, callback) => {
      if (allowedUploadTypes.has(file.mimetype)) {
        callback(null, true);
      } else {
        callback(new Error(`Unsupported upload type: ${file.mimetype}`));
      }
    }
  });
  const uiDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src/ui");
  const batchManager = new LiveOcrBatchManager({ pool, store, storage, queue });
  const dashboard = new DashboardRepository(pool, config);

  app.use(cors());
  app.use(express.json());
  app.use("/ui/assets", express.static(uiDir));

  app.get("/health", (_request, response) => {
    response.json({ ok: true });
  });

  app.get("/ui", (_request, response) => {
    response.sendFile(path.join(uiDir, "index.html"));
  });

  app.get("/ui/run", (_request, response) => {
    response.sendFile(path.join(uiDir, "run.html"));
  });

  app.get("/ui/results", (_request, response) => {
    response.sendFile(path.join(uiDir, "results.html"));
  });

  app.post("/auth/login", async (request, response) => {
    const payload = loginSchema.parse(request.body);
    const user = await authenticateUser(store, payload.email, payload.password);
    if (!user) {
      response.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = createToken(user, config);
    response.json({ token, role: user.role, restaurantId: user.restaurantId });
  });

  app.post("/invoices/upload", requireAuth, upload.single("file"), async (request: AuthedRequest, response, next) => {
    try {
      const file = request.file;
      if (!file || !request.user) {
        response.status(400).json({ error: "Missing file" });
        return;
      }

      const invoiceId = randomUUID();
      const rawMetadata =
        typeof request.body.metadata === "string" ? JSON.parse(request.body.metadata) : request.body.metadata;
      const metadata = receiptMetadataSchema.parse(
        rawMetadata ?? { externalReceiptId: invoiceId, source: "scan" }
      );
      const storageKey = `${request.user.restaurantId}/invoices/${invoiceId}-${file.originalname}`;
      await storage.putObject(storageKey, file.buffer, file.mimetype);

      const invoice = await store.createInvoice({
        id: invoiceId,
        restaurantId: request.user.restaurantId,
        storageKey,
        originalFilename: file.originalname,
        mimeType: file.mimetype,
        ...metadata
      });

      events.publish({
        invoiceId,
        restaurantId: request.user.restaurantId,
        status: "pending",
        message: "Invoice uploaded and queued",
        at: new Date().toISOString()
      });

      await queue.enqueue({ invoiceId });

      response.status(202).json({
        invoiceId: invoice.id,
        status: invoice.status,
        createdAt: invoice.createdAt
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/invoices", requireAuth, async (request: AuthedRequest, response, next) => {
    try {
      const invoices = await store.listInvoices(request.user!.restaurantId);
      response.json({
        invoices: await Promise.all(
          invoices.map(async (invoice) => ({ ...invoice, lineItems: await store.listLineItems(invoice.id) }))
        )
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/invoices/:id", requireAuth, async (request: AuthedRequest, response, next) => {
    try {
      const invoiceId = String(request.params.id);
      const invoice = await store.getInvoiceById(invoiceId);
      if (!invoice || invoice.restaurantId !== request.user?.restaurantId) {
        response.status(404).json({ error: "Invoice not found" });
        return;
      }
      const lineItems = await store.listLineItems(invoice.id);
      response.json({ ...invoice, lineItems });
    } catch (error) {
      next(error);
    }
  });

  app.patch("/invoices/:id", requireAuth, async (request: AuthedRequest, response, next) => {
    try {
      const payload = receiptUpdateSchema.parse(request.body);
      const updated = await store.updateInvoiceMetadata({
        invoiceId: String(request.params.id),
        restaurantId: request.user!.restaurantId,
        ...payload
      });
      if (!updated) {
        response.status(404).json({ error: "Invoice not found" });
        return;
      }
      response.json({ ok: true });
    } catch (error) {
      next(error);
    }
  });

  app.delete("/invoices/:id", requireAuth, async (request: AuthedRequest, response, next) => {
    try {
      const deleted = await store.deleteInvoice(String(request.params.id), request.user!.restaurantId);
      if (!deleted) {
        response.status(404).json({ error: "Invoice not found" });
        return;
      }
      response.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  app.get("/inventory", requireAuth, async (request: AuthedRequest, response, next) => {
    try {
      const inventory = await store.listInventory(request.user!.restaurantId);
      response.json({ items: inventory });
    } catch (error) {
      next(error);
    }
  });

  app.get("/inventory/export", requireAuth, async (request: AuthedRequest, response, next) => {
    try {
      const items = await store.listInventory(request.user!.restaurantId);
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Inventory");
      worksheet.columns = [
        { header: "Canonical ID", key: "canonicalId", width: 40 },
        { header: "Ingredient", key: "canonicalName", width: 24 },
        { header: "On Hand Qty", key: "onHandQty", width: 16 },
        { header: "Unit", key: "unit", width: 12 }
      ];
      items.forEach((item) => worksheet.addRow(item));

      const buffer = await workbook.xlsx.writeBuffer();
      response
        .setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        .setHeader("Content-Disposition", 'attachment; filename="inventory.xlsx"')
        .send(Buffer.from(buffer));
    } catch (error) {
      next(error);
    }
  });

  app.get("/recipes", requireAuth, async (request: AuthedRequest, response, next) => {
    try {
      response.json({ recipes: await store.listRecipes(request.user!.restaurantId) });
    } catch (error) {
      next(error);
    }
  });

  app.put("/recipes/:id", requireAuth, async (request: AuthedRequest, response, next) => {
    try {
      const recipe = recipeSchema.parse({ ...request.body, id: String(request.params.id) });
      await store.upsertRecipe(request.user!.restaurantId, recipe);
      response.json(recipe);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/recipes/:id", requireAuth, async (request: AuthedRequest, response, next) => {
    try {
      const deleted = await store.deleteRecipe(request.user!.restaurantId, String(request.params.id));
      if (!deleted) {
        response.status(404).json({ error: "Recipe not found" });
        return;
      }
      response.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  app.get("/events", requireAuth, async (request: AuthedRequest, response, next) => {
    try {
      response.json({ events: await store.listEvents(request.user!.restaurantId) });
    } catch (error) {
      next(error);
    }
  });

  app.get("/events/stream", requireAuth, (request: AuthedRequest, response) => {
    response.setHeader("Content-Type", "text/event-stream");
    response.setHeader("Cache-Control", "no-cache");
    response.setHeader("Connection", "keep-alive");
    response.flushHeaders?.();

    const unsubscribe = events.subscribe(response, request.user!.restaurantId);
    request.on("close", unsubscribe);
  });

  app.put("/events/:id", requireAuth, async (request: AuthedRequest, response, next) => {
    try {
      const event = plannedEventSchema.parse({ ...request.body, id: String(request.params.id) });
      await store.upsertEvent(request.user!.restaurantId, event);
      response.json(event);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/events/:id", requireAuth, async (request: AuthedRequest, response, next) => {
    try {
      const deleted = await store.deleteEvent(request.user!.restaurantId, String(request.params.id));
      if (!deleted) {
        response.status(404).json({ error: "Event not found" });
        return;
      }
      response.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  app.post("/admin/demo/batch/start", requireAuth, adminMiddleware, async (request: AuthedRequest, response, next) => {
    try {
      const payload = batchStartSchema.parse(request.body ?? {});
      const status = await batchManager.start({
        restaurantId: request.user!.restaurantId,
        limit: payload.limit
      });
      response.status(202).json(status);
    } catch (error) {
      next(error);
    }
  });

  app.get("/admin/demo/batch/status", requireAuth, adminMiddleware, (request: AuthedRequest, response) => {
    response.json(batchManager.getStatus(request.user!.restaurantId));
  });

  app.get("/admin/demo/report", requireAuth, adminMiddleware, async (request: AuthedRequest, response, next) => {
    try {
      response.json(await batchManager.getLatestReport(request.user!.restaurantId));
    } catch (error) {
      next(error);
    }
  });

  app.get("/admin/demo/pipeline", requireAuth, adminMiddleware, async (request: AuthedRequest, response, next) => {
    try {
      const restaurantId = request.user!.restaurantId;
      const latestReport = await batchManager.getLatestReport(restaurantId);
      response.json(
        await dashboard.getPipelineData({
          batchStatus: batchManager.getStatus(restaurantId),
          latestReport
        })
      );
    } catch (error) {
      next(error);
    }
  });

  app.get("/admin/demo/invoice/:id", requireAuth, adminMiddleware, async (request: AuthedRequest, response, next) => {
    try {
      const invoiceId = String(request.params.id);
      const invoice = await store.getInvoiceById(invoiceId);
      if (!invoice || invoice.restaurantId !== request.user!.restaurantId) {
        response.status(404).json({ error: "Invoice not found" });
        return;
      }
      const lineItems = await store.listLineItems(invoice.id);
      let rawText: string | null = null;
      try {
        const buffer = await storage.getObject(invoice.storageKey);
        rawText = buffer.toString("utf8");
      } catch {
        rawText = null;
      }
      response.json({ invoice, lineItems, rawText });
    } catch (error) {
      next(error);
    }
  });

  app.get("/admin/demo/results", requireAuth, adminMiddleware, async (_request: AuthedRequest, response, next) => {
    try {
      response.json(
        await dashboard.getResultsData({
          latestReport: await batchManager.getLatestReport(_request.user!.restaurantId),
          restaurantId: _request.user!.restaurantId
        })
      );
    } catch (error) {
      next(error);
    }
  });

  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE"
      ? 413
      : message.startsWith("Unsupported upload type:")
        ? 415
        : 400;
    response.status(status).json({ error: message });
  });

  void queue.start((payload) =>
    processInvoiceJob(payload.invoiceId, {
      store,
      storage,
      normalizer,
      events
    })
  );

  return app;
}
