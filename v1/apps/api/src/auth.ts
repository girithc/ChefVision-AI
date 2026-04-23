import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import type { AuthTokenPayload } from "@chefvision/shared";

import type { ApiConfig } from "./config.js";
import type { InvoiceStore, UserRecord } from "./store.js";

export interface AuthedRequest extends Request {
  user?: AuthTokenPayload;
}

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

export async function authenticateUser(store: InvoiceStore, email: string, password: string) {
  const user = await store.findUserByEmail(email);
  if (!user || user.password !== password) {
    return null;
  }
  return user;
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
