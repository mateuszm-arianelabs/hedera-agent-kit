import { AccountId, Client, TokenId } from "@hashgraph/sdk";
import { transfer_token_non_custodial } from "../../tools";
import { HederaNetworkType } from "../../types";

export default class NoncustodialHederaAgentKit {

    private client: Client;

    constructor(networkType: HederaNetworkType) {
        if (networkType === "mainnet") {
            this.client = Client.forMainnet();
        } else if (networkType === "testnet") {
            this.client = Client.forTestnet();
        } else if (networkType === "previewnet") {
            this.client = Client.forPreviewnet();
        } else {
            throw new Error("Invalid network type");
        }
    }

    async transferToken(
        tokenId: string | TokenId,
        toAccountId: string | AccountId,
        amount: number,
        fromAccountId: string | AccountId,
    ): Promise<string> {
        return transfer_token_non_custodial(
            tokenId,
            toAccountId,
            amount,
            fromAccountId,
            this.client
        )
    }
}