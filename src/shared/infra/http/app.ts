import "express-async-errors";

import "../typeorm";
import "../../containers";

import celebrate from "celebrate";
import express, { NextFunction, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";

import { AppError } from "@shared/errors/AppError";

import swaggerFile from "./documentation/swagger.json";
import { routes } from "./routes";

const app = express();

app.use(express.json());

app.use("/api/v1", routes);

app.use("/api/v1/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.use(celebrate.errors());

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, request: Request, response: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    return response.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  console.log(err);

  return response.status(500).json({
    status: "error",
    message: "Internal server error",
  });
});

export { app };
