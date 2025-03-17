import { Tool } from "@langchain/core/tools";
import HederaAgentKit from "../../../agent";
import {TopicId} from "@hashgraph/sdk";

abstract class AbstractHederaDeleteTopicTool extends Tool {
    name = 'hedera_delete_topic';

    description = `Delete a topic on Hedera
Inputs (input is a JSON string):
topicId: string, the ID of the topic to delete e.g. 0.0.123456,
Example usage:
1. Delete topic 0.0.123456:
  '{
    "topicId": "0.0.123456"
  }'
`;

    protected constructor() {
        super();
    }
}

export class CustodialHederaDeleteTopicTool extends AbstractHederaDeleteTopicTool {
    constructor(private hederaKit: HederaAgentKit) {
        super();
    }

    protected async _call(input: string): Promise<string> {
        try {
            console.log('hedera_delete_topic (custodial) tool has been called');

            const parsedInput = JSON.parse(input);
            const result = await this.hederaKit.deleteTopic(
                TopicId.fromString(parsedInput.topicId)
            );

            return JSON.stringify({
                status: "success",
                message: "Topic deleted",
                topicId: parsedInput.topicId,
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

export class NonCustodialHederaDeleteTopicTool extends AbstractHederaDeleteTopicTool {
    constructor(private hederaKit: HederaAgentKit) {
        super();
    }

    protected async _call(input: string): Promise<string> {
        try {
            console.log('hedera_delete_topic (non-custodial) tool has been called');

            const parsedInput = JSON.parse(input);
            const txBytes = await this.hederaKit.deleteTopicNonCustodial(
                TopicId.fromString(parsedInput.topicId)
            );

            return JSON.stringify({
                status: "success",
                message: "Topic deletion transaction bytes created successfully",
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
