import { NextFunction, Request, Response } from "express";
import { ServiceType } from "../models/Transaction";
import { ApiError } from "../utils/ApiError";
import crypto from "crypto";
import { ApiKeyModel } from "../models/ApiKey";
import { UsageLogModel } from "../models/UsageLog";

const gatewayMiddleware = (requiredService: ServiceType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Extract Key
      const plainKey = req.headers["x-api-key"] as string;
      if (!plainKey) throw new ApiError(401, "API key is missing");

      // 2. Hash & Find
      const hashedKey = crypto
        .createHash("sha256")
        .update(plainKey)
        .digest("hex");
      const apiKeyDoc = await ApiKeyModel.findOne({ keyHash: hashedKey });

      if (!apiKeyDoc) throw new ApiError(401, "Invalid API key");

      // 3. Check Status
      if (apiKeyDoc.status !== "active") {
        throw new ApiError(
          403,
          `API access is ${apiKeyDoc.status}. Please contact support.`,
        );
      }

      // 4. Service Scoping
      if (apiKeyDoc.service !== requiredService) {
        throw new ApiError(
          403,
          `This key is not authorized for ${requiredService}`,
        );
      }

      // 5. Auto-Reset & Rate Limiting
      const now = new Date();
      const lastReset = new Date(apiKeyDoc.lastReset);

      // Check if the last reset was on a different day (Daily Reset)
      const isNewDay =
        now.getUTCDate() !== lastReset.getUTCDate() ||
        now.getUTCMonth() !== lastReset.getUTCMonth() ||
        now.getUTCFullYear() !== lastReset.getUTCFullYear();

      if (isNewDay) {
        apiKeyDoc.usage.daily = 0;
        apiKeyDoc.lastReset = now;
      }

      //   Check limits
      if (apiKeyDoc.usage.daily >= apiKeyDoc.limits.daily) {
        throw new ApiError(429, "Daily usage exceeded");
      }

      // ⚡ SUCCESS: Increment usage & proceed
      apiKeyDoc.usage.daily += 1;
      apiKeyDoc.usage.monthly += 1;
      await apiKeyDoc.save();

      // 📜 NEW: AUDIT TRAILING
      await UsageLogModel.create({
        userId: apiKeyDoc.userId,
        apiKey: apiKeyDoc.keyHash,
        endpoint: req.originalUrl, // Captures the full path like /api/crypto-price
        service: apiKeyDoc.service,
      });

      // 6. Let them through
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default gatewayMiddleware;
