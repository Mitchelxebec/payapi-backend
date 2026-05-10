import { SERVICE_PRICES } from "../../config/services";
import { TxDocument, TxInfo, TxModel } from "../../models/Transaction";
import { ApiError } from "../../utils/ApiError";

const storeTransaction = async (
  data: Omit<TxInfo, "amount" | "status">,
): Promise<TxDocument> => {
  try {
    const officialAmount = SERVICE_PRICES[data.service];
    const newTx = await TxModel.create({
      userId: data.userId,
      txHash: data.txHash,
      service: data.service,
      amount: officialAmount,
      status: "completed",
    });

    return newTx;
  } catch (error: unknown) {
    if (error instanceof Error && (error as any).code === 11000) {
      throw new ApiError(409, "This transaction has already been used");
    }

    const message =
      error instanceof Error ? error.message : "Failed to store transaction";
    throw new ApiError(500, message);
  }
};

export default storeTransaction;
