import { AccountId, PendingAirdropId, PublicKey, TokenId } from "@hashgraph/sdk";

import { BaseTransactionBuilder } from "./base_transaction_builder";
import {
    AirdropResult,
    ClaimAirdropResult,
    CreateTokenResult,
    DissociateTokenResult, MintNFTResult, MintTokenResult, RejectTokenResult, TransferTokenResult
} from "../../../types";
import {AirdropRecipient, AirdropTokenStrategy} from "../strategies/hts/airdrop_token_strategy";
import { AssociateTokenStrategy } from "../strategies/hts/associate_token_strategy";
import { ClaimAirdropStrategy } from "../strategies/hts/claim_airdrop_strategy";
import { CreateTokenOptions, CreateTokenStrategy } from "../strategies/hts/create_token_strategy";
import { DissociateTokenStrategy } from "../strategies/hts/dissociate_token_strategy";
import { MintNftStrategy } from "../strategies/hts/mint_nft_strategy";
import { MintTokenStrategy } from "../strategies/hts/mint_token_strategy";
import { RejectTokenStrategy } from "../strategies/hts/reject_token_strategy";
import { TransferTokenStrategy } from "../strategies/hts/transfer_token_strategy";

export class HtsTransactionBuilder {
    static airdropToken(
        tokenId: TokenId | string,
        recipients: AirdropRecipient[],
        issuerAccountId: string | AccountId,
    ): BaseTransactionBuilder<AirdropResult> {
        const strategy = new AirdropTokenStrategy(tokenId, recipients, issuerAccountId);
        return new BaseTransactionBuilder<AirdropResult>(strategy);
    }

    static associateToken(
        tokenId: string | TokenId,
        issuerAccountId: string | AccountId,
    ): BaseTransactionBuilder<AirdropResult> {
        const strategy = new AssociateTokenStrategy(tokenId, issuerAccountId);
        return new BaseTransactionBuilder<AirdropResult>(strategy);
    }

    static claimAirdrop(
        airdropId: PendingAirdropId
    ): BaseTransactionBuilder<ClaimAirdropResult> {
        const strategy = new ClaimAirdropStrategy(airdropId);
        return new BaseTransactionBuilder<ClaimAirdropResult>(strategy);
    }

    static createToken(
        options: CreateTokenOptions,
        publicKey: PublicKey,
        issuerAccountId: string | AccountId,
    ): BaseTransactionBuilder<CreateTokenResult> {
        const strategy = new CreateTokenStrategy(options, publicKey, issuerAccountId);
        return new BaseTransactionBuilder<CreateTokenResult>(strategy);
    }

    static dissociateToken(
        tokenId: string | TokenId,
        issuerAccountId: string | AccountId,
    ): BaseTransactionBuilder<DissociateTokenResult> {
        const strategy = new DissociateTokenStrategy(tokenId, issuerAccountId);
        return new BaseTransactionBuilder<DissociateTokenResult>(strategy);
    }

    static mintNft(
        tokenId: string | TokenId,
        tokenMetadata: Uint8Array,
    ): BaseTransactionBuilder<MintNFTResult> {
        const strategy = new MintNftStrategy(tokenId, tokenMetadata);
        return new BaseTransactionBuilder<MintNFTResult>(strategy);
    }

    static mintToken(
        tokenId: string | TokenId,
        amount: number,
    ): BaseTransactionBuilder<MintTokenResult> {
        const strategy = new MintTokenStrategy(tokenId, amount);
        return new BaseTransactionBuilder<MintTokenResult>(strategy);
    }

    static rejectToken(
        tokenId: TokenId,
        issuerAccountId: AccountId,
    ): BaseTransactionBuilder<RejectTokenResult> {
        const strategy = new RejectTokenStrategy(tokenId, issuerAccountId);
        return new BaseTransactionBuilder<RejectTokenResult>(strategy);
    }

    static transferToken(
        tokenId: TokenId | string,
        amount: number,
        targetAccountId: AccountId | string,
        issuerAccountId: AccountId | string,
    ): BaseTransactionBuilder<TransferTokenResult> {
        const strategy = new TransferTokenStrategy(tokenId, amount, targetAccountId, issuerAccountId);
        return new BaseTransactionBuilder<TransferTokenResult>(strategy);
    }
}