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
      throw new ApiError(400, "Please provide a coin name (e.g. ?coin=bitcoin)");
    }

    const cgKey = process.env.COINGECKO_API_KEY;

    // CoinGecko demo keys go in the x-cg-demo-api-key header
    const cgUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`;

    const response = await fetch(cgUrl, {
      headers: cgKey ? { "x-cg-demo-api-key": cgKey } : {},
    });

    if (!response.ok) {
      throw new ApiError(502, "External Crypto Provider is unavailable");
    }

    const data = await response.json();

    if (!data[coin as string]) {
      throw new ApiError(404, `Coin '${coin}' not found on CoinGecko`);
    }

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
