import { DeleteTopicResult } from "../../../types";
import {TopicDeleteTransaction, TopicId, Transaction, TransactionReceipt, TransactionResponse} from "@hashgraph/sdk";
import { TransactionStrategy } from "../base_strategy";

export class DeleteTopicStrategy implements TransactionStrategy<DeleteTopicResult> {
    constructor(
        private topicId: TopicId | string,
    ) {}

    build(): Transaction {
        return new TopicDeleteTransaction()
            .setTopicId(this.topicId)
    }

    formatResult(txResponse: TransactionResponse, receipt:  TransactionReceipt): DeleteTopicResult {
        return {
            txHash: txResponse.transactionId.toString(),
            status: receipt.status.toString(),
        };
    }
}