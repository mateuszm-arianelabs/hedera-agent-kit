import { Tool, ToolRunnableConfig } from "@langchain/core/tools";
import HederaAgentKit from "../../../agent";
import { CallbackManagerForToolRun } from "@langchain/core/callbacks/manager";
import { ExecutorAccountDetails } from "../../../types";
import { getPublicKeyByAccountId } from "../../../utils/api-utils";

export class HederaDissociateTokenTool extends Tool {
    name = 'hedera_dissociate_token';

    description = `Dissociate a token from an account on Hedera
Inputs (input is a JSON string):
tokenId: string, the ID of the token to dissociate e.g. 0.0.123456,
Example usage:
1. Dissociate token 0.0.123456:
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

            if (!isCustodial && !executorAccountDetails.executorPublicKey) {
                if (!executorAccountDetails.executorAccountId)
                    throw new Error("Executor account ID is required for non-custodial mode");

                executorAccountDetails.executorPublicKey = await getPublicKeyByAccountId(
                  this.hederaKit.network,
                  executorAccountDetails.executorAccountId
                );
            }

            console.log(`hedera_dissociate_token tool has been called (${isCustodial ? 'custodial' : 'non-custodial'})`);

            const parsedInput = JSON.parse(input);

            return await this.hederaKit
                .dissociateToken(parsedInput.tokenId, isCustodial, executorAccountDetails)
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
