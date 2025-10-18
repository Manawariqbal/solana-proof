import { Keypair } from "@solana/web3.js";
import fs from "fs";

const wallet = Keypair.generate();

console.log("Public Key:", wallet.publicKey.toBase58());
console.log("Private Key (array):", Array.from(wallet.secretKey));

fs.writeFileSync(
  "wallet.json",
  JSON.stringify({
    publicKey: wallet.publicKey.toBase58(),
    secretKey: Array.from(wallet.secretKey),
  })
);

console.log("✅ Wallet saved to wallet.json");
