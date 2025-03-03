import { PrivateKey } from "@hashgraph/sdk";

export const createPrivateKey = (privateKey: string): string => {
  let privateKeyDer: string;
  const keyType = checkKeyType(privateKey);

  if (keyType === "ECDSA") {
    try {
      privateKeyDer = PrivateKey.fromStringECDSA(privateKey).toStringDer();
    } catch (error) {
      throw new Error(`Invalid private key`);
    }
  } else {
    try {
      privateKeyDer = PrivateKey.fromStringED25519(privateKey).toStringDer();
    } catch (error) {
      throw new Error(`Invalid private key`);
    }
  }

  return privateKeyDer;
};

function checkKeyType(privateKeyString: string): "ED25519" | "ECDSA" {
  try {
    // Attempt to create an ED25519 key
    PrivateKey.fromStringED25519(privateKeyString);
    return "ED25519";
  } catch (ed25519Error) {
    // If ED25519 fails, attempt to create an ECDSA key
    PrivateKey.fromStringECDSA(privateKeyString);
    return "ECDSA";
  }
}
