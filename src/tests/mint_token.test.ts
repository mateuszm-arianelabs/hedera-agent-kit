import { describe, expect, it, beforeAll, beforeEach } from "vitest";
import { NetworkType } from "./types";
import * as dotenv from "dotenv";
import { NetworkClientWrapper } from "./utils/testnetClient";
import { HederaMirrorNodeClient } from "./utils/hederaMirrorNodeClient";
import { LangchainAgent } from "./utils/langchainAgent";
import { wait } from "./utils/utils";

dotenv.config();

interface MintTokenLangchainResponse {
  status: string;
  message: string;
  tokenId: string;
  amount: number;
  txHash: string;
}

const extractLangchainResponse = (
  messages: any[]
): MintTokenLangchainResponse | null => {
  const toolMessages = messages.filter(
    (msg) =>
      (msg.id && msg.id[2] === "ToolMessage") ||
      msg.name === "hedera_mint_fungible_token"
  );

  return toolMessages.reduce((acc, message) => {
    try {
      const toolResponse = JSON.parse(message.content);
      if (toolResponse.status !== "success" || !toolResponse.tokenId) {
        throw new Error(toolResponse.message ?? "Unknown error");
      }

      return toolResponse as MintTokenLangchainResponse;
    } catch (error) {
      console.error("Error parsing tool message:", error);
      return acc;
    }
  }, null);
};

describe("hedera_mint_fungible_token", () => {
  let langchainAgent: LangchainAgent;
  let hederaApiClient: HederaMirrorNodeClient;
  let networkClientWrapper: NetworkClientWrapper;

  beforeAll(async () => {
    hederaApiClient = new HederaMirrorNodeClient("testnet" as NetworkType);
    networkClientWrapper = new NetworkClientWrapper(
      process.env.HEDERA_ACCOUNT_ID!,
      process.env.HEDERA_PRIVATE_KEY!,
      process.env.HEDERA_KEY_TYPE!,
      "testnet"
    );
  });

  beforeEach(async () => {
    dotenv.config();
    await wait(3000);
  });

  it("should mint fungible token", async () => {
    const STARTING_SUPPLY = 0;
    const TOKENS_TO_MINT = 100;

    const tokenId = await networkClientWrapper.createFT({
      name: "TokenToMint",
      symbol: "TTM",
      maxSupply: 1000,
      initialSupply: STARTING_SUPPLY,
      isSupplyKey: true,
    });

    const prompt = {
      user: "user",
      text: `Mint ${TOKENS_TO_MINT} of tokens ${tokenId}`,
    };

    langchainAgent = await LangchainAgent.create();
    await langchainAgent.sendPrompt(prompt);

    await wait(5000);

    const tokenInfo = await hederaApiClient.getTokenDetails(tokenId);

    expect(Number(tokenInfo.total_supply)).toBe(
      STARTING_SUPPLY + TOKENS_TO_MINT
    );
  });

  it("should fail minting fungible tokens due to not setting supply key of token", async () => {
    const STARTING_SUPPLY = 0;
    const TOKENS_TO_MINT = 100;

    const tokenId = await networkClientWrapper.createFT({
      name: "TokenToMint",
      symbol: "TTM",
      maxSupply: 1000,
      initialSupply: STARTING_SUPPLY,
    });

    const prompt = {
      user: "user",
      text: `Mint ${TOKENS_TO_MINT} of tokens ${tokenId}`,
    };

    langchainAgent = await LangchainAgent.create();
    const resp = await langchainAgent.sendPrompt(prompt);
    console.log(JSON.stringify(resp, null, 2));

    await wait(5000);

    const tokenInfo = await hederaApiClient.getTokenDetails(tokenId);

    expect(Number(tokenInfo.total_supply)).toBe(STARTING_SUPPLY);
  });

  it("should mint fungible token using display units in prompt", async () => {
    const STARTING_SUPPLY = 0;
    const TOKENS_TO_MINT_IN_DISPLAY_UNITS = 100;
    const DECIMALS = 2;
    
    const tokenId = await networkClientWrapper.createFT({
      name: "TokenToMint",
      symbol: "TTM",
      maxSupply: 100_000_000, // this is 1_000_000 tokens in display units
      decimals: DECIMALS,
      initialSupply: STARTING_SUPPLY,
      isSupplyKey: true,
    });

    const prompt = {
      user: "user",
      text: `Mint ${TOKENS_TO_MINT_IN_DISPLAY_UNITS} of tokens ${tokenId}`,
    };

    langchainAgent = await LangchainAgent.create();
    const resp = await langchainAgent.sendPrompt(prompt);
    const langchainResponse = extractLangchainResponse(resp.messages);
    const mintedAmountFromResponseInDisplayUnits = langchainResponse?.amount;

    await wait(5000);

    const mirrorNodeTokenInfo = await hederaApiClient.getTokenDetails(tokenId);

    expect(Number(mirrorNodeTokenInfo.total_supply)).toBe(
      Number(mintedAmountFromResponseInDisplayUnits) * 10 ** DECIMALS
    );
  });
});
