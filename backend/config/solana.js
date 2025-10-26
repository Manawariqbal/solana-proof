// backend/config/solana.js
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
  SystemProgram,
  sendAndConfirmTransaction,
  Transaction,
  PublicKey,
} from "@solana/web3.js";
import bs58 from "bs58";
import fs from "fs";
import path from "path";

const configDir = path.resolve("backend/config");
const walletPath = path.join(configDir, "wallet.json");
//const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// ✅ Initialize or load wallet
export const initWallet = async () => {
  fs.mkdirSync(configDir, { recursive: true });

  if (fs.existsSync(walletPath)) {
    const secret = Uint8Array.from(JSON.parse(fs.readFileSync(walletPath)));
    const wallet = Keypair.fromSecretKey(secret);
    console.log("🔑 Loaded wallet:", wallet.publicKey.toBase58());
    return wallet;
  }

  const wallet = Keypair.generate();
  fs.writeFileSync(walletPath, JSON.stringify(Array.from(wallet.secretKey)));
  console.log("🪙 New wallet created:", wallet.publicKey.toBase58());

  // fund wallet
  await fundWallet(wallet);
  return wallet;
};

// ✅ Get Solana connection
export const getConnection = () => connection;

// ✅ Fund wallet (airdrop 1 SOL if needed)
export const fundWallet = async (wallet) => {
  const balance = await connection.getBalance(wallet.publicKey);
  if (balance < 0.1 * LAMPORTS_PER_SOL) {
    console.log("💧 Airdropping 1 SOL to wallet...");
    const sig = await connection.requestAirdrop(wallet.publicKey, 1 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(sig, "confirmed");
    console.log("✅ Airdrop complete!");
  }
};

// ✅ Check wallet balance
export const getBalance = async (wallet) => {
  const balance = await connection.getBalance(wallet.publicKey);
  console.log(`💰 Wallet balance: ${balance / LAMPORTS_PER_SOL} SOL`);
  return balance;
};

// ✅ Helper: store hash + cid on-chain (Memo)
export const storeFileOnChain = async (hash, cid) => {
  try {
    const wallet = await initWallet();

    const memoData = JSON.stringify({ hash, cid });
    const memoIx = {
      keys: [],
      programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
      data: Buffer.from(memoData),
    };

    const tx = new Transaction().add(memoIx);
    const sig = await sendAndConfirmTransaction(connection, tx, [wallet]);
    const explorer = `https://explorer.solana.com/tx/${sig}?cluster=devnet`;

    console.log("✅ Stored on-chain:", explorer);
    return { success: true, signature: sig, explorer };
  } catch (err) {
    console.error("❌ storeFileOnChain error:", err);
    return { success: false, error: err.message };
  }
};
