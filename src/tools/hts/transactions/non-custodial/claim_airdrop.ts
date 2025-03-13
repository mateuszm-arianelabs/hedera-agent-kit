import { Client, TokenClaimAirdropTransaction, PendingAirdropId, AccountId, TransactionId } from "@hashgraph/sdk"

export const claim_airdrop_non_custodial = async (
    client: Client,
    airdropId: PendingAirdropId,
    issuerAccountId: AccountId | string
): Promise<string> => {
    const txId = TransactionId.generate(issuerAccountId);
    const tx = new TokenClaimAirdropTransaction()
        .addPendingAirdropId(airdropId)
        .freezeWith(client)
        .setTransactionId(txId);

    const frozenTx = tx.freezeWith(client);
    const frozenTxBytes: Uint8Array = frozenTx.toBytes();

    return Buffer.from(frozenTxBytes.buffer, frozenTxBytes.byteOffset, frozenTxBytes.byteLength).toString("base64");
}