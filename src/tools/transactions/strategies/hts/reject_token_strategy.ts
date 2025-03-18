import {
    AccountId,
    TokenId,
    TokenRejectTransaction,
    Transaction,
    TransactionReceipt,
    TransactionResponse
} from "@hashgraph/sdk";
import { TransactionStrategy } from "../base_strategy";
import { RejectTokenResult } from "../../../../types";

export class RejectTokenStrategy implements TransactionStrategy<RejectTokenResult> {
    constructor(
        private tokenId: TokenId,
        private issuerAccountId: AccountId,
    ) {}

    build(): Transaction {
        return new TokenRejectTransaction()
            .setOwnerId(this.issuerAccountId)
            .addTokenId(this.tokenId);
    }

    formatResult(txResponse: TransactionResponse, receipt:  TransactionReceipt): RejectTokenResult {
        return {
            status: receipt.status.toString(),
            txHash: txResponse.transactionId.toString(),
        }
    }
}