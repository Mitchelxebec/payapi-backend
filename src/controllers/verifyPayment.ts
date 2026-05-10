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
    // 0. Check req.body
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

    // 2. Validate format & check exist & payment was made
    validateTxHash(txHash);
    await txHashExists(txHash);

    await verifyStellarPayment(
      txHash,
      priceInStroops,
      process.env.MY_STELLAR_WALLET as string,
    );

    // 3. Find or Create User
    const { user } = await findOrCreateUser(walletAddress);

    // 4. API Key Management (The Decision Tree)
    // Scenario 1: Returns existing keyDoc + plainKey: null
    // Scenario 2: Returns new keyDoc + plainKey: string
    const { keyDoc, plainKey } = await findOrCreateApiKey(
      user._id as Types.ObjectId,
      service,
    );

    // 5. Store in the DB
    await storeTransaction({
      userId: user._id as Types.ObjectId,
      txHash,
      service,
    });

    // 6. Send Response
    if (plainKey) {
      // NEW USER FLOW
      res.status(201).json({
        success: true,
        user: keyDoc,
        apiKey: plainKey,
        message: "API key generated. Save it now; it won't be shown again",
      });
    } else {
      // EXISTING USER FLOW
      res.status(200).json({
        success: true,
        user: keyDoc,
        apiKey: null,
        message:
          "You already have an active key. If lost, pay again to get a new one",
      });
    }
  } catch (error) {
    // This catches the ApiErrors from the services and the 400 above
    next(error);
  }
};

export default verifyPayment;
