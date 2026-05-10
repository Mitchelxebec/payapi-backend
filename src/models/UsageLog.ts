import mongoose, { Document, Schema, Types } from "mongoose";

export interface UsageLogInfo {
  userId: Types.ObjectId;
  apiKey: string;
  endpoint: string;
  service: string;
}

export interface UsageLogDoc extends UsageLogInfo, Document {
  createdAt: Date;
  updatedAt: Date;
}

const UsageLogSchema = new Schema<UsageLogDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    apiKey: { type: String, required: true },
    endpoint: { type: String, required: true },
    service: { type: String, required: true },
  },
  { timestamps: true },
);

export const UsageLogModel = mongoose.model<UsageLogDoc>(
  "UsageLog",
  UsageLogSchema,
);
