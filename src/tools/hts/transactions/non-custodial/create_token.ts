import {
  AccountId,
  Client,
  PublicKey,
  TokenCreateTransaction,
  TokenSupplyType,
  TokenType,
  TransactionId
} from "@hashgraph/sdk";

export interface CreateTokenOptions {
  name: string;
  symbol: string;
  decimals?: number;
  initialSupply?: number;
  isSupplyKey?: boolean;
  tokenType: TokenType;
  maxSupply?: number;
  isMetadataKey?: boolean;
  isAdminKey?: boolean;
  tokenMetadata?: Uint8Array;
  memo?: string;
}

export const create_token_non_custodial = async (
    client: Client,
    publicKey: PublicKey,
    options: CreateTokenOptions,
    issuerAccountId: AccountId | string
): Promise<string> => {
  const txId = TransactionId.generate(issuerAccountId);

  const tx = new TokenCreateTransaction()
      .setTokenName(options.name)
      .setTokenSymbol(options.symbol)
      .setTokenType(options.tokenType)
      .setDecimals(options.decimals || 0)
      .setInitialSupply(options.initialSupply || 0)
      .setTreasuryAccountId(issuerAccountId);

  // Optional and conditional parameters
  if (options.maxSupply) {
    tx.setMaxSupply(options.maxSupply).setSupplyType(TokenSupplyType.Finite);
  }
  if (options.tokenMetadata) {
    tx.setMetadata(options.tokenMetadata);
  }
  if (options.memo) {
    tx.setTokenMemo(options.memo);
  }
  if (options.isMetadataKey) {
    tx.setMetadataKey(publicKey);
  }
  if (options.isSupplyKey) {
    tx.setSupplyKey(publicKey);
  }
  if (options.isAdminKey) {
    tx.setAdminKey(publicKey);
  }

  tx.setTransactionId(txId);

  const frozenTx = tx.freezeWith(client);
  const frozenTxBytes: Uint8Array = frozenTx.toBytes();

  return Buffer.from(frozenTxBytes.buffer, frozenTxBytes.byteOffset, frozenTxBytes.byteLength).toString("base64");
};