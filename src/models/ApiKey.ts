import mongoose, { Document, Schema, Types } from "mongoose";
import { ServiceType, SUPPORTED_SERVICES } from "./Transaction";

export interface IApiKey extends Document {
  userId: Types.ObjectId;
  keyHash: string;
  service: ServiceType;
  status: "active" | "revoked";
  limits: {
    daily: number;
    monthly: number;
  };
  usage: {
    daily: number;
    monthly: number;
  };
  lastReset: Date;
}

const ApiKeySchema = new Schema<IApiKey>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    keyHash: { type: String, required: true, unique: true },
    service: { type: String, enum: SUPPORTED_SERVICES, required: true },
    status: { type: String, enum: ["active", "revoked"], default: "active" },
    limits: {
      daily: { type: Number, default: 100 },
      monthly: { type: Number, default: 10000 },
    },
    usage: {
      daily: { type: Number, default: 0 },
      monthly: { type: Number, default: 0 },
    },
    lastReset: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// No compound unique index on { userId, service }.
// Revoked keys are kept for audit. One active key per service is enforced
// at the application level in findOrCreateApiKey.

export const ApiKeyModel = mongoose.model<IApiKey>("ApiKey", ApiKeySchema);
