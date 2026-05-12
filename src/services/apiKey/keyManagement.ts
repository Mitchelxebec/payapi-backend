import { Types } from "mongoose";
import { ApiKeyModel } from "../../models/ApiKey";

export const showApiKeys = async (userId: Types.ObjectId) => {
  return await ApiKeyModel.find({ userId, status: "active" });
};
