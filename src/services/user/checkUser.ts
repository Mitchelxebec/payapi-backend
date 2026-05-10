import { UserDocument, UserModel } from "../../models/User";
import { ApiError } from "../../utils/ApiError";

type CheckUserResult = {
  user: UserDocument;
};

const findOrCreateUser = async (
  walletAddress: string,
): Promise<CheckUserResult> => {
  try {
    const existingUser = await UserModel.findOne({ walletAddress });
    if (existingUser) {
      return { user: existingUser };
    }

    const newUser = await UserModel.create({
      walletAddress,
    });

    return { user: newUser };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "User service error";
    throw new ApiError(500, message);
  }
};

export default findOrCreateUser;
