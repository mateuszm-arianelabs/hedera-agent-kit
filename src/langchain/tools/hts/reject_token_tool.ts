import { Tool } from "@langchain/core/tools";
import HederaAgentKit from "../../../agent";
import {TokenId} from "@hashgraph/sdk";

abstract class AbstractHederaRejectTokenTool extends Tool {
    name = 'hedera_reject_token';

    description = `Reject a token from an account on Hedera
Inputs (input is a JSON string):
tokenId: string, the ID of the token to reject e.g. 0.0.123456,
Example usage:
1. Reject token 0.0.123456:
  '{
    "tokenId": "0.0.123456"
  }'
`;

    protected constructor() {
        super();
    }
}

export class CustodialHederaRejectTokenTool extends AbstractHederaRejectTokenTool {
    constructor(private hederaKit: HederaAgentKit) {
        super();
    }

    protected async _call(input: string): Promise<string> {
        try {
            console.log('hedera_reject_token (custodial) tool has been called');

            const parsedInput = JSON.parse(input);

            const result = await this.hederaKit.rejectToken(
                TokenId.fromString(parsedInput.tokenId)
            );

            return JSON.stringify({
                status: "success",
                message: "Token rejection successful",
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

export class NonCustodialHederaRejectTokenTool extends AbstractHederaRejectTokenTool {
    constructor(private hederaKit: HederaAgentKit) {
        super();
    }

    protected async _call(input: string): Promise<string> {
        try {
            console.log('hedera_reject_token (non-custodial) tool has been called');

            const parsedInput = JSON.parse(input);

            const txBytes = await this.hederaKit.rejectTokenNonCustodial(
                TokenId.fromString(parsedInput.tokenId)
            );

            return JSON.stringify({
                status: "success",
                message: "Token rejection transaction bytes created successfully",
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
