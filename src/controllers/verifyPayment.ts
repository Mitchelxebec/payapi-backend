import { NextFunction, Request, Response } from "express";
import validateTxHash from "../services/transaction/validateHash";
import txHashExists from "../services/transaction/hashExists";
import verifyStellarPayment from "../services/stellar/verifyStellarPayment";
import { SERVICE_PRICES } from "../config/services";
import findOrCreateUser from "../services/user/checkUser";
import findOrCreateApiKey from "../services/apiKey/findOrCreateApiKey";
import storeTransaction from "../services/transaction/storeTransaction";
import { ApiError } from "../utils/ApiError";
import { Types } from "mongoose";

const verifyPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // 0. Validate request body
    if (
      !req.body ||
      !req.body.walletAddress ||
      !req.body.txHash ||
      !req.body.service
    ) {
      throw new ApiError(
        400,
        "Missing required fields: walletAddress, txHash, and service",
      );
    }

    // 1. Extract data
    const { walletAddress, txHash, service } = req.body;

    const priceInStroops =
      SERVICE_PRICES[service as keyof typeof SERVICE_PRICES];

    if (!priceInStroops) {
      throw new ApiError(400, "Invalid service requested");
    }

    // 2. Validate tx hash format, check it hasn't been used, verify payment on Stellar
    validateTxHash(txHash);
    await txHashExists(txHash);
    await verifyStellarPayment(
      txHash,
      priceInStroops,
      process.env.MY_STELLAR_WALLET as string,
    );

    // 3. Find or create user
    const { user } = await findOrCreateUser(walletAddress);

    // 4. Issue a new API key.
    //    Throws 409 if user already has an active key for this service.
    //    Always returns a plainKey (never null) — revoked keys are kept for
    //    audit but do not block new key creation.
    const { keyDoc, plainKey } = await findOrCreateApiKey(
      user._id as Types.ObjectId,
      service,
    );

    // 5. Record the transaction
    await storeTransaction({
      userId: user._id as Types.ObjectId,
      txHash,
      service,
    });

    // 6. Respond with the plain key — shown once, never again
    res.status(201).json({
      success: true,
      user: keyDoc,
      apiKey: plainKey,
      message: "API key generated. Save it now — it won't be shown again.",
    });
  } catch (error) {
    next(error);
  }
};

export default verifyPayment;
