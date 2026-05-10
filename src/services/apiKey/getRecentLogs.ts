import { Types } from "mongoose";
import { UsageLogModel } from "../../models/UsageLog";

const getUserLogs = async (userId: Types.ObjectId) => {
  // Find logs for this user with this Id
  return await UsageLogModel.find({
    userId,
  })
    .sort({ createdAt: -1 })
    .limit(10);
};

export default getUserLogs;
