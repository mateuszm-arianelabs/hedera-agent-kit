import { AccountId, Client, TokenId, TransactionId, TransferTransaction } from "@hashgraph/sdk"

export const transfer_token_non_custodial = async (
    tokenId: string | TokenId,
    toAccountId: string | AccountId,
    amount: number,
    fromAccountId: string | AccountId,
    client: Client,
): Promise<string> => {
    const txId = TransactionId.generate(toAccountId);
    const tx = new TransferTransaction()
        .addTokenTransfer(tokenId, fromAccountId, -amount)
        .addTokenTransfer(tokenId, toAccountId, amount)
        .setTransactionId(txId);

    const frozenTx = tx.freezeWith(client);
    const frozenTxBytes: Uint8Array = frozenTx.toBytes();

    return Buffer.from(frozenTxBytes.buffer, frozenTxBytes.byteOffset, frozenTxBytes.byteLength).toString("base64");
}