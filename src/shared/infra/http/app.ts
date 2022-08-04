import "express-async-errors";

import "../redis";
import "../typeorm";
import "../../containers";

import celebrate from "celebrate";
import express, { NextFunction, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";

import { AppError } from "@shared/errors/AppError";
import { LimiterError } from "@shared/errors/LimiterError";

import { fillXRateLimitHeader } from "@utils/rate";

import swaggerFile from "./documentation/swagger.json";
import { rateLimiter } from "./middlewares/rateLimiter";
import { routes } from "./routes";

const app = express();

app.use(rateLimiter);
app.use(express.json());

app.use("/api/v1", routes);

app.use("/api/v1/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.use(celebrate.errors());

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  if (err instanceof LimiterError) {
    const { secsBeforeNext, msBeforeNext, limitPoints, remainingPoints } = err;
    fillXRateLimitHeader({ res, msBeforeNext, limitPoints, remainingPoints });
    res.set("Retry-After", String(secsBeforeNext));
    return res.status(429).json({
      status: "error",
      message: "Too many requests.",
    });
  }

  console.log(err);

  return res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
});

export { app };
