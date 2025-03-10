import { LangchainAgent } from "../src/tests/utils/langchainAgent";
import { HederaAgentKit, HederaNetworkType } from "../src";
import { toBaseUnit, toDisplayUnit } from "../src/utils/hts-format-utils";

type MintFTResponse = {
    status: string;
    message: string;
    tokenId: string;
    amount: number; // returned in base unit
    txHash: string; // returned as raw transaction hash
};

// Extracts relevant data from Langchain response
const extractDataFromLangchainResponse = (messages: any): MintFTResponse => {
    const message = messages.find((msg: any) =>
        (msg.id && msg.id[2] === "ToolMessage") || msg.name === "hedera_mint_fungible_token"
    );
    return JSON.parse(message.content);
};

// Generates a Hashscan URL for viewing transaction details
const generateHashscanUrl = (txHash: string, networkType: HederaNetworkType): string =>
    `https://hashscan.io/${networkType}/tx/${txHash}`;

// Utility function to wait for a specified duration
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const main = async () => {
    const AMOUNT_TO_MINT_IN_DISPLAY_UNIT = 100;
    const DECIMALS = 2;

    try {
        // Initialize Langchain agent
        const langchainAgent = await LangchainAgent.create();

        // Initialize Hedera Agent Kit with credentials
        const kit = new HederaAgentKit(
            process.env.HEDERA_ACCOUNT_ID!,
            process.env.HEDERA_PRIVATE_KEY!,
            "testnet"
        );

        // Create a new fungible token with specific properties
        const { tokenId } = await kit.createFT({
            decimals: DECIMALS,
            initialSupply: 0,
            isAdminKey: true,
            isMetadataKey: true,
            isSupplyKey: true,
            memo: "Token Memo",
            name: "Example",
            symbol: "EXMPL",
            tokenMetadata: new TextEncoder().encode("Token Metadata"),
        });

        const tokenIdString = tokenId.toString();
        console.log(`PREPARATION\nCreated token:\nID: ${tokenIdString}\nDecimals: ${DECIMALS}`);

        // Wait for the Hedera mirror node to refresh with new token data
        await wait(5000);

        // Action of minting fungible tokens
        console.log('\nINPUT');
        console.log(`Minting ${AMOUNT_TO_MINT_IN_DISPLAY_UNIT} tokens (display unit)`);
        console.log(`Id of token to be minted: ${tokenIdString}`);

        // Convert display unit amount to base unit before minting
        const amountToMint = await toBaseUnit(tokenIdString, AMOUNT_TO_MINT_IN_DISPLAY_UNIT, "testnet");
        console.log(`Converted to base unit: ${amountToMint}`);

        // Prepare the Langchain prompt
        const prompt = { user: "user", text: `Mint ${amountToMint} of tokens with id ${tokenIdString}` };
        console.log(`Prompt: ${prompt.text}`);

        // Call the Langchain agent to process the prompt
        console.log('\nACTION');
        const langchainResponse = await langchainAgent.sendPrompt(prompt);

        // Extract minting response details from Langchain output
        const extractedData = extractDataFromLangchainResponse(langchainResponse.messages);

        // Convert the base unit amount back to display unit for readability
        const parsedAmount = await toDisplayUnit(tokenIdString, extractedData.amount, "testnet");

        // Generate a link to view transaction details on Hashscan
        const transactionLink = generateHashscanUrl(extractedData.txHash, "testnet");

        console.log('\nRESULT');
        console.log(`Minting successful! Parsed amount: ${parsedAmount}.`);
        console.log(`Transaction Link: ${transactionLink}`);
    } catch (error) {
        console.error(`An error occurred: ${error}`);
    }
};

main();
