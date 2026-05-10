import { Types } from "mongoose";
import { ApiKeyModel, IApiKey } from "../../models/ApiKey";
import { ServiceType } from "../../models/Transaction";
import { generateApiKey, hashApiKey } from "../user/userApiKey";
import { ApiError } from "../../utils/ApiError";

interface ApiKeyResult {
  keyDoc: IApiKey;
  plainKey: string | null;
}

const findOrCreateApiKey = async (
  userId: Types.ObjectId,
  service: ServiceType,
): Promise<ApiKeyResult> => {
  try {
    // 1. Check for existing active key for this specific service
    const existingKey = await ApiKeyModel.findOne({
      userId,
      service,
      status: "active",
    });

    // 2. Handle Scenario 1: Key exists
    if (existingKey) {
      return { keyDoc: existingKey, plainKey: null };
    }

    // 3. Handle Scenario 2: Create new key
    const plainKey = generateApiKey();
    const hashedKey = hashApiKey(plainKey);

    const newKey = await ApiKeyModel.create({
      userId,
      service,
      keyHash: hashedKey,
      status: "active",
    });

    return { keyDoc: newKey, plainKey };
  } catch (error: unknown) {
    // Check for MongoDB Duplicate Key Error (11000)
    if (error instanceof Error && (error as any).code === 11000) {
      throw new ApiError(
        409,
        "You already have an active key for this service.",
      );
    }

    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    throw new ApiError(500, message);
  }
};

export default findOrCreateApiKey;
