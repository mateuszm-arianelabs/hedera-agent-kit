import { Tool } from "@langchain/core/tools";
import HederaAgentKit from "../../../agent";

abstract class AbstractHederaTransferHbarTool extends Tool {
    name = 'hedera_transfer_native_hbar_token';

    description = `Transfer HBAR to an account on Hedera
Inputs (input is a JSON string):
toAccountId: string, the account ID to transfer to e.g. 0.0.789012,
amount: number, the amount of HBAR to transfer e.g. 100,
Example usage:
1. Transfer 100 HBAR to account 0.0.789012:
  '{
    "toAccountId": "0.0.789012",
    "amount": 100
  }'
`;

    protected constructor() {
        super();
    }
}

export class CustodialHederaTransferHbarTool extends AbstractHederaTransferHbarTool {
    constructor(private hederaKit: HederaAgentKit) {
        super();
    }

    protected async _call(input: string): Promise<string> {
        try {
            console.log('hedera_transfer_native_hbar_token (custodial) tool has been called');

            const parsedInput = JSON.parse(input);

            const result = await this.hederaKit.transferHbar(
                parsedInput.toAccountId,
                parsedInput.amount
            );

            return JSON.stringify({
                status: "success",
                message: "HBAR transfer successful",
                toAccountId: parsedInput.toAccountId,
                amount: parsedInput.amount,
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

export class NonCustodialHederaTransferHbarTool extends AbstractHederaTransferHbarTool {
    constructor(private hederaKit: HederaAgentKit) {
        super();
    }

    protected async _call(input: string): Promise<string> {
        try {
            console.log('hedera_transfer_native_hbar_token (non-custodial) tool has been called');

            const parsedInput = JSON.parse(input);

            const txBytes = await this.hederaKit.transferHbarNonCustodial(
                parsedInput.toAccountId,
                parsedInput.amount
            );

            return JSON.stringify({
                status: "success",
                message: "HBAR transfer transaction bytes created successfully",
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
