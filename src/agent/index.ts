import { Client, TokenId, AccountId, PendingAirdropId, TopicId } from "@hashgraph/sdk"
import { create_token, transfer_token, airdrop_token } from "../tools"
import { get_hbar_balance } from "../tools/hts/queries"
import { AirdropRecipient } from "../tools/hts/transactions/airdrop"
import {
  Airdrop,
  AirdropResult,
  AssociateTokenResult,
  ClaimAirdropResult,
  CreateTokenResult,
  HederaNetworkType,
  HtsTokenDetails,
  RejectTokenResult,
  TokenBalance,
  TransferHBARResult,
  TransferTokenResult,
  TopicInfoApiResponse,
  SubmitMessageResult,
  DissociateTokenResult,
  CreateTopicResult,
  MintTokenResult,
  HCSMessage
} from "../types";
import { get_hts_balance } from "../tools/hts/queries";
import { get_hts_token_details } from "../tools/hts/queries";
import { transfer_hbar } from "../tools/hbar/transactions";
import { get_all_tokens_balances } from "../tools/hts/queries/balance";
import { get_token_holders } from "../tools/hts/queries";
import { get_pending_airdrops } from "../tools/hts/queries";
import {
  associate_token,
  reject_token,
  create_topic,
  delete_topic,
  submit_topic_message,
  claim_airdrop,
  dissociate_token
} from "../tools";
import {get_topic_info, get_topic_messages} from "../tools/hcs/queries";
import { mint_token } from "../tools";


export default class HederaAgentKit {

  public client: Client

  constructor(
    accountId: string,
    privateKey: string,
    network: 'mainnet' | 'testnet' | 'previewnet' = 'mainnet'
  ) {
    // @ts-ignore
    this.client = Client.forNetwork(network).setOperator(accountId, privateKey)
  }

  async createFT(
    name: string,
    symbol: string,
    decimals: number,
    initialSupply: number,
    isSupplyKey?: boolean,
  ): Promise<CreateTokenResult> {
    return create_token(
      name,
      symbol,
      decimals,
      initialSupply,
      isSupplyKey || false,
      this.client
    )
  }

  async transferToken(
    tokenId: TokenId,
    toAccountId: string | AccountId,
    amount: number
  ): Promise<TransferTokenResult> {
    return transfer_token(
      tokenId,
      toAccountId,
      amount,
      this.client
    )
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
    return associate_token(tokenId, this.client);
  }

  async dissociateToken(
      tokenId: TokenId
  ): Promise <DissociateTokenResult> {
    return dissociate_token(tokenId, this.client);
  }

  async airdropToken(
    tokenId: TokenId,
    recipients: AirdropRecipient[]
  ): Promise<AirdropResult> {
    return airdrop_token(
      tokenId,
      recipients,
      this.client
    )
  }

  async rejectToken(
      tokenId: TokenId,
  ): Promise<RejectTokenResult> {
    return reject_token(
        tokenId,
        this.client
    );
  }

  async mintToken(
      tokenId: TokenId,
      amount: number
  ): Promise<MintTokenResult> {
    return mint_token(
        tokenId,
        amount,
        this.client
    );
  }

  async transferHbar(
      toAccountId: string | AccountId,
      amount: string
  ): Promise<TransferHBARResult> {
    return transfer_hbar(
        this.client,
        toAccountId,
        amount,
    )
  }

  async claimAirdrop(
      airdropId: PendingAirdropId
  ): Promise<ClaimAirdropResult> {
    return claim_airdrop(this.client, airdropId)
  }

  async getPendingAirdrops(
      accountId: string,
      networkType: HederaNetworkType
  ): Promise<Airdrop[]> {
    return get_pending_airdrops(networkType, accountId)
  }

  async createTopic(
      topicMemo: string,
      isSubmitKey: boolean,
  ): Promise<CreateTopicResult> {
    return create_topic(topicMemo, this.client, isSubmitKey);
  }

  async deleteTopic(
      topicId: TopicId
  ): Promise<void> {
    return delete_topic(topicId, this.client)
  }

  async getTopicInfo(
      topicId: TopicId,
      networkType: HederaNetworkType,
  ): Promise<TopicInfoApiResponse> {
    return get_topic_info(topicId, networkType)
  }

  async submitTopicMessage(
      topicId: TopicId,
      message: string,
  ): Promise<SubmitMessageResult> {
    return submit_topic_message(topicId, message, this.client)
  }

  async getTopicMessages(
      topicId: TopicId,
      networkType: HederaNetworkType,
      lowerTimestamp?: number,
      upperTimestamp?: number,
  ): Promise<Array<HCSMessage>> {
    return get_topic_messages(topicId, networkType, lowerTimestamp, upperTimestamp);
  }
}
