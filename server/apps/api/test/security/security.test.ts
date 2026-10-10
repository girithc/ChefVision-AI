import assert from "node:assert/strict";
import test from "node:test";

import request from "supertest";
import type { Pool } from "pg";

import { createApiApp } from "../../src/app.js";
import { InvoiceEvents } from "../../src/events.js";
import { InlineInvoiceJobQueue } from "../../src/queue.js";
import { MemoryInvoiceStore } from "../../src/store.memory.js";
import type { InvoiceStorage } from "../../src/storage.js";

const passwordHash = "scrypt$c4cbb07071873ce0d8840c8963d5107a$9a828f092f9514c524b14981c3c94d5d2b96a5686f2a99815585948dcdaaaa3fb58f3edbcda1f3fb30edcc1cd99dc18bbf9deeb8a945bef83d7b4b69615a760f";

function createFixture() {
  const store = new MemoryInvoiceStore([
    { id: "owner-1", email: "owner@example.test", passwordHash, restaurantId: "rest-1", role: "owner" },
    { id: "admin-1", email: "admin@example.test", passwordHash, restaurantId: "rest-1", role: "admin" },
    { id: "owner-2", email: "other@example.test", passwordHash, restaurantId: "rest-2", role: "owner" },
  ]);
  const objects = new Map<string, Buffer>();
  const storage: InvoiceStorage = {
    async putObject(key, body) { objects.set(key, body); },
    async getObject(key) {
      const value = objects.get(key);
      if (!value) throw new Error("missing object");
      return value;
    },
  };
  const app = createApiApp({
    config: {
      PORT: 0,
      DATABASE_URL: "postgres://unused",
      REDIS_URL: "redis://unused",
      JWT_SECRET: "test-only-jwt-secret-with-32-characters",
      NORMALIZER_URL: "http://unused",
      DATABASE_SSL: "disable",
      STORAGE_MODE: "local",
      LOCAL_UPLOAD_DIR: "./tmp-data/test-uploads",
      MAX_UPLOAD_BYTES: 10,
    },
    pool: {} as Pool,
    store,
    storage,
    queue: new InlineInvoiceJobQueue(),
    normalizer: { async normalize() { throw new Error("not used"); } },
    events: new InvoiceEvents(),
  });
  return { app, store };
}

async function login(app: ReturnType<typeof createApiApp>, email: string) {
  const response = await request(app)
    .post("/auth/login")
    .send({ email, password: "ChefVisionDemo!2026" })
    .expect(200);
  return response.body.token as string;
}

test("authentication rejects invalid credentials and accepts scrypt hashes", async () => {
  const { app } = createFixture();
  await request(app)
    .post("/auth/login")
    .send({ email: "owner@example.test", password: "wrong-password" })
    .expect(401);
  const token = await login(app, "owner@example.test");
  assert.ok(token);
});

test("owner tokens cannot access admin routes", async () => {
  const { app } = createFixture();
  const token = await login(app, "owner@example.test");
  await request(app)
    .get("/admin/demo/results")
    .set("Authorization", `Bearer ${token}`)
    .expect(403);
});

test("invoice and planning reads stay inside the authenticated tenant", async () => {
  const { app, store } = createFixture();
  await store.createInvoice({
    id: "invoice-rest-2",
    restaurantId: "rest-2",
    storageKey: "rest-2/invoice.json",
    originalFilename: "invoice.json",
    mimeType: "application/json",
  });
  await store.upsertRecipe("rest-1", { id: "recipe-1", name: "Tenant One", category: "", ingredients: [] });
  await store.upsertRecipe("rest-2", { id: "recipe-2", name: "Tenant Two", category: "", ingredients: [] });

  const ownerToken = await login(app, "owner@example.test");
  await request(app)
    .get("/invoices/invoice-rest-2")
    .set("Authorization", `Bearer ${ownerToken}`)
    .expect(404);

  const recipes = await request(app)
    .get("/recipes")
    .set("Authorization", `Bearer ${ownerToken}`)
    .expect(200);
  assert.deepEqual(recipes.body.recipes.map((recipe: { id: string }) => recipe.id), ["recipe-1"]);
});

test("invoice upload rejects unsupported MIME types and oversized files", async () => {
  const { app } = createFixture();
  const token = await login(app, "owner@example.test");

  await request(app)
    .post("/invoices/upload")
    .set("Authorization", `Bearer ${token}`)
    .attach("file", Buffer.from("not-an-image"), { filename: "invoice.png", contentType: "image/png" })
    .expect(415);

  await request(app)
    .post("/invoices/upload")
    .set("Authorization", `Bearer ${token}`)
    .attach("file", Buffer.from("01234567890"), { filename: "invoice.json", contentType: "application/json" })
    .expect(413);
});
