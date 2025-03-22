import type { NextFunction, Request, Response } from "express";
import { Error as MongooseError } from "mongoose";

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = 500;
  let message = "Something went wrong";

  const isProduction = process.env.NODE_ENV === "production";

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof MongooseError.ValidationError) {
    statusCode = 400;
    message = isProduction
      ? "Invalid input data. Please check your request."
      : Object.values(err.errors)
          .map((error) => error.message)
          .join(", ");
  } else if (err instanceof MongooseError.CastError) {
    statusCode = 400;
    message = isProduction
      ? "Invalid data format. Please check your request."
      : `Invalid ${err.path}: ${err.value}`;
  } else if (err instanceof MongooseError.DocumentNotFoundError) {
    statusCode = 404;
    message = isProduction
      ? "The requested resource was not found."
      : "Document not found";
  } else if (err instanceof MongooseError) {
    statusCode = 400;
    message = isProduction
      ? "A database error occurred. Please try again later."
      : err.message;
  } else if (err instanceof Error) {
    message = isProduction
      ? "An unexpected error occurred. Please try again later."
      : err.message;
  }

  if (!isProduction) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(!isProduction && {
      stack: err instanceof Error ? err.stack : undefined,
    }),
  });
};
