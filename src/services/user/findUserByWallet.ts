import { UserDocument, UserModel } from "../../models/User";

type UserResult = {
  user: UserDocument;
};

const findUserByWallet = async (
  walletAddress: string,
): Promise<UserResult | null> => {
  const existingUser = await UserModel.findOne({ walletAddress });
  if (!existingUser) {
    return null;
  }

  return { user: existingUser };
};

export default findUserByWallet;
