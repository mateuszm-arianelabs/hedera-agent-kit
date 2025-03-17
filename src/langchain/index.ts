import { Tool } from "@langchain/core/tools";
import HederaAgentKit from "../agent";
import * as dotenv from "dotenv";
import { CustodialHederaCreateTopicTool, NonCustodialHederaCreateTopicTool } from "./tools/hcs/create_topic_tool";
import {
  CustodialHederaCreateFungibleTokenTool,
  NonCustodialHederaCreateFungibleTokenTool
} from "./tools/hts/create_fungible_token_tool";
import {CustodialHederaTransferTokenTool, NonCustodialHederaTransferTokenTool} from "./tools/hts/transfer_token_tool";
import {HederaGetBalanceTool} from "./tools/hbar/get_hbar_balance_tool";
import {CustodialHederaAirdropTokenTool, NonCustodialHederaAirdropTokenTool} from "./tools/hts/airdrop_token_tool";
import {
  CustodialHederaCreateNonFungibleTokenTool,
  NonCustodialHederaCreateNonFungibleTokenTool
} from "./tools/hts/create_non_fungible_token_tool";
import {HederaGetHtsBalanceTool} from "./tools/hts/get_hts_balance_tool";
import {
  CustodialHederaAssociateTokenTool,
  NonCustodialHederaAssociateTokenTool
} from "./tools/hts/associate_token_tool";
import {
  CustodialHederaDissociateTokenTool,
  NonCustodialHederaDissociateTokenTool
} from "./tools/hts/dissociate_token_tool";
import {CustodialHederaRejectTokenTool, NonCustodialHederaRejectTokenTool} from "./tools/hts/reject_token_tool";
import {
  CustodialHederaMintFungibleTokenTool,
  NonCustodialHederaMintFungibleTokenTool
} from "./tools/hts/mint_fungible_token_tool";
import {CustodialHederaMintNFTTool, NonCustodialHederaMintNFTTool} from "./tools/hts/mint_non_fungible_token_tool";
import {
  CustodialHederaTransferHbarTool,
  NonCustodialHederaTransferHbarTool
} from "./tools/hts/transfer_native_hbar_token_tool";
import {CustodialHederaClaimAirdropTool, NonCustodialHederaClaimAirdropTool} from "./tools/hts/claim_airdrop_tool";
import {HederaGetPendingAirdropTool} from "./tools/hts/get_pending_airdrop_tool";
import {HederaGetAllTokenBalancesTool} from "./tools/hts/get_all_token_balances_tool";
import {HederaGetTokenHoldersTool} from "./tools/hts/get_token_holders_tool";
import {CustodialHederaDeleteTopicTool, NonCustodialHederaDeleteTopicTool} from "./tools/hcs/delete_topic_tool";
import {
  CustodialHederaSubmitTopicMessageTool,
  NonCustodialHederaSubmitTopicMessageTool
} from "./tools/hcs/submit_topic_message_tool";
import {HederaGetTopicInfoTool} from "./tools/hcs/get_topic_info_tool";
import {HederaGetTopicMessagesTool} from "./tools/hcs/get_topic_messages_tool";

dotenv.config();

export function createHederaTools(hederaKit: HederaAgentKit): Tool[] {

  const custodialTools = [
    new CustodialHederaCreateFungibleTokenTool(hederaKit),
    new CustodialHederaTransferTokenTool(hederaKit),
    new HederaGetBalanceTool(hederaKit),
    new CustodialHederaAirdropTokenTool(hederaKit),
    new CustodialHederaCreateNonFungibleTokenTool(hederaKit),
    new HederaGetHtsBalanceTool(hederaKit),
    new CustodialHederaAssociateTokenTool(hederaKit),
    new CustodialHederaDissociateTokenTool(hederaKit),
    new CustodialHederaRejectTokenTool(hederaKit),
    new CustodialHederaMintFungibleTokenTool(hederaKit),
    new CustodialHederaMintNFTTool(hederaKit),
    new CustodialHederaTransferHbarTool(hederaKit),
    new CustodialHederaClaimAirdropTool(hederaKit),
    new HederaGetPendingAirdropTool(hederaKit),
    new HederaGetAllTokenBalancesTool(hederaKit),
    new HederaGetTokenHoldersTool(hederaKit),
    new CustodialHederaCreateTopicTool(hederaKit),
    new CustodialHederaDeleteTopicTool(hederaKit),
    new CustodialHederaSubmitTopicMessageTool(hederaKit),
    new HederaGetTopicInfoTool(hederaKit),
    new HederaGetTopicMessagesTool(hederaKit)
  ]

  const nonCustodialTools = [
    new NonCustodialHederaCreateFungibleTokenTool(hederaKit),
    new NonCustodialHederaTransferTokenTool(hederaKit),
    new HederaGetBalanceTool(hederaKit),
    new NonCustodialHederaAirdropTokenTool(hederaKit),
    new NonCustodialHederaCreateNonFungibleTokenTool(hederaKit),
    new HederaGetHtsBalanceTool(hederaKit),
    new NonCustodialHederaAssociateTokenTool(hederaKit),
    new NonCustodialHederaDissociateTokenTool(hederaKit),
    new NonCustodialHederaRejectTokenTool(hederaKit),
    new NonCustodialHederaMintFungibleTokenTool(hederaKit),
    new NonCustodialHederaMintNFTTool(hederaKit),
    new NonCustodialHederaTransferHbarTool(hederaKit),
    new NonCustodialHederaClaimAirdropTool(hederaKit),
    new HederaGetPendingAirdropTool(hederaKit),
    new HederaGetAllTokenBalancesTool(hederaKit),
    new HederaGetTokenHoldersTool(hederaKit),
    new NonCustodialHederaCreateTopicTool(hederaKit),
    new NonCustodialHederaDeleteTopicTool(hederaKit),
    new NonCustodialHederaSubmitTopicMessageTool(hederaKit),
    new HederaGetTopicInfoTool(hederaKit),
    new HederaGetTopicMessagesTool(hederaKit)
  ]

  return process.env.CUSTODIAL_MODE === 'true'
    ? custodialTools
    : nonCustodialTools;
}