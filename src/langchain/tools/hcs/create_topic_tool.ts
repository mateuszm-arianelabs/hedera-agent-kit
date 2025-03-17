import { Tool } from "@langchain/core/tools";
import HederaAgentKit from "../../../agent";
import { CreateTopicResult } from "../../../types";

export abstract class AbstractHederaCreateTopicTool extends Tool {
    name = 'hedera_create_topic'

    description = `Create a topic on Hedera
Inputs ( input is a JSON string ):
name: string, the name of the topic e.g. My Topic,
isSubmitKey: boolean, decides whether submit key should be set, false if not passed
Example usage:
1. Create a topic with memo "My Topic":
  '{
    "name": "My Topic",
    "isSubmitKey": false
  }'
2. Create a topic with memo "My Topic". Restrict posting with a key:
  '{
    "name": "My Topic",
    "isSubmitKey": true
  }'
3. Create a topic with memo "My Topic". Do not set a submit key:
  '{
    "name": "My Topic",
    "isSubmitKey": false
  }'
`

    protected constructor() {
        super()
    }

    protected async _call(input: string): Promise<string> {
        return Promise.resolve('');
    }

}
export class CustodialHederaCreateTopicTool extends AbstractHederaCreateTopicTool {
    constructor(private hederaKit: HederaAgentKit) {
        super();
    }

    protected override async _call(input: string): Promise<string> {
        try {
            console.log('hedera_create_topic tool (custodial) has been called');
            const parsedInput = JSON.parse(input);
            const result  = await this.hederaKit.createTopic(
                parsedInput.name,
                parsedInput.isSubmitKey
            ) as CreateTopicResult;

            return JSON.stringify({
                status: "success",
                message: "Topic created",
                topicId: result.topicId,
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

export class NonCustodialHederaCreateTopicTool extends AbstractHederaCreateTopicTool {
    constructor(private hederaKit: HederaAgentKit) {
        super();
    }

    protected override async _call(input: string): Promise<string> {
        try {
            console.log('hedera_create_topic tool (non-custodial) has been called');
            const parsedInput = JSON.parse(input);
            const txBytes = await this.hederaKit.createTopicNonCustodial(
                parsedInput.name,
                parsedInput.isSubmitKey,
            ) as string;
            return JSON.stringify({
                status: "success",
                txBytes: txBytes,
                message: `Topic creation transaction bytes have been successfully created.`,
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

