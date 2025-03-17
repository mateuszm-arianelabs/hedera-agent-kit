import {Transaction, TransactionReceipt, TransactionResponse} from "@hashgraph/sdk";
import {TransactionResult} from "../../types";

export interface TransactionStrategy<T extends TransactionResult> {
    build(): Transaction;
    formatResult(txResponse: TransactionResponse, receipt: TransactionReceipt): T;
}