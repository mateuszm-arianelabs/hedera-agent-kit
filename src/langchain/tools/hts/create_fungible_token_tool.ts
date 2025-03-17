import { Tool } from "@langchain/core/tools";
import HederaAgentKit from "../../../agent";


abstract class AbstractHederaCreateFungibleTokenTool extends Tool {
    name = 'hedera_create_fungible_token'

    description = `Create a fungible token on Hedera
Inputs ( input is a JSON string ):
name: string, the name of the token e.g. My Token,
symbol: string, the symbol of the token e.g. MT,
decimals: number, the amount of decimals of the token,
initialSupply: number, optional, the initial supply of the token, given in base unit, if not passed set to undefined
isSupplyKey: boolean, decides whether supply key should be set, false if not passed
isMetadataKey: boolean, decides whether metadata key should be set, false if not passed
isAdminKey: boolean, decides whether admin key should be set, false if not passed
memo: string, containing memo associated with this token, empty string if not passed
tokenMetadata: string, containing metadata associated with this token, empty string if not passed
`

    protected constructor() {
        super();
    }

}

export class CustodialHederaCreateFungibleTokenTool extends AbstractHederaCreateFungibleTokenTool {
    constructor(private hederaKit: HederaAgentKit) {
        super();
    }

    protected async _call(input: string): Promise<string> {
        console.log('hedera_create_fungible_token (custodial) tool has been called')
        try {
            const parsedInput = JSON.parse(input);

            const result = (await this.hederaKit.createFT({
                name: parsedInput.name,
                symbol: parsedInput.symbol,
                decimals: parsedInput.decimals,
                initialSupply: parsedInput.initialSupply, // given in base unit
                isSupplyKey: parsedInput.isSupplyKey,
                isAdminKey: parsedInput.isAdminKey,
                isMetadataKey: parsedInput.isMetadataKey,
                memo: parsedInput.memo,
                tokenMetadata: new TextEncoder().encode(parsedInput.tokenMetadata), // encoding to Uint8Array
            }));

            console.log(`Result inside hedera_create_fungible_token: ` + JSON.stringify(result, null, 2));

            return JSON.stringify({
                status: "success",
                message: "Token creation successful",
                initialSupply: parsedInput.initialSupply,
                tokenId: result.tokenId.toString(),
                decimals: parsedInput.decimals,
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

export class NonCustodialHederaCreateFungibleTokenTool extends AbstractHederaCreateFungibleTokenTool {
    constructor(private hederaKit: HederaAgentKit) {
        super()
    }

    protected async _call(input: string): Promise<string> {
        console.log('hedera_create_fungible_token (non custodial) tool has been called')
        try {
            const parsedInput = JSON.parse(input);

            const txBytes = (await this.hederaKit.createFTNonCustodial({
                name: parsedInput.name,
                symbol: parsedInput.symbol,
                decimals: parsedInput.decimals,
                initialSupply: parsedInput.initialSupply, // given in base unit
                isSupplyKey: parsedInput.isSupplyKey,
                isAdminKey: parsedInput.isAdminKey,
                isMetadataKey: parsedInput.isMetadataKey,
                memo: parsedInput.memo,
                tokenMetadata: new TextEncoder().encode(parsedInput.tokenMetadata), // encoding to Uint8Array
            }));

            return JSON.stringify({
                status: "success",
                message: `Fungible token creation transaction bytes created successfully`,
                txBytes: txBytes,
                initialSupply: parsedInput.initialSupply,
                decimals: parsedInput.decimals,
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
