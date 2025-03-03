import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage } from "@langchain/core/messages";
import { initializeAgent } from "./utils";

export class LangchainAgent {
  private constructor(
    private agent: ReturnType<typeof createReactAgent>,
    private config: { configurable: { thread_id: string } }
  ) {}

  static async create(): Promise<LangchainAgent> {
    const { agent, config } = await initializeAgent();
    return new LangchainAgent(agent, config);
  }

  async sendPrompt(prompt: string): Promise<any> {
    const test = await this.agent.invoke({
      messages: [new HumanMessage(prompt)],
    });
    return test;
  }
}
