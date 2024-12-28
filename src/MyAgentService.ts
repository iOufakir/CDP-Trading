import { CdpAgentkit } from "@coinbase/cdp-agentkit-core";
import { CdpToolkit } from "@coinbase/cdp-langchain";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import * as readline from "readline";
import { WalletData } from "@coinbase/coinbase-sdk";

export default class MyAgentService {
  /**
   * Initialize the agent with CDP AgentKit
   *
   * @returns Agent executor and config
   */
  public initializeAgent = async (config: any) => {
    // Initialize LLM
    const llm = new ChatOpenAI({
      model: "gpt-4o-mini",
    });

    // Initialize CDP AgentKit
    const agentkit = await CdpAgentkit.configureWithWallet(config);
    console.log("Exporting wallet data...");

    // Initialize CDP AgentKit Toolkit and get tools
    const cdpToolkit = new CdpToolkit(agentkit);
    const tools = cdpToolkit.getTools();

    // Store buffered conversation history in memory
    const memory = new MemorySaver();
    const agentConfig = { configurable: { thread_id: "CDP AgentKit Chatbot Example!" } };

    // Create React Agent using the LLM and CDP AgentKit tools
    const agent = createReactAgent({
      llm,
      tools,
      checkpointSaver: memory,
      messageModifier:
        "You are a helpful agent that can interact onchain using the Coinbase Developer Platform AgentKit...",
    });

    return { agent, config: agentConfig };
  };

  /**
   * Run the agent interactively based on user input
   *
   * @param agent - The agent executor
   * @param config - Agent configuration
   */
  public runChatMode = async (agent: any, config: any) => {
    console.log("Starting chat mode... Type 'exit' to end.");

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const question = (prompt: string): Promise<string> => new Promise((resolve) => rl.question(prompt, resolve));

    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const userInput = await question("\nPrompt: ");

        if (userInput.toLowerCase() === "exit") {
          break;
        }

        const stream = await agent.stream({ messages: [new HumanMessage(userInput)] }, config);

        for await (const chunk of stream) {
          if ("agent" in chunk) {
            console.log(chunk.agent.messages[0].content);
          } else if ("tools" in chunk) {
            console.log(chunk.tools.messages[0].content);
          }
          console.log("-------------------");
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error:", error.message);
      }
      process.exit(1);
    } finally {
      rl.close();
    }
  };

  startAgent = async (myWalletData: WalletData) => {
    console.log("Starting Agent...");
    const config = {
      cdpWalletData: JSON.stringify(myWalletData),
      networkId: process.env.NETWORK_ID || "base-sepolia",
    };

    this.initializeAgent(config)
      .then(({ agent, config }) => this.runChatMode(agent, config))
      .catch((error) => {
        console.error("Fatal error:", error);
        process.exit(1);
      });
  };
}
