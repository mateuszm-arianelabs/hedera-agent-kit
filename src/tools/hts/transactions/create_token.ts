import { Client, TokenCreateTransaction } from "@hashgraph/sdk"
import { CreateTokenResult } from "../../../types";

// to do: make more generic so can handle nft as well
// atm just does ft
export const create_token = async (
  name: string,
  symbol: string,
  decimals: number,
  initialSupply: number,
  isSupplyKey: boolean,
  client: Client
): Promise<CreateTokenResult> => {
  const tx = new TokenCreateTransaction()
    .setTokenName(name)
    .setTokenSymbol(symbol)
    .setDecimals(decimals)
    .setInitialSupply(initialSupply)
    .setTreasuryAccountId(client.operatorAccountId!)

  if(isSupplyKey)
      tx.setSupplyKey(client.operatorPublicKey!);

  const txResponse = await tx.execute(client)
  const receipt = await txResponse.getReceipt(client)
  const txStatus = receipt.status;

  if (!receipt.tokenId)
    throw new Error("Token Create Transaction failed")

  return {
    status: txStatus.toString(),
    txHash: txResponse.transactionId.toString(),
    tokenId: receipt.tokenId
  }
}
