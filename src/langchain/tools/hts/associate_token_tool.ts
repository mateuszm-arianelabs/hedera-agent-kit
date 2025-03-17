import { Tool } from "@langchain/core/tools";
import HederaAgentKit from "../../../agent";

abstract class AbstractHederaAssociateTokenTool extends Tool {
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

    protected constructor() {
        super();
    }
}

export class CustodialHederaAssociateTokenTool extends AbstractHederaAssociateTokenTool {
    constructor(private hederaKit: HederaAgentKit) {
        super();
    }

    protected async _call(input: string): Promise<string> {
        try {
            console.log('hedera_associate_token (custodial) tool has been called');

            const parsedInput = JSON.parse(input);

            const result = await this.hederaKit.associateToken(
                parsedInput.tokenId
            );

            return JSON.stringify({
                status: "success",
                message: "Token association successful",
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

export class NonCustodialHederaAssociateTokenTool extends AbstractHederaAssociateTokenTool {
    constructor(private hederaKit: HederaAgentKit) {
        super();
    }

    protected async _call(input: string): Promise<string> {
        try {
            console.log('hedera_associate_token (non-custodial) tool has been called');

            const parsedInput = JSON.parse(input);

            const txBytes = await this.hederaKit.associateTokenNonCustodial(
                parsedInput.tokenId
            );

            return JSON.stringify({
                status: "success",
                message: "Token association transaction bytes created successfully",
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
