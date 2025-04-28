import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage } from "@langchain/core/messages";
import { initializeAgent } from "./utils";
import { StateType } from "@langchain/langgraph";
import { ExecutorAccountDetails } from "../../types";
import { AccountData } from "./testnetUtils";

/**
 * Represents a LangchainAgent, providing functionalities to interact with the LangChain framework by utilizing agent
 * invocation techniques and customizable configurations.
 *
 * **NOTE: This class is used for automatic tests only!**
 */
export class LangchainAgent {
  private constructor(
    private agent: ReturnType<typeof createReactAgent>,
    private config: { configurable: { thread_id: string } }
  ) {}

  /**
   * Creates a new instance of LangchainAgent by initializing an agent and configuration data.
   *
   * @param {AccountData} [operatorAccountData] - Optional account data required to initialize the agent.
   * **If not passed, the agent for an account defined in the `.env` file will be created.**
   * @return {Promise<LangchainAgent>} A promise that resolves to a new instance of LangchainAgent.
   */
  static async create(operatorAccountData?: AccountData): Promise<LangchainAgent> {
    const { agent, config } = await initializeAgent(operatorAccountData);
    return new LangchainAgent(agent, config);
  }

  async sendPrompt(prompt: { text: string }, isCustodial?: boolean, executorAccountDetails?: ExecutorAccountDetails): Promise<StateType<any>> {
    console.log(`invoking agent`);

    return await this.agent.invoke(
      {
        messages: [new HumanMessage(prompt.text)],
      },
      {...this.config, configurable: {...this.config.configurable, isCustodial, executorAccountDetails}}
    );
  }
}
