import { Tool } from "@langchain/core/tools";
import HederaAgentKit from "../../../agent";
import {TopicId} from "@hashgraph/sdk";

abstract class AbstractHederaSubmitTopicMessageTool extends Tool {
    name = 'hedera_submit_topic_message';

    description = `Submit a message to a topic on Hedera
Inputs (input is a JSON string):
topicId: string, the ID of the topic to submit the message to e.g. 0.0.123456,
message: string, the message to submit to the topic e.g. "Hello, Hedera!"
Example usage:
1. Submit a message to topic 0.0.123456:
  '{
    "topicId": "0.0.123456",
    "message": "Hello, Hedera!"
  }'
`;

    protected constructor() {
        super();
    }
}

export class CustodialHederaSubmitTopicMessageTool extends AbstractHederaSubmitTopicMessageTool {
    constructor(private hederaKit: HederaAgentKit) {
        super();
    }

    protected async _call(input: string): Promise<string> {
        try {
            console.log('hedera_submit_topic_message (custodial) tool has been called');

            const parsedInput = JSON.parse(input);
            const result = await this.hederaKit.submitTopicMessage(
                TopicId.fromString(parsedInput.topicId),
                parsedInput.message
            );

            return JSON.stringify({
                status: "success",
                message: "Message submitted",
                topicId: parsedInput.topicId,
                topicMessage: parsedInput.message,
                txHash: result.txHash
            });
        } catch (error: any) {
            return JSON.stringify({
                status: "error",
                message: error.message,
                code: error.code || "UNKNOWN_ERROR",
            });
        }
    }
}

export class NonCustodialHederaSubmitTopicMessageTool extends AbstractHederaSubmitTopicMessageTool {
    constructor(private hederaKit: HederaAgentKit) {
        super();
    }

    protected async _call(input: string): Promise<string> {
        try {
            console.log('hedera_submit_topic_message (non-custodial) tool has been called');

            const parsedInput = JSON.parse(input);
            const txBytes = await this.hederaKit.submitTopicMessageNonCustodial(
                TopicId.fromString(parsedInput.topicId),
                parsedInput.message
            );

            return JSON.stringify({
                status: "success",
                message: "Message submission transaction bytes created successfully",
                txBytes: txBytes,
            });
        } catch (error: any) {
            return JSON.stringify({
                status: "error",
                message: error.message,
                code: error.code || "UNKNOWN_ERROR",
            });
        }
    }
}
