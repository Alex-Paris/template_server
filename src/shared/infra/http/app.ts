import "express-async-errors";

import "../typeorm";
import "../../containers";

import express, { NextFunction, Request, Response } from "express";

import { AppError } from "@shared/errors/AppError";

import { routes } from "./routes";

const app = express();

app.use(express.json());

app.use("/api/v1", routes);

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
