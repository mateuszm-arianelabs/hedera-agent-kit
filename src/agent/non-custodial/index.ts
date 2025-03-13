import { AccountId, Client, PendingAirdropId, PublicKey, TokenId, TokenType } from "@hashgraph/sdk";
import {
    transfer_token_non_custodial
} from "../../tools";
import {
    CreateFTOptions,
    HederaNetworkType,
} from "../../types";
import { associate_token_non_custodial } from "../../tools/hts/transactions/non-custodial/associate_token";
import { create_token_non_custodial } from "../../tools/hts/transactions/non-custodial/create_token";
import { claim_airdrop_non_custodial } from "../../tools/hts/transactions/non-custodial/claim_airdrop";
import { dissociate_token_non_custodial } from "../../tools/hts/transactions/non-custodial/dissociate_token";
import { mint_nft_non_custodial } from "../../tools/hts/transactions/non-custodial/mint_nft";
import { mint_token_non_custodial } from "../../tools/hts/transactions/non-custodial/mint_token";
import { reject_token_non_custodial } from "../../tools/hts/transactions/non-custodial/reject_token";
import { AirdropRecipient } from "../../tools/hts/transactions/custodial/airdrop";
import { airdrop_token_non_custodial } from "../../tools/hts/transactions/non-custodial/airdrop";

export default class NonCustodialHederaAgentKit {

    private client: Client;
    public publicKey: PublicKey;
    public issuerAccountId: string | AccountId;
    readonly network: HederaNetworkType;

    constructor(issuerAccountId: string, publicKey: string, network: HederaNetworkType) {
        if (network === "mainnet") {
            this.client = Client.forMainnet();
        } else if (network === "testnet") {
            this.client = Client.forTestnet();
        } else if (network === "previewnet") {
            this.client = Client.forPreviewnet();
        } else {
            throw new Error("Invalid network type");
        }

        this.network = network;
        this.publicKey = PublicKey.fromString(publicKey);
        this.issuerAccountId = issuerAccountId;
    }

    async transferToken(
        tokenId: string | TokenId,
        toAccountId: string | AccountId,
        amount: number,
    ): Promise<string> {
        return transfer_token_non_custodial(
            this.client,
            tokenId,
            toAccountId,
            amount,
            this.issuerAccountId
        )
    }

    async associateToken(
        tokenId: TokenId,
    ): Promise<string> {
        return associate_token_non_custodial(
            this.client,
            tokenId,
            this.issuerAccountId

        )
    }

    async airdropToken(
        tokenId: TokenId,
        recipients: AirdropRecipient[]
    ): Promise<string> {
        return airdrop_token_non_custodial(
            this.client,
            tokenId,
            recipients,
            this.issuerAccountId
        )
    }

    async claimAirdrop(
        client: Client,
        airdropId: PendingAirdropId
    ): Promise<string> {
        return claim_airdrop_non_custodial(
            this.client,
            airdropId,
            this.issuerAccountId
        )
    }

    async createFT(options: CreateFTOptions) : Promise<string> {
        const optionsFT = {
            ...options,
            tokenType: TokenType.FungibleCommon,
        }

        return create_token_non_custodial(
            this.client,
            this.publicKey,
            optionsFT,
            this.issuerAccountId
        )
    }

    async createNFT(options: CreateFTOptions) : Promise<string> {
        const optionsNFT = {
            ...options,
            decimals: 0,
            initialSupply: 0,
            isSupplyKey: true,
            tokenType: TokenType.NonFungibleUnique,
        }

        return create_token_non_custodial(
            this.client,
            this.publicKey,
            optionsNFT,
            this.issuerAccountId
        )
    }

    async dissociateToken(
        tokenId: TokenId
    ): Promise <string> {
        return dissociate_token_non_custodial(
            this.client,
            tokenId,
            this.issuerAccountId
        );
    }

    async mintToken(
        tokenId: TokenId,
        amount: number
    ): Promise<string> {
        return mint_token_non_custodial(
            this.client,
            tokenId,
            amount,
            this.issuerAccountId
        );
    }

    async mintNFTToken(
        tokenId: TokenId,
        tokenMetadata: Uint8Array
    ): Promise<string> {
        return mint_nft_non_custodial(
            this.client,
            tokenId,
            tokenMetadata,
            this.issuerAccountId
        )
    }

    async rejectToken(
        tokenId: TokenId,
    ): Promise<string> {
        return reject_token_non_custodial(
            this.client,
            tokenId,
            this.issuerAccountId
        );
    }

}