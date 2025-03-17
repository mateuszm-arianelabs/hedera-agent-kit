import { Tool } from "@langchain/core/tools";
import HederaAgentKit from "../../../agent";

abstract class AbstractHederaAirdropTokenTool extends Tool {
    name = 'hedera_airdrop_token';

    description = `Airdrop fungible tokens to multiple accounts on Hedera
Inputs (input is a JSON string):
tokenId: string, the ID of the token to airdrop e.g. 0.0.123456,
recipients: array of objects containing:
  - accountId: string, the account ID to send tokens to e.g. 0.0.789012
  - amount: number, the amount of tokens to send e.g. 100
Example usage:
1. Airdrop 100 tokens to account 0.0.789012 and 200 tokens to account 0.0.789013:
  '{
    "tokenId": "0.0.123456",
    "recipients": [
    {"accountId": "0.0.789012", "amount": 100},
    {"accountId": "0.0.789013", "amount": 200}
  ]
}'
`;

    protected constructor() {
        super();
    }
}

export class CustodialHederaAirdropTokenTool extends AbstractHederaAirdropTokenTool {
    constructor(private hederaKit: HederaAgentKit) {
        super();
    }

    protected async _call(input: string): Promise<string> {
        try {
            console.log('hedera_airdrop_token (custodial) tool has been called');

            const parsedInput = JSON.parse(input);

            const result = await this.hederaKit.airdropToken(
                parsedInput.tokenId,
                parsedInput.recipients // token amounts given in base unit
            );

            return JSON.stringify({
                status: "success",
                message: "Token airdrop successful",
                tokenId: parsedInput.tokenId,
                recipientCount: parsedInput.recipients.length,
                totalAmount: parsedInput.recipients.reduce((sum: number, r: any) => sum + r.amount, 0),
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

export class NonCustodialHederaAirdropTokenTool extends AbstractHederaAirdropTokenTool {
    constructor(private hederaKit: HederaAgentKit) {
        super();
    }

    protected async _call(input: string): Promise<string> {
        try {
            console.log('hedera_airdrop_token (non-custodial) tool has been called');

            const parsedInput = JSON.parse(input);

            const txBytes = await this.hederaKit.airdropTokenNonCustodial(
                parsedInput.tokenId,
                parsedInput.recipients
            );

            return JSON.stringify({
                status: "success",
                message: "Token airdrop transaction bytes created successfully",
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
