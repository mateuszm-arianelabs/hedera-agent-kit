import { describe, expect, it, beforeAll, beforeEach } from "vitest";
import { NetworkType } from "./types";
import * as dotenv from "dotenv";
import { NetworkClientWrapper } from "./utils/testnetClient";
import { HederaMirrorNodeClient } from "./utils/hederaMirrorNodeClient";
import { LangchainAgent } from "./utils/langchainAgent";
import { wait } from "./utils/utils";

dotenv.config();

const IS_CUSTODIAL = true;

describe("hedera_mint_fungible_token", () => {
    let langchainAgent: LangchainAgent;
    let hederaApiClient: HederaMirrorNodeClient;
    let networkClientWrapper: NetworkClientWrapper;

    beforeAll(async () => {
            hederaApiClient = new HederaMirrorNodeClient("testnet" as NetworkType);
            networkClientWrapper = new NetworkClientWrapper(
                process.env.HEDERA_ACCOUNT_ID!,
                process.env.HEDERA_PRIVATE_KEY!,
                process.env.HEDERA_PUBLIC_KEY!,
                process.env.HEDERA_KEY_TYPE!,
                "testnet"
            );
        }
    );

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
        await langchainAgent.sendPrompt(prompt, IS_CUSTODIAL);

        await wait(5000);

        const tokenInfo =
            await hederaApiClient.getTokenDetails(tokenId);


        expect(Number(tokenInfo.total_supply)).toBe(STARTING_SUPPLY + TOKENS_TO_MINT);
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
        const resp = await langchainAgent.sendPrompt(prompt, IS_CUSTODIAL);

        await wait(5000);

        const tokenInfo =
            await hederaApiClient.getTokenDetails(tokenId);


        expect(Number(tokenInfo.total_supply)).toBe(STARTING_SUPPLY);
    });
});
