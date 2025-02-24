import { Tool } from "@langchain/core/tools";
import HederaAgentKit from "../agent";
import * as dotenv from "dotenv";
import {HederaNetworkType} from "../types";

dotenv.config();
export class HederaCreateFungibleTokenTool extends Tool {
  name = 'hedera_create_fungible_token'

  description = `Create a fungible token on Hedera
Inputs ( input is a JSON string ):
name: string, the name of the token e.g. My Token,
symbol: string, the symbol of the token e.g. MT,
decimals: number, the amount of decimals of the token,
initialSupply: number, the initial supply of the token e.g. 100000,
isSupplyKey: boolean, decides whether supply key should be set, false if not passed
isMetadataKey: boolean, decides whether metadata key should be set, false if not passed
isAdminKey: boolean, decides whether admin key should be set, false if not passed
memo: string, containing memo associated with this token, empty string if not passed
tokenMetadata: string, containing metadata associated with this token, empty string if not passed
`

  constructor(private hederaKit: HederaAgentKit) {
    super()
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      const tokenId = (await this.hederaKit.createFT({
        name: parsedInput.name,
        symbol: parsedInput.symbol,
        decimals: parsedInput.decimals,
        initialSupply: parsedInput.initialSupply,
        isSupplyKey: parsedInput.isSupplyKey,
        isAdminKey: parsedInput.isAdminKey,
        isMetadataKey: parsedInput.isMetadataKey,
        memo: parsedInput.memo,
        tokenMetadata: new TextEncoder().encode(parsedInput.tokenMetadata),
      })).tokenId;

      return JSON.stringify({
        status: "success",
        message: "Token creation successful",
        initialSupply: parsedInput.initialSupply,
        tokenId: tokenId.toString(),
        solidityAddress: tokenId.toSolidityAddress(),
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

// FIXME: works well in isolation but normally usually createFT is called instead of createNFT
export class HederaCreateNonFungibleTokenTool extends Tool {
  name = 'hedera_create_fungible_token'

  description = `Create a non fungible (NFT) token on Hedera
Inputs ( input is a JSON string ):
name: string, the name of the token e.g. My Token,
symbol: string, the symbol of the token e.g. MT,
maxSupply: number, the max supply of the token e.g. 100000,
isMetadataKey: boolean, decides whether metadata key should be set, false if not passed
isAdminKey: boolean, decides whether admin key should be set, false if not passed
memo: string, containing memo associated with this token, empty string if not passed
tokenMetadata: string, containing metadata associated with this token, empty string if not passed
`

  constructor(private hederaKit: HederaAgentKit) {
    super()
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      const tokenId = (await this.hederaKit.createNFT({
        name: parsedInput.name,
        symbol: parsedInput.symbol,
        maxSupply: parsedInput.maxSupply,
        isAdminKey: parsedInput.isAdminKey,
        isMetadataKey: parsedInput.isMetadataKey,
        memo: parsedInput.memo,
        tokenMetadata: new TextEncoder().encode(parsedInput.tokenMetadata),
      })).tokenId;

      return JSON.stringify({
        status: "success",
        message: "NFT Token creation successful",
        initialSupply: parsedInput.initialSupply,
        tokenId: tokenId.toString(),
        solidityAddress: tokenId.toSolidityAddress(),
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

export class HederaTransferTokenTool extends Tool {
  name = 'hedera_transfer_token'

  description = `Transfer fungible tokens on Hedera
Inputs ( input is a JSON string ):
tokenId: string, the ID of the token to transfer e.g. 0.0.123456,
toAccountId: string, the account ID to transfer to e.g. 0.0.789012,
amount: number, the amount of tokens to transfer e.g. 100
`

  constructor(private hederaKit: HederaAgentKit) {
    super()
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      
      await this.hederaKit.transferToken(
        parsedInput.tokenId,
        parsedInput.toAccountId,
        parsedInput.amount
      );

      return JSON.stringify({
        status: "success",
        message: "Token transfer successful",
        tokenId: parsedInput.tokenId,
        toAccountId: parsedInput.toAccountId,
        amount: parsedInput.amount
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

export class HederaGetBalanceTool extends Tool {
  name = 'hedera_get_hbar_balance'

  description = `Retrieves the HBAR balance of a specified Hedera account.  
If an account ID is provided, it returns the balance of that account.  
If no input is given (empty JSON '{}'), it returns the balance of the connected account.  

### **Inputs** (optional, input is a JSON string):  
- **accountId** (*string*, optional): The Hedera account ID to check the balance for (e.g., "0.0.789012").  
  - If omitted, the tool will return the balance of the connected account.  

### **Example Usage:**  
1. **Get balance of a specific account:**  
   '{ "accountId": "0.0.123456" }'  
2. **Get balance of the connected account:**  
   '{}'
`


constructor(private hederaKit: HederaAgentKit) {
    super()
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      const balance = await this.hederaKit.getHbarBalance(parsedInput?.accountId);

      return JSON.stringify({
        status: "success",
        balance: balance,
        unit: "HBAR"
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

export class HederaGetHtsBalanceTool extends Tool {
  name = 'hedera_get_hts_balance'

  description = `Retrieves the balance of a specified Hedera Token Service (HTS) token for a given account.  
If an account ID is provided, it returns the balance of that account.  
If no account ID is given, it returns the balance for the connected account.

### **Inputs** (JSON string, required fields specified):  
- **tokenId** (*string*, required): The ID of the token to check the balance for (e.g., "0.0.112233").  
- **accountId** (*string*, optional): The Hedera account ID to check the balance for (e.g., "0.0.789012").  
  - If omitted, the tool will return the balance for the connected account.


### **Example Usage:**  
1. **Get balance of token 0.0.112233 for account "0.0.123456:**  
   '{ "accountId": "0.0.123456", "tokenId":"0.0.112233"}'  
2. **Get balance of of token 0.0.11223 for the connected account:**  
   '{"tokenId":"0.0.112233"}'
`

  constructor(private hederaKit: HederaAgentKit) {
    super()
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      if (!parsedInput.tokenId) {
        throw new Error("tokenId is required");
      }
      if(!process.env.HEDERA_NETWORK) {
        throw new Error("HEDERA_NETWORK environment variable is required");
      }

      const balance = await this.hederaKit.getHtsBalance(
          parsedInput.tokenId,
          process.env.HEDERA_NETWORK as HederaNetworkType,
          parsedInput?.accountId
      )

      const details = await this.hederaKit.getHtsTokenDetails(
          parsedInput?.tokenId,
          process.env.HEDERA_NETWORK as HederaNetworkType
      )

      return JSON.stringify({
        status: "success",
        balance: balance,
        unit: details.symbol
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

export class HederaAirdropTokenTool extends Tool {
  name = 'hedera_airdrop_token'

  description = `Airdrop fungible tokens to multiple accounts on Hedera
Inputs ( input is a JSON string ):
tokenId: string, the ID of the token to airdrop e.g. 0.0.123456,
recipients: array of objects containing:
  - accountId: string, the account ID to send tokens to e.g. 0.0.789012
  - amount: number, the amount of tokens to send e.g. 100
Example input: {
  "tokenId": "0.0.123456",
  "recipients": [
    {"accountId": "0.0.789012", "amount": 100},
    {"accountId": "0.0.789013", "amount": 200}
  ]
}
`

  constructor(private hederaKit: HederaAgentKit) {
    super()
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      
      await this.hederaKit.airdropToken(
        parsedInput.tokenId,
        parsedInput.recipients
      );

      return JSON.stringify({
        status: "success",
        message: "Token airdrop successful",
        tokenId: parsedInput.tokenId,
        recipientCount: parsedInput.recipients.length,
        totalAmount: parsedInput.recipients.reduce((sum: number, r: any) => sum + r.amount, 0)
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

export function createHederaTools(hederaKit: HederaAgentKit): Tool[] {
  return [
    new HederaCreateFungibleTokenTool(hederaKit),
    new HederaTransferTokenTool(hederaKit),
    new HederaGetBalanceTool(hederaKit),
    new HederaAirdropTokenTool(hederaKit),
    new HederaCreateNonFungibleTokenTool(hederaKit),
    new HederaGetHtsBalanceTool(hederaKit),
  ]
}
