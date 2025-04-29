import { describe, expect, it, beforeAll } from "vitest";
import * as dotenv from "dotenv";
import { NetworkClientWrapper } from "../utils/testnetClient";
import { AccountData } from "../utils/testnetUtils";
import { HederaMirrorNodeClient } from "../utils/hederaMirrorNodeClient";
import { NetworkType } from "../types";
import { wait } from "../utils/utils";
import { LangchainAgent } from "../utils/langchainAgent";

const IS_CUSTODIAL = true;

dotenv.config();
describe("associate_token", () => {
    let tokenCreatorAccount: AccountData;
    let operatorAccount: AccountData;
    let token1: string;
    let token2: string;
    let networkClientWrapper: NetworkClientWrapper;
    let testCases: {
        tokenToAssociateId: string;
        promptText: string;
    }[];
    let hederaMirrorNodeClient: HederaMirrorNodeClient;

    beforeAll(async () => {
        try {
            hederaMirrorNodeClient = new HederaMirrorNodeClient("testnet" as NetworkType);

            networkClientWrapper = new NetworkClientWrapper(
                process.env.HEDERA_ACCOUNT_ID!,
                process.env.HEDERA_PRIVATE_KEY!,
                process.env.HEDERA_KEY_TYPE!,
                "testnet"
            );

            // Create test accounts
            await Promise.all([
                networkClientWrapper.createAccount(20, -1), // 20 initial HBAR required for token creations, -1 sets the maximum autoassociation to unlimited
                networkClientWrapper.createAccount(10, -1), // 10 initial HBAR required for token association, -1 sets the maximum autoassociation to unlimited
            ]).then(([_acc1, _acc2]) => {
                tokenCreatorAccount = _acc1; // account creating token
                operatorAccount = _acc2; // operator account that will call and execute the `associate token` action
            });

            const tokenCreatorAccountNetworkClientWrapper =
                new NetworkClientWrapper(
                    tokenCreatorAccount.accountId,
                    tokenCreatorAccount.privateKey,
                    "ECDSA",
                    "testnet"
                );

            // create tokens
            await Promise.all([
                tokenCreatorAccountNetworkClientWrapper.createFT({
                    name: "TokenToAssociate1",
                    symbol: "TTA1",
                    initialSupply: 1000,
                    decimals: 2,
                }),
                tokenCreatorAccountNetworkClientWrapper.createFT({
                    name: "TokenToAssociate2",
                    symbol: "TTA2",
                    initialSupply: 1000,
                    decimals: 2,
                }),
            ]).then(([_token1, _token2]) => {
                token1 = _token1;
                token2 = _token2;
            });


            testCases = [
                {
                    tokenToAssociateId: token1,
                    promptText: `Associate token ${token1} to my account`,
                },
                {
                    tokenToAssociateId: token2,
                    promptText: `Associate token ${token2} to my account`,
                },
            ];
        } catch (error) {
            console.error("Error in setup:", error);
            throw error;
        }
    });

    describe("associate token checks", () => {
        it("should associate token", async () => {
            for (const { promptText, tokenToAssociateId } of testCases || []) {
                const prompt = {
                    user: "user",
                    text: promptText,
                };

                // STEP 0: create an instance of agent with the created operator account
                const langchainAgent = await LangchainAgent.create(operatorAccount);

                console.log(`Prompt: ${promptText}`);
                console.log(JSON.stringify(operatorAccount, null, 2)); // operator and executor of the called action

                // STEP 1: send custodial prompt
                const response = await langchainAgent.sendPrompt(prompt, IS_CUSTODIAL);

                await wait(5000); // wait for the mirror node to update the account info

                // STEP 2: verify that the token has been associated
                const token = await hederaMirrorNodeClient.getAccountToken(
                  operatorAccount.accountId,
                  tokenToAssociateId
                );

                expect(token).toBeDefined();

                console.log('\n\n');
            }
        });
    });
});
