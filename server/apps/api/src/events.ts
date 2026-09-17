import { EventEmitter } from "node:events";
import type { Response } from "express";

import type { InvoiceEventPayload } from "@chefvision/shared";
import type { InvoiceStatusPublisher } from "./store.js";

export class InvoiceEvents implements InvoiceStatusPublisher {
  private readonly emitter = new EventEmitter();

  publish(payload: InvoiceEventPayload): void {
    this.emitter.emit("invoice", payload);
  }

  subscribe(response: Response): () => void {
    const handler = (payload: InvoiceEventPayload) => {
      response.write(`event: invoice-status\n`);
      response.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    this.emitter.on("invoice", handler);
    return () => {
      this.emitter.off("invoice", handler);
    };
  }
}
