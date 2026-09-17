import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Pool } from "pg";

export interface InvoiceStorage {
  putObject(key: string, body: Buffer, mimeType: string): Promise<void>;
  getObject(key: string): Promise<Buffer>;
}

export class LocalInvoiceStorage implements InvoiceStorage {
  constructor(private readonly rootDir: string) {}

  async putObject(key: string, body: Buffer): Promise<void> {
    const filePath = path.join(this.rootDir, key);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, body);
  }

  async getObject(key: string): Promise<Buffer> {
    const filePath = path.join(this.rootDir, key);
    return readFile(filePath);
  }
}

// ponytail: bytea in Postgres is fine for the MVP (~512MB Neon free tier);
// move invoice_file.content to object storage (S3/Azure Blob) when photo volume outgrows that.
export class DbInvoiceStorage implements InvoiceStorage {
  constructor(private readonly pool: Pool) {}

  async putObject(key: string, body: Buffer): Promise<void> {
    await this.pool.query(
      `insert into invoice_file (storage_key, content) values ($1, $2)
       on conflict (storage_key) do update set content = excluded.content`,
      [key, body]
    );
  }

  async getObject(key: string): Promise<Buffer> {
    const result = await this.pool.query("select content from invoice_file where storage_key = $1", [key]);
    if (result.rowCount === 0) {
      throw new Error(`Missing stored file for ${key}`);
    }
    return result.rows[0].content;
  }
}
