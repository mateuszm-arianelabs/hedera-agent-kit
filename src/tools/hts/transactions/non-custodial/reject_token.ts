import { AccountId, Client, TokenId, TokenRejectTransaction, TransactionId } from "@hashgraph/sdk";

export const reject_token_non_custodial = async (
    client: Client,
    tokenId: TokenId,
    issuerAccountId: AccountId | string
): Promise<string> => {
    // setOwnerId requires passing AccountId object
    const accountId: AccountId = typeof issuerAccountId === "string"
        ? AccountId.fromString(issuerAccountId)
        : issuerAccountId;

    const txId = TransactionId.generate(accountId);
    const tx = new TokenRejectTransaction()
        .setOwnerId(accountId) // requires passing account id as an object
        .addTokenId(tokenId)
        .setTransactionId(txId);

    const frozenTx = tx.freezeWith(client);
    const frozenTxBytes: Uint8Array = frozenTx.toBytes();

    return Buffer.from(frozenTxBytes.buffer, frozenTxBytes.byteOffset, frozenTxBytes.byteLength).toString("base64");
}