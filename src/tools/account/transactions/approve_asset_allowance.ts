import {
    AccountAllowanceApproveTransaction,
    AccountId,
    Client, TokenId,
} from "@hashgraph/sdk";
import { AssetAllowanceResult } from "../../../types";

export const approve_asset_allowance = async (
    spenderAccount: AccountId,
    tokenId: TokenId | undefined,
    amount: number,
    client: Client,
): Promise<AssetAllowanceResult> => {
    let tx;
    if(tokenId) {
        tx = await new AccountAllowanceApproveTransaction()
            .approveTokenAllowance(tokenId, client.operatorAccountId!, spenderAccount, amount)
            .freezeWith(client)
            .execute(client);
    } else {
        tx = await new AccountAllowanceApproveTransaction()
            .approveHbarAllowance(client.operatorAccountId!, spenderAccount, amount)
            .freezeWith(client)
            .execute(client);
    }

    const receiptQuery = tx.getReceiptQuery();
    const txResponse = await receiptQuery.execute(client);
    const receipt = txResponse.status;
    const hash = receiptQuery.transactionId?.toString();

    return {
        status: receipt.toString(),
        txHash: hash || 'error',
    }
}
