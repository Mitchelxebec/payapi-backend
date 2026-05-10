import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // If it is our custom ApiError, use its status code and message
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  //   Fallback for unexpected errors (e.g. database crash)
  console.error("UNEXPECTED ERROR: ", err);
  return res.status(500).json({
    success: false,
    message: "Something went wrong on the server",
  });
};

export default errorHandler