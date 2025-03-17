import { Tool } from "@langchain/core/tools";
import HederaAgentKit from "../../../agent";

abstract class AbstractHederaMintFungibleTokenTool extends Tool {
    name = 'hedera_mint_fungible_token';

    description = `Mint fungible tokens to an account on Hedera
Inputs (input is a JSON string):
tokenId: string, the ID of the token to mint e.g. 0.0.123456,
amount: number, the amount of tokens to mint e.g. 100,
Example usage:
1. Mint 100 of token 0.0.123456 to account 0.0.789012:
  '{
    "tokenId": "0.0.123456",
    "amount": 100
  }'
`;

    protected constructor() {
        super();
    }
}

export class CustodialHederaMintFungibleTokenTool extends AbstractHederaMintFungibleTokenTool {
    constructor(private hederaKit: HederaAgentKit) {
        super();
    }

    protected async _call(input: string): Promise<string> {
        try {
            console.log('hedera_mint_fungible_token (custodial) tool has been called');

            const parsedInput = JSON.parse(input);

            const result = await this.hederaKit.mintToken(
                parsedInput.tokenId,
                parsedInput.amount // given in base unit
            );

            return JSON.stringify({
                status: "success",
                message: "Token minting successful",
                tokenId: parsedInput.tokenId,
                amount: parsedInput.amount, // in base unit
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

export class NonCustodialHederaMintFungibleTokenTool extends AbstractHederaMintFungibleTokenTool {
    constructor(private hederaKit: HederaAgentKit) {
        super();
    }

    protected async _call(input: string): Promise<string> {
        try {
            console.log('hedera_mint_fungible_token (non-custodial) tool has been called');

            const parsedInput = JSON.parse(input);

            const txBytes = await this.hederaKit.mintTokenNonCustodial(
                parsedInput.tokenId,
                parsedInput.amount // given in base unit
            );

            return JSON.stringify({
                status: "success",
                message: "Token minting transaction bytes created successfully",
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
