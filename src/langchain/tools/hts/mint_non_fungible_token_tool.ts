import { Tool } from "@langchain/core/tools";
import HederaAgentKit from "../../../agent";

abstract class AbstractHederaMintNFTTool extends Tool {
    name = 'hedera_mint_nft';

    description = `Mint an NFT to an account on Hedera
Inputs (input is a JSON string):
tokenId: string, the ID of the token to mint e.g. 0.0.123456,
tokenMetadata: string, the metadata of the NFT e.g. "My NFT",
Example usage:
1. Mint an NFT with metadata "My NFT" to token 0.0.123456:
  '{
    "tokenId": "0.0.123456",
    "tokenMetadata": "My NFT"
  }'
`;

    protected constructor() {
        super();
    }
}

export class CustodialHederaMintNFTTool extends AbstractHederaMintNFTTool {
    constructor(private hederaKit: HederaAgentKit) {
        super();
    }

    protected async _call(input: string): Promise<string> {
        try {
            console.log('hedera_mint_nft (custodial) tool has been called');

            const parsedInput = JSON.parse(input);

            const result = await this.hederaKit.mintNFTToken(
                parsedInput.tokenId,
                parsedInput.tokenMetadata
            );

            return JSON.stringify({
                status: "success",
                message: "NFT minting successful",
                tokenId: parsedInput.tokenId,
                tokenMetadata: new TextEncoder().encode(parsedInput.tokenMetadata), // encoding to Uint8Array
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

export class NonCustodialHederaMintNFTTool extends AbstractHederaMintNFTTool {
    constructor(private hederaKit: HederaAgentKit) {
        super();
    }

    protected async _call(input: string): Promise<string> {
        try {
            console.log('hedera_mint_nft (non-custodial) tool has been called');

            const parsedInput = JSON.parse(input);

            const txBytes = await this.hederaKit.mintNFTTokenNonCustodial(
                parsedInput.tokenId,
                parsedInput.tokenMetadata
            );

            return JSON.stringify({
                status: "success",
                message: "NFT minting transaction bytes created successfully",
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
