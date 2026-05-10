import mongoose, { Document, Schema, Types } from "mongoose";
// Create a shared type or enum
export const SUPPORTED_SERVICES = [
  "AI Search API",
  "News API",
  "Crypto API",
] as const;
export type ServiceType = (typeof SUPPORTED_SERVICES)[number];

export interface TxInfo {
  userId: Types.ObjectId;
  txHash: string;
  service: ServiceType; // Uses the type above
  amount: number;
  status: "pending" | "completed" | "failed";
}

export interface TxDocument extends TxInfo, Document {
  createdAt: Date;
  updatedAt: Date;
}

const TxSchema = new Schema<TxDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    txHash: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // Automatically converts hash to lowercase
      minlength: 64,
      maxlength: 64,
      match: [/^[a-f0-9]+$/, "Please provide a valid hexadecimal Stellar hash"],
    },
    service: {
      type: String,
      enum: SUPPORTED_SERVICES,
      required: true,
    },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export const TxModel = mongoose.model<TxDocument>("Transaction", TxSchema);
