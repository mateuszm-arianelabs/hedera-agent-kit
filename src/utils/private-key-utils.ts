import { PrivateKey } from "@hashgraph/sdk";
import { createBaseMirrorNodeApiUrl } from "./api-utils";
import { Account, HederaNetworkType } from "../types";

export async function createPrivateKey(
  privateKey: string,
  accountId: string
): Promise<string> {
  let privateKeyDer: string;
  const keyType = await getAccountType(accountId);

  if (keyType === "ECDSA") {
    privateKeyDer = PrivateKey.fromStringECDSA(privateKey).toStringDer();
  } else {
    privateKeyDer = PrivateKey.fromStringED25519(privateKey).toStringDer();
  }

  const accountIdMatchesPrivateKey = await checkIfAccountIdMatchesPrivateKey(
    accountId,
    privateKeyDer
  );

  if (!accountIdMatchesPrivateKey) {
    throw new Error(`Account id does not match private key`);
  }

  return privateKeyDer;
}

async function getAccountType(accountId: string): Promise<"ED25519" | "ECDSA"> {
  const account = await fetchAccountInfo(accountId);

  switch (account.key._type) {
    case "ED25519":
      return "ED25519";
    case "ECDSA_SECP256K1":
      return "ECDSA";
    default:
      throw new Error(`Invalid account type`);
  }
}

async function checkIfAccountIdMatchesPrivateKey(
  accountId: string,
  privateKey: string
): Promise<boolean> {
  const account = await fetchAccountInfo(accountId);
  const accountType = await getAccountType(accountId);

  const publicKey =
    accountType === "ECDSA"
      ? PrivateKey.fromStringECDSA(privateKey).publicKey
      : PrivateKey.fromStringED25519(privateKey).publicKey;

  return publicKey.toStringRaw() === account.key.key;
}

async function fetchAccountInfo(accountId: string): Promise<Account> {
  const baseUrl = createBaseMirrorNodeApiUrl(
    process.env.HEDERA_NETWORK as HederaNetworkType
  );
  const url = `${baseUrl}/api/v1/accounts/${accountId.toString()}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch account info: ${response.statusText}`);
  }

  const data: Account = await response.json();

  return data;
}
