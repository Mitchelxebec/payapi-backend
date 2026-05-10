import { ApiError } from "../../utils/ApiError";

const STROOPS_PER_XLM = 10000000;

const verifyStellarPayment = async (
  txHash: string,
  priceInStroops: number,
  myWallet: string,
) => {
  try {
    // 1. Convert stroops to Stellar's string format (e.g., 0.0100000)
    const expectedAmount = (priceInStroops / STROOPS_PER_XLM).toFixed(7);

    // 2. Fetch from Horizon (using Testnet for now, change to 'horizon' for live)
    const horizonBase =
      process.env.STELLAR_NETWORK === "mainnet"
        ? "https://horizon.stellar.org"
        : "https://horizon-testnet.stellar.org";

    const response = await fetch(
      `${horizonBase}/transactions/${txHash}/operations`,
    );

    if (!response.ok) {
      throw new ApiError(404, "Transaction not found");
    }

    const data = await response.json();
    const ops = data._embedded.records;

    // 3. Find the payment operation
    const payment = ops.find(
      (op: any) =>
        op.type === "payment" &&
        op.to === myWallet &&
        op.asset_type === "native",
    );

    if (!payment) {
      throw new ApiError(404, "No valid XLM payment found to your wallet");
    }

    // 4. Verify Amount
    if (payment.amount !== expectedAmount) {
      throw new ApiError(
        401,
        `Incorrect amount. Expected ${expectedAmount} XLM`,
      );
    }

    return { isValid: true };
  } catch (error: unknown) {
    if (error instanceof ApiError) throw error;

    const message =
      error instanceof Error
        ? error.message
        : "Transaction hash not found on Stellar";

    throw new ApiError(500, message);
  }
};

export default verifyStellarPayment;
