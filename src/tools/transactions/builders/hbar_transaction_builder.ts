import { AccountId } from "@hashgraph/sdk";
import { BaseTransactionBuilder } from "./base_transaction_builder";
import { TransferHBARResult } from "../../../types";
import { TransferHbarStrategy } from "../strategies/hbar/transfer_hbar_strategy";

export class HbarTransactionBuilder {
    static transferHbar(
        fromAccountId: string | AccountId,
        toAccountId: string | AccountId,
        amount: string
    ): BaseTransactionBuilder<TransferHBARResult> {
        const strategy = new TransferHbarStrategy(fromAccountId, toAccountId, amount);
        return new BaseTransactionBuilder<TransferHBARResult>(strategy);
    }
}