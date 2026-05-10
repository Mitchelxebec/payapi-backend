import { Request, Response, NextFunction } from "express";
import { ZodError, ZodTypeAny } from "zod";

export const validate =
  (schema: ZodTypeAny) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        // Using [0] to get the first error message safely
        message: result.error.issues[0]?.message || "Validation failed",
        // Added explicit type to 'i' to fix the implicit any error
        errors: result.error.issues.map((i: { message: string }) => i.message),
      });
    }

    const validatedData = result.data as any;

    if (validatedData.body) {
      req.body = validatedData.body;
    }
    next();
  };
