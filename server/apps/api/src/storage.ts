import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { PutObjectCommand, GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

import type { ApiConfig } from "./config.js";

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

export class S3InvoiceStorage implements InvoiceStorage {
  private readonly client: S3Client;

  constructor(private readonly config: Pick<ApiConfig, "AWS_REGION" | "S3_BUCKET" | "S3_ENDPOINT" | "AWS_ACCESS_KEY_ID" | "AWS_SECRET_ACCESS_KEY">) {
    this.client = new S3Client({
      region: config.AWS_REGION,
      endpoint: config.S3_ENDPOINT,
      forcePathStyle: Boolean(config.S3_ENDPOINT),
      credentials:
        config.AWS_ACCESS_KEY_ID && config.AWS_SECRET_ACCESS_KEY
          ? {
              accessKeyId: config.AWS_ACCESS_KEY_ID,
              secretAccessKey: config.AWS_SECRET_ACCESS_KEY
            }
          : undefined
    });
  }

  async putObject(key: string, body: Buffer, mimeType: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.config.S3_BUCKET,
        Key: key,
        Body: body,
        ContentType: mimeType
      })
    );
  }

  async getObject(key: string): Promise<Buffer> {
    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: this.config.S3_BUCKET,
        Key: key
      })
    );

    const bytes = await response.Body?.transformToByteArray();
    if (!bytes) {
      throw new Error(`Missing object body for ${key}`);
    }
    return Buffer.from(bytes);
  }
}
