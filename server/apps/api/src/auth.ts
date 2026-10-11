import { scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import type { AuthTokenPayload } from "@chefvision/shared";

import type { ApiConfig } from "./config.js";
import type { InvoiceStore, UserRecord } from "./store.js";

export interface AuthedRequest extends Request {
  user?: AuthTokenPayload;
}

const scrypt = promisify(scryptCallback);

export function createToken(user: UserRecord, config: Pick<ApiConfig, "JWT_SECRET">): string {
  return jwt.sign(
    {
      sub: user.id,
      restaurantId: user.restaurantId,
      role: user.role
    } satisfies AuthTokenPayload,
    config.JWT_SECRET,
    { expiresIn: "8h" }
  );
}

export function authMiddleware(config: Pick<ApiConfig, "JWT_SECRET">) {
  return (request: AuthedRequest, response: Response, next: NextFunction) => {
    const token =
      extractBearerToken(request.headers.authorization) ??
      (typeof request.query.token === "string" ? request.query.token : null);

    if (!token) {
      response.status(401).json({ error: "Missing token" });
      return;
    }

    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as AuthTokenPayload;
      request.user = decoded;
      next();
    } catch {
      response.status(401).json({ error: "Invalid token" });
    }
  };
}

export function adminMiddleware(request: AuthedRequest, response: Response, next: NextFunction) {
  if (request.user?.role !== "admin") {
    response.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}

export async function authenticateUser(store: InvoiceStore, email: string, password: string) {
  const user = await store.findUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return null;
  }
  return user;
}

export async function hashPassword(password: string, salt: Buffer): Promise<string> {
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const [algorithm, saltHex, hashHex] = encoded.split("$");
  if (algorithm !== "scrypt" || !saltHex || !hashHex) return false;
  try {
    const expected = Buffer.from(hashHex, "hex");
    const actual = (await scrypt(password, Buffer.from(saltHex, "hex"), expected.length)) as Buffer;
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

function extractBearerToken(header: string | undefined): string | null {
  if (!header) {
    return null;
  }
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }
  return token;
}
