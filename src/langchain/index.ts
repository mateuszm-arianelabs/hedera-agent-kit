import { Tool } from "@langchain/core/tools";
import HederaAgentKit from "../agent";


export class HederaCreateFungibleTokenTool extends Tool {
  name = 'hedera_create_fungible_token'

  description = `Create a fungible token on Hedera
Inputs ( input is a JSON string ):
name: string, the name of the token e.g. My Token,
symbol: string, the symbol of the token e.g. MT,
decimals: number, the amount of decimals of the token
initialSupply: number, the initial supply of the token e.g. 100000
`

  constructor(private hederaKit: HederaAgentKit) {
    super()
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      const tokenId = (await this.hederaKit.createFT(
          parsedInput.name,
          parsedInput.symbol,
          parsedInput.decimals,
          parsedInput.initialSupply
      )).tokenId;

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

  description = `Get the HBAR balance of the connected account
This tool takes no inputs, just pass an empty string or '{}'
`

  constructor(private hederaKit: HederaAgentKit) {
    super()
  }

  protected async _call(input: string): Promise<string> {
    try {
      const balance = await this.hederaKit.getHbarBalance();

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
    new HederaAirdropTokenTool(hederaKit)
  ]
}
