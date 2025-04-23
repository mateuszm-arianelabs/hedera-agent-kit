import { Tool, ToolRunnableConfig } from "@langchain/core/tools";
import HederaAgentKit from "../../../agent";
import { CallbackManagerForToolRun } from "@langchain/core/callbacks/manager";
import { ExecutorAccountDetails } from "../../../types";
import { optionalFetchPublicKey } from "../../../utils/langchain-tools-utils";

export class HederaAssociateTokenTool extends Tool {
    name = 'hedera_associate_token';

    description = `Associate a token to an account on Hedera
Inputs (input is a JSON string):
tokenId: string, the ID of the token to associate e.g. 0.0.123456,
Example usage:
1. Associate token 0.0.123456:
  '{
    "tokenId": "0.0.123456"
  }'
`;

    constructor(private hederaKit: HederaAgentKit) {
        super();
    }

    protected override async _call(input: any, _runManager?: CallbackManagerForToolRun, config?: ToolRunnableConfig): Promise<string> {
        try {
            const isCustodial = config?.configurable?.isCustodial === true;
            const executorAccountDetails: ExecutorAccountDetails = config?.configurable?.executorAccountDetails;

            if (!isCustodial && !executorAccountDetails) {
                throw new Error("Executor account details are required for non-custodial mode.");
            }

            if (executorAccountDetails) {
                executorAccountDetails.executorPublicKey = await optionalFetchPublicKey(
                  isCustodial,
                  executorAccountDetails,
                  this.hederaKit.network
                );
            }

            console.log(`hedera_associate_token tool has been called (${isCustodial ? 'custodial' : 'non-custodial'})`);

            const parsedInput = JSON.parse(input);
            return await this.hederaKit
                .associateToken(parsedInput.tokenId, isCustodial, executorAccountDetails)
                .then(response => response.getStringifiedResponse());

        } catch (error: any) {
            return JSON.stringify({
                status: "error",
                message: error.message,
                code: error.code || "UNKNOWN_ERROR",
            });
        }
    }
}
