import { ApiError } from "../../utils/ApiError";

const validateTxHash = (data: string):void => {
  try {
    // 1. Check if it exists
    if (!data) {
      throw new ApiError(400, "TxHash is required"); // 400 is standard for missing fields
    }

    const userTxHash = data.toLowerCase();

    // 2. Exact length check
    if (userTxHash.length !== 64) {
      throw new ApiError(400, "TxHash must be exactly 64 characters");
    }

    // 3. Hexadecimal check using .test()
    if (!/^[a-f0-9]+$/.test(userTxHash)) {
      throw new ApiError(400, "TxHash must be hexadecimal");
    }
  } catch (error: unknown) {
    if (error instanceof ApiError) throw error

    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    throw new ApiError(500, message);
  }
};

export default validateTxHash;
