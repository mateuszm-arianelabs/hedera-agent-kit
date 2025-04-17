import { Tool, ToolRunnableConfig } from "@langchain/core/tools";
import HederaAgentKit from "../../../agent";
import { ExecutorAccountDetails, HederaNetworkType } from "../../../types";
import { CallbackManagerForToolRun } from "@langchain/core/callbacks/manager";

export class HederaGetAllTokenBalancesTool extends Tool {
    name = 'hedera_get_all_token_balances'

    description = `Get all token balances for an account on Hedera
Inputs ( input is a JSON string ):
accountId : string, the account ID to get the token balances for e.g. 0.0.789012,
- **accountId** (*string*, optional): The Hedera account ID to check the balance for (e.g., "0.0.789012").  
  - If omitted, the tool will return the balance of the connected account.  

Example usage:
1. Get all token balances for account 0.0.789012:
  '{
    "accountId": "0.0.789012"
  }'
2. Get all token balances for the connected account:
   '{}'
`

    constructor(private hederaKit: HederaAgentKit) {
        super()
    }

    protected override async _call(input: any, _runManager?: CallbackManagerForToolRun, config?: ToolRunnableConfig): Promise<string> {
        try {
            const isCustodial = config?.configurable?.isCustodial === true;
            const executorAccountDetails: ExecutorAccountDetails = config?.configurable?.executorAccountDetails;


            const parsedInput = input ? JSON.parse(input) : {};

            // returns both display and base unit balances
            const balances = await this.hederaKit.getAllTokensBalances(
                process.env.HEDERA_NETWORK_TYPE as HederaNetworkType,
                parsedInput.accountId,
                isCustodial,
                executorAccountDetails,
            );

            return JSON.stringify({
                status: "success",
                message: "Token balances retrieved",
                balances: balances
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