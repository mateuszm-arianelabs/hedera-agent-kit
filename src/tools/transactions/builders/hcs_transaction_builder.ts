import {CreateTopicResult, DeleteTopicResult, SubmitMessageResult} from "../../../types";
import { BaseTransactionBuilder } from "./base_transaction_builder";
import { CreateTopicStrategy } from "../strategies/hcs/create_topic_strategy";
import { TopicId } from "@hashgraph/sdk";
import { SubmitTopicMessageStrategy } from "../strategies/hcs/submit_topic_message_strategy";
import {DeleteTopicStrategy} from "../strategies/hcs/delete_topic_strategy";

export class HcsTransactionBuilder {
    static createTopic(
        memo: string,
        publicKey: any,
        isSubmitKey: boolean
    ): BaseTransactionBuilder<CreateTopicResult> {
        const strategy = new CreateTopicStrategy(memo, publicKey, isSubmitKey);
        return new BaseTransactionBuilder<CreateTopicResult>(strategy);
    }

    static submitTopicMessage(
        topicId: TopicId,
        message: string,
    ): BaseTransactionBuilder<SubmitMessageResult> {
        const strategy = new SubmitTopicMessageStrategy(topicId.toString(), message);
        return new BaseTransactionBuilder<SubmitMessageResult>(strategy);
    }

    static deleteTopic(
        topicId: TopicId | string,
    ): BaseTransactionBuilder<DeleteTopicResult> {
        const strategy = new DeleteTopicStrategy(topicId)
        return new BaseTransactionBuilder<DeleteTopicResult>(strategy);
    }
}