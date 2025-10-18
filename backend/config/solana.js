import {
  Connection,
  Keypair,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

export const getConnection = () => connection;

export const initWallet = async () => {
  const secretKeyArray = JSON.parse(process.env.SOLANA_PRIVATE_KEY);
  const wallet = Keypair.fromSecretKey(Uint8Array.from(secretKeyArray));
  console.log("✅ Wallet Loaded:", wallet.publicKey.toBase58());
  return wallet;
};

export const fundWallet = async (wallet) => {
  const balance = await connection.getBalance(wallet.publicKey);
  if (balance / LAMPORTS_PER_SOL < 0.1) {
    console.log("💰 Requesting airdrop...");
    const sig = await connection.requestAirdrop(wallet.publicKey, 2 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(sig, "confirmed");
    console.log("✅ Airdrop successful! Signature:", sig);
  } else {
    console.log("💎 Wallet already funded:", balance / LAMPORTS_PER_SOL, "SOL");
  }
};

export const getBalance = async (wallet) => {
  const balance = await connection.getBalance(wallet.publicKey);
  return balance / LAMPORTS_PER_SOL;
};
