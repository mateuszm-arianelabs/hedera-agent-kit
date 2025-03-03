import { describe, it, beforeEach } from "vitest";
import { LangchainAgent } from "./utils/elizaApiClient";
import { ElizaOSPrompt } from "./types";
import * as dotenv from "dotenv";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("Test connection with Langchain", () => {
    beforeEach(async () => {
        dotenv.config();
        await wait(1000);
    });
    
    it("Test connection with Langchain", async () => {
        const agent = await LangchainAgent.create();
        const response = await agent.sendPrompt('Hello world!');
        console.log(response);

        expect(response).toBeDefined();
    });
});
