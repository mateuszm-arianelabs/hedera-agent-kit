import { Tool } from "@langchain/core/tools";
import HederaAgentKit from "../../../agent";

abstract class AbstractHederaCreateNonFungibleTokenTool extends Tool {
    name = 'hedera_create_non_fungible_token'

    description = `Create a non-fungible (NFT) token on Hedera.

Inputs (input is a JSON string):
- name: string (e.g. "My Token")
- symbol: string (e.g. "MT")
- maxSupply: number (optional), the maximum supply of the token. If not provided, this field will be omitted in the response. **This must be explicitly set if needed**.
- isMetadataKey: boolean, determines whether a metadata key should be set. Defaults to \`false\` if not provided.
- isAdminKey: boolean, determines whether an admin key should be set. Defaults to \`false\` if not provided.
- memo: string, containing a memo associated with the token. Defaults to an empty string if not provided.
- tokenMetadata: string, containing metadata associated with the token. Defaults to an empty string if not provided.

**Note**:
- If \`tokenMetadata\` is passed, it does not automatically set \`isMetadataKey\` to \`true\`. The keys must be set explicitly.
- The \`maxSupply\` field must be explicitly provided if you want it to be included. If not provided, it will not appear in the response.
`

    protected constructor() {
        super();
    }

}

export class CustodialHederaCreateNonFungibleTokenTool extends AbstractHederaCreateNonFungibleTokenTool {
    constructor(private hederaKit: HederaAgentKit) {
        super();
    }

    protected async _call(input: string): Promise<string> {
        try {
            console.log('hedera_create_non_fungible_token (custodial) tool has been called')

            const parsedInput = JSON.parse(input);

            const result = (await this.hederaKit.createNFT({
                name: parsedInput.name,
                symbol: parsedInput.symbol,
                maxSupply: parsedInput.maxSupply, // given in base unit, NFTs have decimals equal zero so display and base units are the same
                isAdminKey: parsedInput.isAdminKey,
                isMetadataKey: parsedInput.isMetadataKey,
                memo: parsedInput.memo,
                tokenMetadata: new TextEncoder().encode(parsedInput.tokenMetadata), // encoding to Uint8Array
            }));

            return JSON.stringify({
                status: "success",
                message: "NFT Token creation successful",
                initialSupply: parsedInput.initialSupply,
                tokenId: result.tokenId.toString(),
                solidityAddress: result.tokenId.toSolidityAddress(),
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

export class NonCustodialHederaCreateNonFungibleTokenTool extends AbstractHederaCreateNonFungibleTokenTool {
    constructor(private hederaKit: HederaAgentKit) {
        super();
    }

    protected async _call(input: string): Promise<string> {
        try {
            console.log('hedera_create_non_fungible_token (non-custodial) tool has been called')

            const parsedInput = JSON.parse(input);

            const txBytes = (await this.hederaKit.createNFTNonCustodial({
                name: parsedInput.name,
                symbol: parsedInput.symbol,
                maxSupply: parsedInput.maxSupply, // given in base unit, NFTs have decimals equal zero so display and base units are the same
                isAdminKey: parsedInput.isAdminKey,
                isMetadataKey: parsedInput.isMetadataKey,
                memo: parsedInput.memo,
                tokenMetadata: new TextEncoder().encode(parsedInput.tokenMetadata), // encoding to Uint8Array
            }));

            return JSON.stringify({
                status: "success",
                message: `NFT token creation transaction bytes created successfully`,
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
