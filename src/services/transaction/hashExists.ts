import {  TxModel } from "../../models/Transaction";
import { ApiError } from "../../utils/ApiError";

const txHashExists = async (data: string): Promise<void> => {
  try {
    const userTxHash = data;
    const txExists = await TxModel.exists({ txHash: userTxHash });

    if (txExists) {
      throw new ApiError(409, "Transaction hash already exists");
    }
  } catch (error: unknown) {
    if (error instanceof ApiError) throw error;

    const message =
      error instanceof Error ? error.message : "Internal Server Error ";
    throw new ApiError(500, message);
  }
};

export default txHashExists;
