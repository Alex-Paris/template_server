import "express-async-errors";

import "../redis";
import "../typeorm";
import "../../containers";

import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";
import celebrate from "celebrate";
import express, { NextFunction, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";

import { AppError } from "@shared/errors/AppError";
import { LimiterError } from "@shared/errors/LimiterError";

import { fillXRateLimitHeader } from "@utils/rate";

import swaggerFile from "./documentation/swagger.json";
import { rateLimiter } from "./middlewares/rateLimiter";
import { routes } from "./routes";

// Use express in API.
const app = express();

// Start sentry for monitoring and erro tracking API.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    // Enable HTTP calls tracing.
    new Sentry.Integrations.Http({ tracing: true }),
    // Enable Express.js middleware tracing.
    new Tracing.Integrations.Express({ app }),
  ],

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance
  // monitoring.
  // We recommend adjusting this value in production.
  tracesSampleRate: 1.0,
});

// RequestHandler creates a separate execution context using domains, so that
// every transaction/span/breadcrumb is attached to its own Hub instance.
app.use(Sentry.Handlers.requestHandler());

// TracingHandler creates a trace for every incoming request.
app.use(Sentry.Handlers.tracingHandler());

// Enables JSON in express.
app.use(express.json());

// Middleware rate limiter.
app.use(rateLimiter);

// Includes all routes in API.
app.use("/api/v1", routes);

// Include a route for "swagger" documentation.
app.use("/api/v1/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});

// Sentry error handler must be before any other error middleware and after all
// controllers.
app.use(
  Sentry.Handlers.errorHandler({
    shouldHandleError(err) {
      // If error is expected in most of services.
      if (err instanceof AppError) {
        if (err.statusCode === 404) {
          return true;
        }
        return false;
      }

      // If error is generated purposely by rate limiter.
      if (err instanceof LimiterError) {
        // Status code always 429.
        return true;
      }

      // If reach here means that error is not expected (status code 500).
      return true;
    },
  })
);

// Include "celebrate" errors inside API.
app.use(celebrate.errors());

// Express async errors throw API error's in this handler.
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
