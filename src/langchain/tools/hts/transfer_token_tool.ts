import { Tool } from "@langchain/core/tools";
import HederaAgentKit from "../../../agent";
import {getHTSDecimals, toBaseUnit} from "../../../utils/hts-format-utils";
import {HederaNetworkType} from "../../../types";

abstract class AbstractHederaTransferTokenTool extends Tool {
    name = 'hedera_transfer_token';

    description = `Transfer fungible tokens on Hedera
Inputs (input is a JSON string):
tokenId: string, the ID of the token to transfer e.g. 0.0.123456,
toAccountId: string, the account ID to transfer to e.g. 0.0.789012,
amount: number, the amount of tokens to transfer e.g. 100 in base unit
`;

    protected constructor() {
        super();
    }
}

export class CustodialHederaTransferTokenTool extends AbstractHederaTransferTokenTool {
    constructor(private hederaKit: HederaAgentKit) {
        super();
    }

    protected async _call(input: string): Promise<string> {
        try {
            console.log('hedera_transfer_token (custodial) tool has been called');

            const parsedInput = JSON.parse(input);
            const amount = await toBaseUnit(
                parsedInput.tokenId,
                parsedInput.amount,
                this.hederaKit.network
            );

            const successResponse = await this.hederaKit.transferToken(
                parsedInput.tokenId,
                parsedInput.toAccountId,
                Number(amount.toString())
            );

            const decimals = getHTSDecimals(
                parsedInput.tokenId,
                process.env.HEDERA_NETWORK as HederaNetworkType
            );

            return JSON.stringify({
                status: "success",
                message: "Token transfer successful",
                tokenId: parsedInput.tokenId,
                toAccountId: parsedInput.toAccountId,
                amount: parsedInput.amount,
                txHash: successResponse.txHash,
                decimals: decimals,
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

export class NonCustodialHederaTransferTokenTool extends AbstractHederaTransferTokenTool {
    constructor(private hederaKit: HederaAgentKit) {
        super();
    }

    protected async _call(input: string): Promise<string> {
        try {
            console.log('hedera_transfer_token (non-custodial) tool has been called');

            const parsedInput = JSON.parse(input);
            const amount = await toBaseUnit(
                parsedInput.tokenId,
                parsedInput.amount,
                this.hederaKit.network
            );

            const txBytes = await this.hederaKit.transferTokenNonCustodial(
                parsedInput.tokenId,
                parsedInput.toAccountId,
                Number(amount.toString())
            );

            return JSON.stringify({
                status: "success",
                message: "Token transfer transaction bytes created successfully",
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