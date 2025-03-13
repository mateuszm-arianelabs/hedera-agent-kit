import { Client, TokenId, AccountId, TokenAirdropTransaction, TransactionId } from "@hashgraph/sdk"

export interface AirdropRecipient {
  accountId: string | AccountId;
  amount: number;
}
//FIXME: tx throwing error while being signed
export const airdrop_token_non_custodial = async (
  client: Client,
  tokenId: TokenId,
  recipients: AirdropRecipient[],
  issuerAccountId: AccountId | string
): Promise<string> => {
  const txId = TransactionId.generate(issuerAccountId);
  const tx = new TokenAirdropTransaction();
  
  // Add token transfers for each recipient
  for (const recipient of recipients) {
    // Deduct from sender
    tx.addTokenTransfer(tokenId, issuerAccountId, -recipient.amount);
    // Add to recipient
    tx.addTokenTransfer(tokenId, recipient.accountId, recipient.amount);
  }

  tx.setTransactionId(txId);

  const frozenTx = tx.freezeWith(client);
  const frozenTxBytes: Uint8Array = frozenTx.toBytes();

  return Buffer.from(frozenTxBytes.buffer, frozenTxBytes.byteOffset, frozenTxBytes.byteLength).toString("base64");
} 