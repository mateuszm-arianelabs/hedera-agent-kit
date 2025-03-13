import { AccountId, Client, TokenId, TokenMintTransaction, TransactionId } from "@hashgraph/sdk"

export const mint_token_non_custodial = async (
    client: Client,
    tokenId: TokenId,
    amount: number,
    issuerAccountId: AccountId | string
): Promise<string> => {
    const txId = TransactionId.generate(issuerAccountId);
    const tx = await new TokenMintTransaction()
        .setTokenId(tokenId)
        .setAmount(amount)
        .setTransactionId(txId);

    const frozenTx = tx.freezeWith(client);
    const frozenTxBytes: Uint8Array = frozenTx.toBytes();

    return Buffer.from(frozenTxBytes.buffer, frozenTxBytes.byteOffset, frozenTxBytes.byteLength).toString("base64");
}