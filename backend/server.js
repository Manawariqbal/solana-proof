import express from "express";
import multer from "multer";
import crypto from "crypto";
import fs from "fs";
import dotenv from "dotenv";
import { Connection, clusterApiUrl, Keypair, Transaction, SystemProgram } from "@solana/web3.js";

dotenv.config();

const app = express();
const upload = multer({ dest: "uploads/" });
const PORT = 5000;

// ✅ Solana Setup
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Load private key from .env (array format or base58)
let secretKey;
try {
  const keyData = JSON.parse(process.env.SOLANA_PRIVATE_KEY);
  secretKey = Uint8Array.from(keyData);
} catch {
  // fallback if base58 encoded
  const bs58 = await import("bs58");
  secretKey = Uint8Array.from(bs58.decode(process.env.SOLANA_PRIVATE_KEY));
}
const wallet = Keypair.fromSecretKey(secretKey);

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const fileBuffer = fs.readFileSync(req.file.path);
    const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

    console.log("✅ File hash:", hash);

    // 💰 Create Solana transaction with hash as memo
    const instruction = SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: wallet.publicKey, // self-transfer just to record memo
      lamports: 1, // very small amount, just to make it valid
    });

    // Add memo instruction
    const memoInstruction = new Transaction().add(instruction);
    memoInstruction.add({
      keys: [],
      programId: new (await import("@solana/web3.js")).PublicKey(
        "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
      ),
      data: Buffer.from(hash),
    });

    const signature = await connection.sendTransaction(memoInstruction, [wallet]);
    await connection.confirmTransaction(signature, "confirmed");

    const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;

    res.json({
      message: "File uploaded and verified on Solana",
      hash,
      filename: req.file.originalname,
      solana_signature: signature,
      explorer_url: explorerUrl,
    });
  } catch (err) {
    console.error("❌ Error uploading:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
