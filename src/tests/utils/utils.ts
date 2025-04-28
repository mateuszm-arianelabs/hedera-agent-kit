import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import * as dotenv from "dotenv";
import HederaAgentKit from "../../agent";
import { createHederaTools } from "../../langchain";
import { AccountId, Client, PrivateKey, Transaction } from "@hashgraph/sdk";
import { Buffer } from "buffer";
import { HederaNetworkType, TxExecutionResult } from "../../types";
import { AccountData } from "./testnetUtils";

dotenv.config();

export function fromTinybarToHbar(valueInTinyBar: number): number {
    return valueInTinyBar / 10 ** 8;
}

export function fromBaseToDisplayUnit(
    rawBalance: number,
    decimals: number
): number {
    return rawBalance / 10 ** decimals;
}

export function fromDisplayToBaseUnit(
    displayBalance: number,
    decimals: number
): number {
    return displayBalance * 10 ** decimals;
}

/**
 * Initializes an agent configured to interact on-chain using the Hedera Agent Kit and other tools.
 * This is an initialization for a client for automatic tests of hedera-agent-tools,
 * and it should be used with hedera testnet accounts.
 *
 * **NOTE: With no `operatorAccountData` the method defaults to an account from `.env` file.**
 *
 * @param {AccountData} [operatorAccountData] - Optional object
 * containing the operator account details such as accountId,
 * privateKey,
 * and optionally used to set the network type.
 * @return {Promise<{ agent: Object, config: Object }>} A promise
 * that resolves to an object containing the created agent and its configuration settings.
 * @throws Will throw an error if the initialization process fails.
 */
export async function initializeAgent(operatorAccountData?: AccountData) {
  try {
    const llm = new ChatOpenAI({
      modelName: "o3-mini",
    });

    // Initialize HederaAgentKit
    const hederaKit = new HederaAgentKit(
      operatorAccountData?.accountId || process.env.HEDERA_ACCOUNT_ID!,
      operatorAccountData ?  PrivateKey.fromStringECDSA(operatorAccountData.privateKey).toStringDer() : process.env.HEDERA_PRIVATE_KEY!,
      operatorAccountData ? 'testnet' : process.env.HEDERA_NETWORK_TYPE as HederaNetworkType
    );

    // Create the LangChain-compatible tools
    const tools = createHederaTools(hederaKit);

    // Prepare an in-memory checkpoint saver
    const memory = new MemorySaver();

    // Additional configuration for the agent
    const config = { configurable: { thread_id: "1" } };

    // Create the React agent
    const agent = createReactAgent({
      llm,
      tools,
      checkpointSaver: memory,
      // You can adjust this message for your scenario:
      messageModifier: `
        **General Guidelines**:
        You are a helpful agent that can interact on-chain using the Hedera Agent Kit. 
        You are empowered to interact on-chain using your tools. If you ever need funds,
        you can request them from a faucet or from the user. 
        If there is a 5XX (internal) HTTP error code, ask the user to try again later. 
        If someone asks you to do something you can't do with your available tools, you 
        must say so, and encourage them to implement it themselves with the Hedera Agent Kit. 
        Keep your responses concise and helpful.
        
        **Non-custodial Flow Guidelines**:
        When action returns 'txBytes', it is not successfully executed yet, so its goal is not complete.
        In such case, emphasize to the user that the transaction bytes have been created successfully.
        Let the user know that now he has to sign them in order to execute the prepared transaction
        
        **Token Creation Rules**:
        If the user mentions **NFT**, **non-fungible token**, or **unique token**, always use the **hedera_create_non_fungible_token** tool.
        If the user mentions **fungible token**, **FT**, or **decimal-based token**, always use the **hedera_create_fungible_token** tool.
       `,
    });

    return { agent, config };
  } catch (error) {
    console.error("Failed to initialize agent:", error);
    throw error;
  }
}

export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const extractTxBytes = (messages: any[]): string => {
  return messages.reduce((acc, {content}) => {
    try {
      const response = JSON.parse(content);

      return response.txBytes as string;
    } catch {
      return acc;
    }
  }, "");
};

export const signAndExecuteTx = async (
  base64TxString: string,
  privateKey: string,
  accountId: string
): Promise<TxExecutionResult> => {
  try {
    const client = Client.forTestnet();
    const operatorKey = PrivateKey.fromStringECDSA(privateKey);
    const operatorId = AccountId.fromString(accountId);
    client.setOperator(operatorId, operatorKey);
    const txBytes = Buffer.from(base64TxString, "base64");
    const transaction = Transaction.fromBytes(txBytes);
    const signedTx = await transaction.sign(operatorKey);
    const txResponse = await signedTx.execute(client);
    const receipt = await txResponse.getReceipt(client);

    console.log(`Transaction executed with ID: ${txResponse.transactionId.toString()}\nStatus: ${receipt.status.toString()}`);

    return {
      txHash: txResponse.transactionId.toString(),
      status: receipt.status.toString()
    };
  } catch (error) {
    console.error("Error signing transaction:", JSON.stringify(error));
    throw error;
  }
}

export const formatTxHash = (txHash: string) => {
  const [txId, txTimestamp] = txHash.split("@");

  if (!txId || !txTimestamp) {
    throw new Error("Invalid tx hash");
  }

  return `${txId}-${txTimestamp?.replace(".", "-")}`;
};
