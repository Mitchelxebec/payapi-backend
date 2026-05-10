import { Types } from "mongoose";
import { ApiKeyModel } from "../../models/ApiKey";

export const showApiKeys = async (userId: Types.ObjectId) => {
  // Return everything EXCEPT the sensitive keyHash
  return await ApiKeyModel.find({ userId }).select("-keyHash");
};
