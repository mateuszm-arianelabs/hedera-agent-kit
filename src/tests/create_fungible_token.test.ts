import { describe, expect, it } from "vitest";
import { HederaMirrorNodeClient } from "./utils/hederaMirrorNodeClient";
import * as dotenv from "dotenv";
import { wait } from "./utils/utils";
import { LangchainAgent } from "./utils/langchainAgent";

function extractTokenId(messages) {
  const toolMessages = messages.filter((msg) =>
      (msg.id && msg.id[2] === "ToolMessage") ||
      msg.name === "hedera_create_fungible_token"
  );

  for (const message of toolMessages) {
    try {
      const toolResponse = JSON.parse(message.content);

      if (toolResponse.status !== "success" || !toolResponse.tokenId) {
        continue;
      }

      return toolResponse.tokenId;

    } catch (error) {
      console.error("Error parsing tool message:", error);
    }
  }

  return null;
}

dotenv.config();
describe("create_fungible_token", () => {

  it("Create token with all possible parameters", async () => {
    const hederaApiClient = new HederaMirrorNodeClient("testnet");

    const promptText =
      "Create token GameGold with symbol GG, 2 decimal places, and starting supply of 750000. Set memo to 'This is an example memo' and token metadata to 'And that's an example metadata'. Add supply key, admin key. Set metadata key.";
    const prompt = {
      user: "user",
      text: promptText,
    };
    const langchainAgent = await LangchainAgent.create();

    const response = await langchainAgent.sendPrompt(prompt);
    const tokenId = extractTokenId(response.messages);

    await wait(5000);

    const tokenDetails = await hederaApiClient.getTokenDetails(tokenId);

    expect(tokenDetails.symbol).toEqual("GG");
    expect(tokenDetails.name).toEqual("GameGold");
    expect(tokenDetails.decimals).toEqual("2");
    expect(tokenDetails.initial_supply).toEqual("750000");
    expect(tokenDetails.memo).toEqual("This is an example memo");
    expect(atob(tokenDetails.metadata!)).toEqual(
      "And that's an example metadata"
    );
    expect(tokenDetails?.supply_key?.key).not.toBeFalsy();
    expect(tokenDetails?.admin_key?.key).not.toBeFalsy();
    expect(tokenDetails?.metadata_key?.key).not.toBeFalsy();
  });

  it("Create token with minimal parameters", async () => {
    const hederaApiClient = new HederaMirrorNodeClient("testnet");

    const promptText =
      "Create token Minimal Token with symbol MT, 3 decimal places, and starting supply of 333.";
    const prompt = {
      user: "user",
      text: promptText,
    };
    const langchainAgent = await LangchainAgent.create();

    const response = await langchainAgent.sendPrompt(prompt);
    const tokenId = extractTokenId(response.messages);

    await wait(5000);

    const tokenDetails = await hederaApiClient.getTokenDetails(tokenId);

    expect(tokenDetails.symbol).toEqual("MT");
    expect(tokenDetails.name).toEqual("Minimal Token");
    expect(tokenDetails.decimals).toEqual("3");
    expect(tokenDetails.initial_supply).toEqual("333");
    expect(tokenDetails.memo).toBe("");
    expect(tokenDetails.metadata).toBe("");
    expect(tokenDetails?.supply_key?.key).toBeUndefined();
    expect(tokenDetails?.admin_key?.key).toBeUndefined();
    expect(tokenDetails?.metadata_key?.key).toBeUndefined();
  });

  it("Create token with minimal parameters plus memo", async () => {
    const hederaApiClient = new HederaMirrorNodeClient("testnet");

    const promptText =
      "Create token 'Minimal Plus Memo Token' with symbol MPMT, 4 decimal places, and starting supply of 444. Set memo to 'Automatic tests memo'";
    const prompt = {
      user: "user",
      text: promptText,
    };
    const langchainAgent = await LangchainAgent.create();

    const response = await langchainAgent.sendPrompt(prompt);
    const tokenId = extractTokenId(response.messages);

    await wait(5000);

    const tokenDetails = await hederaApiClient.getTokenDetails(tokenId);

    expect(tokenDetails.symbol).toEqual("MPMT");
    expect(tokenDetails.name).toEqual("Minimal Plus Memo Token");
    expect(tokenDetails.decimals).toEqual("4");
    expect(tokenDetails.initial_supply).toEqual("444");
    expect(tokenDetails.memo).toEqual("Automatic tests memo");
    expect(tokenDetails.metadata).toBe("");
    expect(tokenDetails?.supply_key?.key).toBeUndefined();
    expect(tokenDetails?.admin_key?.key).toBeUndefined();
    expect(tokenDetails?.metadata_key?.key).toBeUndefined();
  });

  it("Create token with minimal parameters plus metadata key", async () => {
    const hederaApiClient = new HederaMirrorNodeClient("testnet");

    const promptText =
      "Create token 'Minimal Plus Metadata Key Token' with symbol MPMKT, 5 decimal places, and starting supply of 555. Set metadata key to agents key.";
    const prompt = {
      user: "user",
      text: promptText,
    };
    const langchainAgent = await LangchainAgent.create();

    const response = await langchainAgent.sendPrompt(prompt);
    const tokenId = extractTokenId(response.messages);

    await wait(5000);

    const tokenDetails = await hederaApiClient.getTokenDetails(tokenId);

    expect(tokenDetails.symbol).toEqual("MPMKT");
    expect(tokenDetails.name).toEqual("Minimal Plus Metadata Key Token");
    expect(tokenDetails.decimals).toEqual("5");
    expect(tokenDetails.initial_supply).toEqual("555");
    expect(tokenDetails.memo).toBe("");
    expect(tokenDetails.metadata).toBe("");
    expect(tokenDetails?.supply_key?.key).toBeUndefined();
    expect(tokenDetails?.admin_key?.key).toBeUndefined();
    expect(tokenDetails?.metadata_key?.key).not.toBeUndefined();
  });

  it("Create token with minimal parameters plus admin key and supply key", async () => {
    const hederaApiClient = new HederaMirrorNodeClient("testnet");

    const promptText =
      "Create token 'Minimal Plus Admin Supply Keys Token' with symbol MPASKT, 1 decimal places, and starting supply of 111. Set admin key and supply keys.";
    const prompt = {
      user: "user",
      text: promptText,
    };
    const langchainAgent = await LangchainAgent.create();

    const response = await langchainAgent.sendPrompt(prompt);
    const tokenId = extractTokenId(response.messages);

    await wait(5000);

    const tokenDetails = await hederaApiClient.getTokenDetails(tokenId);

    expect(tokenDetails.symbol).toEqual("MPASKT");
    expect(tokenDetails.name).toEqual("Minimal Plus Admin Supply Keys Token");
    expect(tokenDetails.decimals).toEqual("1");
    expect(tokenDetails.initial_supply).toEqual("111");
    expect(tokenDetails.memo).toBe("");
    expect(tokenDetails.memo).toBe("");
    expect(tokenDetails?.supply_key?.key).not.toBeUndefined();
    expect(tokenDetails?.admin_key?.key).not.toBeUndefined();
    expect(tokenDetails?.metadata_key?.key).toBeUndefined();
  });

  it("Create token with minimal parameters plus admin key and supply key and memo and metadata", async () => {
    const hederaApiClient = new HederaMirrorNodeClient("testnet");

    const promptText =
      "Create token 'Complex Token' with symbol CPLXT, 1 decimal places, and starting supply of 1111. Set admin key and supply keys. Set memo to 'This a complex token'. Set metadata to 'this could be a link to image'";
    const prompt = {
      user: "user",
      text: promptText,
    };
    const langchainAgent = await LangchainAgent.create();

    const response = await langchainAgent.sendPrompt(prompt);
    const tokenId = extractTokenId(response.messages);

    await wait(5000);

    const tokenDetails = await hederaApiClient.getTokenDetails(tokenId);

    expect(tokenDetails.symbol).toEqual("CPLXT");
    expect(tokenDetails.name).toEqual("Complex Token");
    expect(tokenDetails.decimals).toEqual("1");
    expect(tokenDetails.initial_supply).toEqual("1111");
    expect(tokenDetails.memo).toBe("This a complex token");
    expect(atob(tokenDetails.metadata!)).toBe("this could be a link to image");
    expect(tokenDetails?.supply_key?.key).not.toBeUndefined();
    expect(tokenDetails?.admin_key?.key).not.toBeUndefined();
    expect(tokenDetails?.metadata_key?.key).toBeUndefined();
  });

});
