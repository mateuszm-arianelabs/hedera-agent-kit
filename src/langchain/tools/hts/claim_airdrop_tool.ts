import { Tool, ToolRunnableConfig } from "@langchain/core/tools";
import HederaAgentKit from "../../../agent";
import { AccountId, PendingAirdropId, TokenId } from "@hashgraph/sdk";
import { CallbackManagerForToolRun } from "@langchain/core/callbacks/manager";
import { ExecutorAccountDetails } from "../../../types";
import { getPublicKeyByAccountId } from "../../../utils/api-utils";

export class HederaClaimAirdropTool extends Tool {
    name = 'hedera_claim_airdrop';

    description = `Claim an airdrop for a token on Hedera
Inputs (input is a JSON string):
tokenId: string, the ID of the token to claim the airdrop for e.g. 0.0.123456,
senderAccountId: string, the account ID of the sender e.g. 0.0.789012,
Example usage:
1. Claim an airdrop for token 0.0.123456 from account 0.0.789012:
  '{
    "tokenId": "0.0.123456",
    "senderAccountId": "0.0.789012"
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

            console.log(`hedera_claim_airdrop tool has been called (${isCustodial ? 'custodial' : 'non-custodial'})`);

            const parsedInput = JSON.parse(input);
            const airdropId = new PendingAirdropId({
                tokenId: TokenId.fromString(parsedInput.tokenId),
                senderId: AccountId.fromString(parsedInput.senderAccountId),
                receiverId: this.hederaKit.client.operatorAccountId!
            });

            return await this.hederaKit
                .claimAirdrop(airdropId, isCustodial, executorAccountDetails)
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
