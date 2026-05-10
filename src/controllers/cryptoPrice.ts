import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";

const getCryptoPrice = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { coin } = req.query;

    if (!coin) {
      throw new ApiError(
        400,
        "Please provide a coin name (e.g. ?coin=bitcoin)",
      );
    }

    // 1. Call CoinGecko
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`,
    );

    // 2. Check if the external API is down
    if (!response.ok) {
      throw new ApiError(502, "External Crypto Provider is unavailable");
    }

    const data = await response.json();

    // 3. Check if the coin was valid
    if (!data[coin as string]) {
      throw new ApiError(404, `Coin '${coin}' not found on CoinGecko`);
    }

    // 4. Return clean data to your paying user
    res.status(200).json({
      success: true,
      service: "Crypto API",
      data: {
        name: coin,
        price_usd: data[coin as string].usd,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export default getCryptoPrice;
