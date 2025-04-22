import { ExecutorAccountDetails, HederaNetworkType } from "../types"
import { getPublicKeyByAccountId } from "./api-utils";

export const optionalFetchPublicKey = (
  isCustodial: boolean,
  executorAccountDetails: ExecutorAccountDetails,
  hederaNetworkType: HederaNetworkType
): Promise<string | undefined> => {
  if (!isCustodial && !executorAccountDetails.executorPublicKey) {
    if (!executorAccountDetails.executorAccountId)
      throw new Error("Executor account ID is required for non-custodial mode");

    return getPublicKeyByAccountId(
      hederaNetworkType,
      executorAccountDetails.executorAccountId
    );
  }
  return Promise.resolve(executorAccountDetails.executorPublicKey);
}
