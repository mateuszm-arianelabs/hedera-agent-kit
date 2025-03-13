import { AccountId, Client, TokenDissociateTransaction, TokenId, TransactionId } from "@hashgraph/sdk";

export const dissociate_token_non_custodial = async (
    client: Client,
    tokenId: TokenId,
    issuerAccountId: AccountId | string
): Promise<string> => {
    const txId = TransactionId.generate(issuerAccountId);
    const tx = await new TokenDissociateTransaction()
        .setAccountId(issuerAccountId)
        .setTokenIds([tokenId])
        .setTransactionId(txId);

    const frozenTx = tx.freezeWith(client);
    const frozenTxBytes: Uint8Array = frozenTx.toBytes();

    return Buffer.from(frozenTxBytes.buffer, frozenTxBytes.byteOffset, frozenTxBytes.byteLength).toString("base64");
}