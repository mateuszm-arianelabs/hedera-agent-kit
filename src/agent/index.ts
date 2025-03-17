import {
    AccountId,
    Client,
    PendingAirdropId,
    PublicKey,
    TokenId,
    TokenType,
    TopicId
} from "@hashgraph/sdk";
import {
    Airdrop,
    AirdropResult,
    AssetAllowanceResult,
    AssociateTokenResult,
    ClaimAirdropResult,
    CreateFTOptions,
    CreateNFTOptions,
    CreateTokenResult,
    CreateTopicResult,
    DeleteTopicResult,
    DissociateTokenResult,
    HCSMessage,
    HederaNetworkType,
    HtsTokenDetails,
    MintNFTResult,
    MintTokenResult,
    RejectTokenResult,
    SubmitMessageResult,
    TokenBalance, TopicInfoApiResponse,
    TransferHBARResult,
    TransferTokenResult,
} from "../types";
import { HcsTransactionBuilder } from "../tools/builders/hcs_transaction_builder";
import { HtsTransactionBuilder } from "../tools/builders/hts_transaction_builder";
import { HbarTransactionBuilder } from "../tools/builders/hbar_transaction_builder";
import {
    get_all_tokens_balances,
    get_hbar_balance,
    get_hts_balance,
    get_hts_token_details,
    get_pending_airdrops,
    get_token_holders,
    get_topic_info, get_topic_messages,
} from "../tools";
import { AirdropRecipient } from "../tools/hts/transactions/custodial/airdrop";
import { AccountTransactionBuilder } from "../tools/builders/account_transaction_builder";


export default class HederaAgentKit {

    public client: Client
    readonly network: 'mainnet' | 'testnet' | 'previewnet' = 'mainnet'
    readonly publicKey: PublicKey | undefined;
    private readonly privateKey: string | undefined;
    readonly accountId: string;

    constructor(
        accountId: string,
        privateKey?: string | undefined,
        publicKey?: string | undefined, // TODO: can be fetched from mirror node
        network: 'mainnet' | 'testnet' | 'previewnet' = 'mainnet',
    ) {
        if(privateKey){
            // @ts-ignore
            this.client = Client.forNetwork(network).setOperator(accountId, privateKey);
            this.privateKey = privateKey;
        } else {
            // @ts-ignore
            this.client = Client.forNetwork(network);
            if(!publicKey){
                throw new Error("Public key is missing. To perform non custodial action you should pass public key!");
            }
        }
        this.publicKey = PublicKey.fromString(publicKey!);
        this.network = network;
        this.accountId = accountId;
    }

    async createTopic(
        topicMemo: string,
        isSubmitKey: boolean,
    ) : Promise<CreateTopicResult> {
        if(!this.privateKey) throw new Error("Custodial actions require privateKey!");

        return await HcsTransactionBuilder
            .createTopic(topicMemo, this.client.operatorPublicKey, isSubmitKey)
            .signAndExecute(this.client);
    }

    async createTopicNonCustodial(
        topicMemo: string,
        isSubmitKey: boolean,
    ) : Promise<CreateTopicResult | string> {
        return await HcsTransactionBuilder
            .createTopic(topicMemo, this.client.operatorPublicKey, isSubmitKey)
            .getTxBytesString(this.client, this.accountId);
    }

    async submitTopicMessage(
        topicId: TopicId,
        message: string,
    ): Promise<SubmitMessageResult> {
        if(!this.privateKey) throw new Error("Custodial actions require privateKey!");

        return await HcsTransactionBuilder
            .submitTopicMessage(topicId, message)
            .signAndExecute(this.client);
    }

    async submitTopicMessageNonCustodial(
        topicId: TopicId,
        message: string,
    ): Promise<string> {

        return await HcsTransactionBuilder
            .submitTopicMessage(topicId, message)
            .getTxBytesString(this.client, this.accountId);
    }

    async transferHbar(
        toAccountId: string | AccountId,
        amount: string
    ): Promise<TransferHBARResult> {
        if(!this.privateKey) throw new Error("Custodial actions require privateKey!");

        return await HbarTransactionBuilder
            .transferHbar(this.client.operatorAccountId!, toAccountId, amount)
            .signAndExecute(this.client);
    }

    async transferHbarNonCustodial(
        toAccountId: string | AccountId,
        amount: string
    ): Promise<string> {

        return await HbarTransactionBuilder
            .transferHbar(this.accountId, toAccountId, amount)
            .getTxBytesString(this.client, this.accountId);
    }


    async createFT(options: CreateFTOptions): Promise<CreateTokenResult> {
        if(!this.privateKey) throw new Error("Custodial actions require privateKey!");
        return HtsTransactionBuilder.createToken(
            {
                ...options,
                tokenType: TokenType.FungibleCommon,
                client: this.client,
            },
            this.client.operatorPublicKey!,
            this.client.operatorAccountId!,
        ).signAndExecute(this.client);
    }

    async createFTNonCustodial(options: CreateFTOptions): Promise<string> {
        return HtsTransactionBuilder.createToken(
            {
                ...options,
                tokenType: TokenType.FungibleCommon,
                client: this.client,
            },
            this.publicKey!,
            this.accountId,
        ).getTxBytesString(this.client, this.accountId);
    }

    async createNFT(options: CreateNFTOptions): Promise<CreateTokenResult> {
        if(!this.privateKey) throw new Error("Custodial actions require privateKey!");
        return HtsTransactionBuilder.createToken(
            {
                ...options,
                decimals: 0,
                initialSupply: 0,
                isSupplyKey: true,
                tokenType: TokenType.NonFungibleUnique,
                client: this.client,
            },
            this.client.operatorPublicKey!,
            this.client.operatorAccountId!,
        ).signAndExecute(this.client);
    }

    async createNFTNonCustodial(options: CreateNFTOptions): Promise<string> {
        return HtsTransactionBuilder.createToken(
            {
                ...options,
                decimals: 0,
                initialSupply: 0,
                isSupplyKey: true,
                tokenType: TokenType.NonFungibleUnique,
                client: this.client,
            },
            this.publicKey!,
            this.accountId,
        ).getTxBytesString(this.client, this.accountId);
    }

    async transferToken(
        tokenId: TokenId,
        toAccountId: string | AccountId,
        amount: number
    ): Promise<TransferTokenResult> {
        return HtsTransactionBuilder.transferToken(
            tokenId,
            amount,
            toAccountId,
            this.accountId
        ).signAndExecute(this.client);
    }

    async transferTokenNonCustodial(
        tokenId: TokenId,
        toAccountId: string | AccountId,
        amount: number
    ): Promise<string> {
        return HtsTransactionBuilder.transferToken(
            tokenId,
            amount,
            toAccountId,
            this.accountId
        ).getTxBytesString(this.client, this.accountId);
    }

    async getHbarBalance(accountId?: string): Promise<number> {
        const targetAccountId = accountId || this.client.operatorAccountId;
        return get_hbar_balance(this.client, targetAccountId);
    }

    async getHtsBalance(
        tokenId: string,
        networkType: HederaNetworkType,
        accountId?: string
    ): Promise<number> {
        const targetAccountId = accountId || this.client.operatorAccountId;
        return get_hts_balance(tokenId, networkType, targetAccountId as string);
    }

    async getAllTokensBalances(
        networkType: HederaNetworkType,
        accountId?: string
    ) {
        const targetAccountId = accountId || this.client.operatorAccountId;
        return get_all_tokens_balances(networkType, targetAccountId as string);
    }

    async getHtsTokenDetails(
        tokenId: string,
        networkType: HederaNetworkType
    ): Promise<HtsTokenDetails> {
        return get_hts_token_details(tokenId, networkType);
    }

    async getTokenHolders(
        tokenId: string | TokenId,
        networkType: HederaNetworkType,
        threshold?: number,
    ): Promise<Array<TokenBalance>> {
        return get_token_holders(tokenId.toString(), networkType, threshold);
    }

    async associateToken(
        tokenId: TokenId
    ): Promise<AssociateTokenResult> {
        return HtsTransactionBuilder.associateToken(
            tokenId,
            this.accountId
        ).signAndExecute(this.client);
    }

    async associateTokenNonCustodial(
        tokenId: TokenId
    ): Promise<string> {
        return HtsTransactionBuilder.associateToken(
            tokenId,
            this.accountId
        ).getTxBytesString(this.client, this.accountId);
    }

    async dissociateToken(
        tokenId: TokenId
    ): Promise <DissociateTokenResult> {
        return HtsTransactionBuilder.dissociateToken(
            tokenId,
            this.accountId
        ).signAndExecute(this.client);
    }

    async dissociateTokenNonCustodial(
        tokenId: TokenId
    ): Promise<string> {
        return HtsTransactionBuilder.dissociateToken(
            tokenId,
            this.accountId
        ).getTxBytesString(this.client, this.accountId);
    }

    async airdropToken(
        tokenId: TokenId,
        recipients: AirdropRecipient[]
    ): Promise<AirdropResult> {
        return HtsTransactionBuilder.airdropToken(
            tokenId,
            recipients,
            this.accountId
        ).signAndExecute(this.client);
    }

    async airdropTokenNonCustodial(
        tokenId: TokenId,
        recipients: AirdropRecipient[]
    ): Promise<string> {
        return HtsTransactionBuilder.airdropToken(
            tokenId,
            recipients,
            this.accountId
        ).getTxBytesString(this.client, this.accountId);
    }

    async rejectToken(
        tokenId: TokenId,
    ): Promise<RejectTokenResult> {
        return HtsTransactionBuilder.rejectToken(
            tokenId,
            AccountId.fromString(this.accountId)
        ).signAndExecute(this.client);
    }

    async rejectTokenNonCustodial(
        tokenId: TokenId,
    ): Promise<string> {
        return HtsTransactionBuilder.rejectToken(
            tokenId,
            AccountId.fromString(this.accountId)
        ).getTxBytesString(this.client, this.accountId);
    }

    async mintToken(
        tokenId: TokenId,
        amount: number
    ): Promise<MintTokenResult> {
        return HtsTransactionBuilder.mintToken(
            tokenId,
            amount,
        ).signAndExecute(this.client);
    }

    async mintTokenNonCustodial(
        tokenId: TokenId,
        amount: number
    ): Promise<string> {
        return HtsTransactionBuilder.mintToken(
            tokenId,
            amount,
        ).getTxBytesString(this.client, this.accountId);
    }

    async mintNFTToken(
        tokenId: TokenId,
        tokenMetadata: Uint8Array
    ): Promise<MintNFTResult> {
        return HtsTransactionBuilder.mintNft(
            tokenId,
            tokenMetadata,
        ).signAndExecute(this.client);
    }

    async mintNFTTokenNonCustodial(
        tokenId: TokenId,
        tokenMetadata: Uint8Array
    ): Promise<string> {
        return HtsTransactionBuilder.mintNft(
            tokenId,
            tokenMetadata,
        ).getTxBytesString(this.client, this.accountId);
    }

    async claimAirdrop(
        airdropId: PendingAirdropId
    ): Promise<ClaimAirdropResult> {
        return HtsTransactionBuilder.claimAirdrop(
            airdropId
        ).signAndExecute(this.client);
    }

    async claimAirdropNonCustodial(
        airdropId: PendingAirdropId
    ): Promise<string> {
        return HtsTransactionBuilder.claimAirdrop(
            airdropId
        ).getTxBytesString(this.client, this.accountId);
    }

    async getPendingAirdrops(
        accountId: string,
        networkType: HederaNetworkType
    ): Promise<Airdrop[]> {
        return get_pending_airdrops(networkType, accountId)
    }

    async deleteTopic(
        topicId: TopicId
    ): Promise<DeleteTopicResult> {
        return HcsTransactionBuilder.deleteTopic(
            topicId
        ).signAndExecute(this.client);
    }

    async deleteTopicNonCustodial(
        topicId: TopicId
    ): Promise<string> {
        return HcsTransactionBuilder.deleteTopic(
            topicId
        ).getTxBytesString(this.client, this.accountId);
    }

    async getTopicInfo(
        topicId: TopicId,
        networkType: HederaNetworkType,
    ): Promise<TopicInfoApiResponse> {
        return get_topic_info(topicId, networkType)
    }

    async getTopicMessages(
        topicId: TopicId,
        networkType: HederaNetworkType,
        lowerTimestamp?: number,
        upperTimestamp?: number,
    ): Promise<Array<HCSMessage>> {
        return get_topic_messages(topicId, networkType, lowerTimestamp, upperTimestamp);
    }

    async approveAssetAllowance(
        spenderAccount: AccountId | string,
        amount: number,
        tokenId?: TokenId,
    ): Promise<AssetAllowanceResult> {
        return AccountTransactionBuilder.approveAssetAllowance(
            spenderAccount,
            amount,
            this.accountId,
            tokenId
        ).signAndExecute(this.client);
    }

    async approveAssetAllowanceNonCustodial(
        spenderAccount: AccountId | string,
        amount: number,
        tokenId?: TokenId,
    ): Promise<string> {
        return AccountTransactionBuilder.approveAssetAllowance(
            spenderAccount,
            amount,
            this.accountId,
            tokenId
        ).getTxBytesString(this.client, this.accountId);
    }

}
