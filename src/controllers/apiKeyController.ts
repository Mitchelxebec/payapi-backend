import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { ApiError } from "../utils/ApiError";
import findUserByWallet from "../services/user/findUserByWallet";
import { showApiKeys } from "../services/apiKey/keyManagement";
import getUserLogs from "../services/apiKey/getRecentLogs";
import deleteApiKey from "../services/apiKey/deleteApiKey";

/**
 * GET /api/keys
 * Header: x-wallet-address: 0x...
 */
export const getKeys = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // 1. Get wallet from header (common for dashboard auth)
    const walletAddress = req.headers["x-wallet-address"] as string;

    if (!walletAddress) {
      throw new ApiError(400, "Wallet address header is missing");
    }

    // 2. Find the user
    const user = await findUserByWallet(walletAddress);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // 3. Fetch all keys for this user
    const keys = await showApiKeys(user.user._id as Types.ObjectId);

    res.status(200).json({
      success: true,
      data: keys,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/keys/revoke
 * Body: { "walletAddress": "0x...", "service": "Crypto API" }
 */
export const revokeKey = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { walletAddress, service } = req.body;

    if (!walletAddress || !service) {
      throw new ApiError(400, "Missing wallet address or service");
    }

    // 1. Find the user
    const result = await findUserByWallet(walletAddress);

    const userId = result?.user?._id;
    if (!userId) {
      throw new ApiError(404, "User not found");
    }

    // 2. Update status to 'revoked'
    await deleteApiKey(userId as Types.ObjectId, service);

    res.status(200).json({
      success: true,
      message: `Access to ${service} has been revoked successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

export const getRecentActivity = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const walletAddress = req.headers["x-wallet-address"] as string;
    if (!walletAddress) {
      throw new ApiError(400, "Please connect your wallet to view activity");
    }

    //  find the user
    const user = await findUserByWallet(walletAddress);
    if (!user) throw new ApiError(404, "User not found");

    // Get the logs
    const logs = await getUserLogs(user.user._id as Types.ObjectId);

    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};
