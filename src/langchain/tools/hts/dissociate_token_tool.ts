import { Tool } from "@langchain/core/tools";
import HederaAgentKit from "../../../agent";

abstract class AbstractHederaDissociateTokenTool extends Tool {
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

    protected constructor() {
        super();
    }
}

export class CustodialHederaDissociateTokenTool extends AbstractHederaDissociateTokenTool {
    constructor(private hederaKit: HederaAgentKit) {
        super();
    }

    protected async _call(input: string): Promise<string> {
        try {
            console.log('hedera_dissociate_token (custodial) tool has been called');

            const parsedInput = JSON.parse(input);

            const result = await this.hederaKit.dissociateToken(
                parsedInput.tokenId
            );

            return JSON.stringify({
                status: "success",
                message: "Token dissociation successful",
                tokenId: parsedInput.tokenId,
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

export class NonCustodialHederaDissociateTokenTool extends AbstractHederaDissociateTokenTool {
    constructor(private hederaKit: HederaAgentKit) {
        super();
    }

    protected async _call(input: string): Promise<string> {
        try {
            console.log('hedera_dissociate_token (non-custodial) tool has been called');

            const parsedInput = JSON.parse(input);

            const txBytes = await this.hederaKit.dissociateTokenNonCustodial(
                parsedInput.tokenId
            );

            return JSON.stringify({
                status: "success",
                message: "Token dissociation transaction bytes created successfully",
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