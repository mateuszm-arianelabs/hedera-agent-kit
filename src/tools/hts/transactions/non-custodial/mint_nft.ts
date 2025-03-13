import { AccountId, Client, TokenId, TokenMintTransaction, TransactionId } from "@hashgraph/sdk"

// supports adding one metadata with length max 100 bytes
// adding an array of metadatas is not implemented
export const mint_nft_non_custodial = async (
    client: Client,
    tokenId: TokenId,
    tokenMetadata: Uint8Array,
    issuerAccountId: AccountId | string
): Promise<string> => {
    const txId = TransactionId.generate(issuerAccountId);
    const tx = await new TokenMintTransaction()
        .setTokenId(tokenId)
        .addMetadata(tokenMetadata)
        .setTransactionId(txId);

    const frozenTx = tx.freezeWith(client);
    const frozenTxBytes: Uint8Array = frozenTx.toBytes();

    return Buffer.from(frozenTxBytes.buffer, frozenTxBytes.byteOffset, frozenTxBytes.byteLength).toString("base64");
}