import { describe, expect, it, beforeAll } from "vitest";
import { HederaMirrorNodeClient } from "./utils/hederaMirrorNodeClient";
import * as dotenv from "dotenv";
import { NetworkClientWrapper } from "./utils/testnetClient";
import { AccountData } from "./utils/testnetUtils";
import { LangchainAgent } from "./utils/langchainAgent";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const extractTxHash = (messages: any[]) => {
  return messages.reduce((acc, { content }) => {
    try {
      const response = JSON.parse(content);

      if (response.status === "error") {
        throw new Error(response.message);
      }

      return String(response.txHash);
    } catch {
      return acc;
    }
  }, "");
};

const formatTxHash = (txHash: string) => {
  const [txId, txTimestamp] = txHash.split("@");

  if (!txId || !txTimestamp) {
    throw new Error("Invalid tx hash");
  }

  return `${txId}-${txTimestamp?.replace(".", "-")}`;
};

describe("Test Token transfer", async () => {
  let acc1: AccountData;
  let acc2: AccountData;
  let acc3: AccountData;
  let token1: string;
  let token2: string;
  let hederaApiClient: HederaMirrorNodeClient;
  let networkClientWrapper: NetworkClientWrapper;
  let testCases: [string, number, string, string][];

  beforeAll(async () => {
    dotenv.config();
    try {
      networkClientWrapper = new NetworkClientWrapper(
        process.env.HEDERA_ACCOUNT_ID!,
        process.env.HEDERA_PRIVATE_KEY!,
        process.env.HEDERA_KEY_TYPE!,
        "testnet"
      );

      // Create test accounts
      await Promise.all([
        networkClientWrapper.createAccount(0, -1),
        networkClientWrapper.createAccount(0, -1),
        networkClientWrapper.createAccount(0, -1),
      ]).then(([_acc1, _acc2, _acc3]) => {
        acc1 = _acc1;
        acc2 = _acc2;
        acc3 = _acc3;
      });

      // Create test tokens
      await Promise.all([
        networkClientWrapper.createFT({
          name: "TestToken1",
          symbol: "TT1",
          initialSupply: 1000000,
          decimals: 2,
        }),
        networkClientWrapper.createFT({
          name: "TestToken2",
          symbol: "TT2",
          initialSupply: 2000,
          decimals: 0,
        }),
      ]).then(([_token1, _token2]) => {
        token1 = _token1;
        token2 = _token2;
      });
      
      await wait(5000);

      hederaApiClient = new HederaMirrorNodeClient("testnet");

      // Define test cases using created accounts and tokens
      testCases = [
        [
          acc1.accountId,
          12.5,
          token1,
          `Transfer 12.5 tokens ${token1} to the account ${acc1.accountId}`,
        ],
        [
          acc2.accountId,
          10,
          token2,
          `Send 10 tokens ${token2} to account ${acc2.accountId}.`,
        ],
        [
          acc3.accountId,
          3,
          token1,
          `Transfer exactly 3 of token ${token1} to ${acc3.accountId}.`,
        ],
      ];
    } catch (error) {
      console.error("Error in setup:", error);
      throw error;
    }
  });

  describe("token transfers", () => {
    it("should process token transfers for dynamically created accounts", async () => {
      for (const [
        receiversAccountId,
        transferAmount,
        tokenId,
        promptText,
      ] of testCases) {
        const agentsAccountId = process.env.HEDERA_ACCOUNT_ID;

        if (!agentsAccountId || receiversAccountId === agentsAccountId) {
          throw new Error(
            "Note that transfers cant be done to the operator account address."
          );
        }

        // Get balances before
        const balanceAgentBefore = await hederaApiClient.getTokenBalance(
          agentsAccountId,
          tokenId
        );
        const balanceReceiverBefore = await hederaApiClient.getTokenBalance(
          receiversAccountId,
          tokenId
        );

        const prompt = {
          user: "user",
          text: promptText,
        };

        const langchainAgent = await LangchainAgent.create();
        const response = await langchainAgent.sendPrompt(prompt);
        const txHash = extractTxHash(response.messages);
        const formattedTxHash = formatTxHash(txHash);

        if (!formattedTxHash) {
          throw new Error("No match for transaction hash found in response.");
        }

        // Get balances after transaction being successfully processed by mirror node
        await wait(5000);
        const balanceAgentAfter = await hederaApiClient.getTokenBalance(
          agentsAccountId,
          tokenId
        );

        const balanceReceiverAfter = await hederaApiClient.getTokenBalance(
          receiversAccountId,
          tokenId
        );

        const txReport = await hederaApiClient.getTransactionReport(
          formattedTxHash,
          agentsAccountId,
          [receiversAccountId]
        );

        // Compare before and after including the difference due to paid fees
        expect(txReport.status).toEqual("SUCCESS");
        expect(balanceAgentBefore).toEqual(balanceAgentAfter + transferAmount);
        expect(balanceReceiverBefore).toEqual(
          balanceReceiverAfter - transferAmount
        );

        await wait(1000);
      }
    });
  });
});
