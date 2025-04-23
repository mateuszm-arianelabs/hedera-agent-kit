import { Tool, ToolRunnableConfig } from "@langchain/core/tools";
import HederaAgentKit from "../../../agent";
import { CallbackManagerForToolRun } from "@langchain/core/callbacks/manager";
import { ExecutorAccountDetails } from "../../../types";
import { optionalFetchPublicKey } from "../../../utils/langchain-tools-utils";

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

    protected override async _call(input: any, _runManager?: CallbackManagerForToolRun, config?: ToolRunnableConfig): Promise<string> {
        try {
            const isCustodial = config?.configurable?.isCustodial === true;
            const executorAccountDetails: ExecutorAccountDetails = config?.configurable?.executorAccountDetails;

            if (!isCustodial && !executorAccountDetails) {
                throw new Error("Executor account details are required for non-custodial mode.");
            }

            if (executorAccountDetails) {
                executorAccountDetails.executorPublicKey = await optionalFetchPublicKey(
                  isCustodial,
                  executorAccountDetails,
                  this.hederaKit.network
                );
            }

            console.log('hedera_get_hbar_balance tool has been called')

            const parsedInput = JSON.parse(input);

            const balance = await this.hederaKit.getHbarBalance(
              parsedInput?.accountId,
              isCustodial,
              executorAccountDetails
            );

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