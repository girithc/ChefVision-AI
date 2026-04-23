import { Redis } from "ioredis";
import { Queue, Worker } from "bullmq";

import { queueNames } from "@chefvision/shared";

export interface InvoiceJobPayload {
  invoiceId: string;
}

export interface InvoiceJobQueue {
  start(handler: (payload: InvoiceJobPayload) => Promise<void>): Promise<void>;
  enqueue(payload: InvoiceJobPayload): Promise<void>;
  close(): Promise<void>;
}

export class InlineInvoiceJobQueue implements InvoiceJobQueue {
  private handler: ((payload: InvoiceJobPayload) => Promise<void>) | null = null;

  async start(handler: (payload: InvoiceJobPayload) => Promise<void>): Promise<void> {
    this.handler = handler;
  }

  async enqueue(payload: InvoiceJobPayload): Promise<void> {
    if (!this.handler) {
      throw new Error("Inline queue handler not initialized");
    }
    queueMicrotask(() => {
      void this.handler?.(payload);
    });
  }

  async close(): Promise<void> {}
}

export class BullMqInvoiceJobQueue implements InvoiceJobQueue {
  private readonly connection: Redis;

  private readonly queue: Queue<InvoiceJobPayload>;

  private worker: Worker<InvoiceJobPayload> | null = null;

  constructor(redisUrl: string) {
    this.connection = new Redis(redisUrl, { maxRetriesPerRequest: null });
    this.queue = new Queue(queueNames.invoiceProcessing, { connection: this.connection });
  }

  async start(handler: (payload: InvoiceJobPayload) => Promise<void>): Promise<void> {
    this.worker = new Worker(
      queueNames.invoiceProcessing,
      async (job) => handler(job.data),
      { connection: this.connection }
    );
  }

  async enqueue(payload: InvoiceJobPayload): Promise<void> {
    await this.queue.add(queueNames.invoiceProcessing, payload, {
      attempts: 3,
      backoff: { type: "exponential", delay: 1000 }
    });
  }

  async close(): Promise<void> {
    await this.worker?.close();
    await this.queue.close();
    await this.connection.quit();
  }
}
