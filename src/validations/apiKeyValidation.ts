import { z } from "zod";
import {SUPPORTED_SERVICES} from "../models/Transaction"

const services = z.enum(SUPPORTED_SERVICES);


export const revokeKeySchema = z.object({
  body: z.object({
    walletAddress: z.string().min(56, "Invalid wallet address length"),
    service: services,
  }),
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    walletAddress: z.string().min(56, "Invalid wallet address"),
    txHash: z
      .string()
      .length(64, "Transaction hash must be exactly 64 characters")
      .regex(/^[0-9a-fA-F]+$/, "Transaction hash must be hexadecimal"),
    service: services,
  }),
});
