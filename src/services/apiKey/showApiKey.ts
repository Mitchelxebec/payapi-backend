import { Types } from "mongoose";
import { ApiKeyModel } from "../../models/ApiKey";
import { ApiError } from "../../utils/ApiError";

const showApiKey = async (userId: Types.ObjectId) => {
  try {
    const activeApiKeys = await ApiKeyModel.find({
      userId,
      status: "active",
    }).sort({ createdAt: -1 });

    return { activeApiKeys };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    throw new ApiError(500, message);
  }
};
