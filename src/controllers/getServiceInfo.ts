import { NextFunction, Request, Response } from "express";
import { SERVICE_PRICES } from "../config/services";
import { SUPPORTED_SERVICES } from "../models/Transaction";

const getServiceInfo = (req: Request, res: Response, next: NextFunction) => {
  const STROOPS_PER_XLM = 10_000_000;

  res.status(200).json({
    success: true,
    data: SUPPORTED_SERVICES.map((name) => ({
      name,
      priceInXLM: (SERVICE_PRICES[name] / STROOPS_PER_XLM).toFixed(7),
    })),
  });

  next();
};

export default getServiceInfo;
