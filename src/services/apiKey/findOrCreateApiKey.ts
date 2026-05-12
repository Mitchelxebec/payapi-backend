import { Types } from "mongoose";
import { ApiKeyModel, IApiKey } from "../../models/ApiKey";
import { ServiceType } from "../../models/Transaction";
import { generateApiKey, hashApiKey } from "../user/userApiKey";
import { ApiError } from "../../utils/ApiError";

interface ApiKeyResult {
  keyDoc: IApiKey;
  plainKey: string;
}

const findOrCreateApiKey = async (
  userId: Types.ObjectId,
  service: ServiceType,
): Promise<ApiKeyResult> => {
  try {
    // Block if an active key already exists for this service
    const existingActiveKey = await ApiKeyModel.findOne({
      userId,
      service,
      status: "active",
    });

    if (existingActiveKey) {
      throw new ApiError(409, "You already have an active key for this service.");
    }

    // No active key — user either never had one or revoked it.
    // Always create a fresh document (unique index on { userId, service } has been dropped).
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
    if (error instanceof ApiError) throw error;

    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    throw new ApiError(500, message);
  }
};

export default findOrCreateApiKey;
