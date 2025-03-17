import {
    PendingAirdropId,
    TokenClaimAirdropTransaction,
    Transaction, TransactionReceipt, TransactionResponse
} from "@hashgraph/sdk";
import { TransactionStrategy } from "../base_strategy";
import { ClaimAirdropResult } from "../../../types";

export class ClaimAirdropStrategy implements TransactionStrategy<ClaimAirdropResult> {
    constructor(
        private airdropId: PendingAirdropId,
    ) {}

    build(): Transaction {
        return new TokenClaimAirdropTransaction()
            .addPendingAirdropId(this.airdropId)
    }

    formatResult(txResponse: TransactionResponse, receipt:  TransactionReceipt): ClaimAirdropResult {
        return {
            status: receipt.status.toString(),
            txHash: txResponse.transactionId.toString(),
        }
    }
}