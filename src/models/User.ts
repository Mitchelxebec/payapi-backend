import mongoose, { Document, Schema } from "mongoose";

export interface UserInfo {
  walletAddress: string;
}

export interface UserDocument extends UserInfo, Document {
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true },
);

export const UserModel = mongoose.model<UserDocument>("User", UserSchema);
