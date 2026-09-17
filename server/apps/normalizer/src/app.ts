import express from "express";
import cors from "cors";
import { z } from "zod";

import { IngredientNormalizerService } from "./service.js";

const normalizeSchema = z.object({
  lineItemId: z.string().min(1),
  vendorId: z.string().nullable(),
  rawText: z.string().min(1),
  rawQty: z.number().nonnegative(),
  rawUnit: z.string().min(1)
});

const evaluationSchema = z.object({
  samples: z
    .array(
      z.object({
        id: z.string().min(1),
        rawText: z.string().min(1),
        vendorId: z.string().nullable(),
        rawQty: z.number().nonnegative(),
        rawUnit: z.string().min(1),
        expectedCanonicalName: z.string().nullable(),
        description: z.string().optional()
      })
    )
    .optional()
});

export function createNormalizerApp(service: IngredientNormalizerService) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_request, response) => {
    response.json({ ok: true });
  });

  app.get("/model/info", (_request, response) => {
    response.json(service.getModelMetadata());
  });

  app.post("/normalize", async (request, response, next) => {
    try {
      const payload = normalizeSchema.parse(request.body);
      const result = await service.normalize(payload);
      response.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.post("/evaluate", async (request, response, next) => {
    try {
      const payload = evaluationSchema.parse(request.body ?? {});
      const report = await service.evaluate(payload.samples);
      response.json(report);
    } catch (error) {
      next(error);
    }
  });

  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    const message = error instanceof Error ? error.message : "Unknown error";
    response.status(400).json({ error: message });
  });

  return app;
}
