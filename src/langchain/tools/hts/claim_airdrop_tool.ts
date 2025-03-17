import { Tool } from "@langchain/core/tools";
import HederaAgentKit from "../../../agent";
import {AccountId, PendingAirdropId, TokenId} from "@hashgraph/sdk";

abstract class AbstractHederaClaimAirdropTool extends Tool {
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

    protected constructor() {
        super();
    }
}

export class CustodialHederaClaimAirdropTool extends AbstractHederaClaimAirdropTool {
    constructor(private hederaKit: HederaAgentKit) {
        super();
    }

    protected async _call(input: string): Promise<string> {
        try {
            console.log('hedera_claim_airdrop (custodial) tool has been called');

            const parsedInput = JSON.parse(input);
            const airdropId = new PendingAirdropId({
                tokenId: TokenId.fromString(parsedInput.tokenId),
                senderId: AccountId.fromString(parsedInput.senderAccountId),
                receiverId: this.hederaKit.client.operatorAccountId!
            });
            const result = await this.hederaKit.claimAirdrop(airdropId);

            return JSON.stringify({
                status: "success",
                message: "Airdrop claim successful",
                tokenId: parsedInput.tokenId,
                senderAccountId: parsedInput.senderAccountId,
                receiverAccountId: AccountId.fromString(process.env.HEDERA_ACCOUNT_ID!),
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

export class NonCustodialHederaClaimAirdropTool extends AbstractHederaClaimAirdropTool {
    constructor(private hederaKit: HederaAgentKit) {
        super();
    }

    protected async _call(input: string): Promise<string> {
        try {
            console.log('hedera_claim_airdrop (non-custodial) tool has been called');

            const parsedInput = JSON.parse(input);
            const airdropId = new PendingAirdropId({
                tokenId: TokenId.fromString(parsedInput.tokenId),
                senderId: AccountId.fromString(parsedInput.senderAccountId),
                receiverId: this.hederaKit.client.operatorAccountId!
            });
            const txBytes = await this.hederaKit.claimAirdropNonCustodial(airdropId);

            return JSON.stringify({
                status: "success",
                message: "Airdrop claim transaction bytes created successfully",
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
