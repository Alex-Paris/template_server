import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

import auth from "@config/auth";

import { AppError } from "@shared/errors/AppError";

interface ITokenPayload {
  iat: number;
  exp: number;
  sub: string;
}

export function ensureAuthenticated(
  req: Request,
  _: Response,
  next: NextFunction
): void {
  // Incoming authorization.
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError("JWT token is missing.", 401);
  }

  // extract token to be decodified.
  const [, token] = authHeader.split(" ");

  let decoded;

  // Validating if token is a valid JWT.
  try {
    decoded = verify(token, auth.jwt.secret);
  } catch {
    throw new AppError("Invalid JWT token.", 401);
  }

  // Obtaining token data.
  const { sub: userId } = decoded as ITokenPayload;

  // Inserting user id inside express request.
  req.user.id = userId;

  return next();
}
