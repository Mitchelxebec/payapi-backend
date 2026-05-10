import { Types } from "mongoose";
import { ServiceType } from "../../models/Transaction";
import { ApiKeyModel } from "../../models/ApiKey";
import { ApiError } from "../../utils/ApiError";

const deleteApiKey = async (userId: Types.ObjectId, service: ServiceType) => {
  try {
    // 1. Find and update status in one go
    const revokedKey = await ApiKeyModel.findOneAndUpdate(
      {
        userId,
        service,
        status: "active",
      }, //Search Criteria
      { status: "revoked" }, //Change to apply
      { new: true }, //Return the updated document);
    );

    // 2. If no active key was found to revoke
    if (!revokedKey) {
      throw new ApiError(
        404,
        `No active API key found for the ${service} service.`,
      );
    }

    return { revokedKey };
  } catch (error: unknown) {
    if (error instanceof ApiError) throw error;
    
    const message =
      error instanceof Error ? error.message : "Failed to revoke API key";
    throw new ApiError(500, message);
  }
};

export default deleteApiKey