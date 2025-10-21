import fs from "fs";
import crypto from "crypto";
import { Transaction, SystemProgram, PublicKey } from "@solana/web3.js";
import { getConnection, initWallet } from "../config/solana.js";

const connection = getConnection();

/**
 * Upload File (generate hash)
 */
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileBuffer = fs.readFileSync(req.file.path);
    const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

    console.log("✅ File uploaded with hash:", hash);
    res.json({
      message: "File uploaded successfully",
      filename: req.file.originalname,
      hash,
    });
  } catch (err) {
    console.error("❌ Error in uploadFile:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Verify File (local hash match)
 */
export const verifyFile = async (req, res) => {
  try {
    const { hash, filename } = req.body;

    if (!hash || !filename) {
      return res.status(400).json({ message: "❌ Missing hash or filename" });
    }

    const filePath = `uploads/${filename}`;
    console.log("🧩 Verifying file:", filePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "❌ File not found",
        hint: "Check your uploads/ folder and filename being sent",
      });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const computedHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

    const isMatch = computedHash === hash;

    console.log("🔍 Computed Hash:", computedHash);
    console.log("🔍 Provided Hash:", hash);

    return res.json({
      message: isMatch
        ? "✅ File verified successfully"
        : "❌ File hash mismatch",
      isMatch,
      computedHash,
      expectedHash: hash,
      filename,
    });
  } catch (error) {
    console.error("❌ Error verifying file:", error);
    return res.status(500).json({ error: "Failed to verify file" });
  }
};
/**
 * Store File Hash on Solana
 */
export const storeHashOnSolana = async (req, res) => {
  try {
    const { hash } = req.body;
    if (!hash) return res.status(400).json({ message: "File hash required" });

    const wallet = await initWallet();

    const instruction = SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: wallet.publicKey,
      lamports: 1, // minimum transfer
    });

    const transaction = new Transaction().add(instruction);

    // Add memo instruction manually
    transaction.add({
      keys: [],
      programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
      data: Buffer.from(hash),
    });

    const signature = await connection.sendTransaction(transaction, [wallet]);
    await connection.confirmTransaction(signature, "confirmed");

    const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;

    res.json({
      message: "✅ File hash stored on Solana",
      hash,
      solana_signature: signature,
      explorer_url: explorerUrl,
    });
  } catch (err) {
    console.error("❌ Error storing hash on Solana:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Verify File Hash on Solana
 */
export const verifyFileOnChain = async (req, res) => {
  try {
    const { hash } = req.body;
    if (!hash) return res.status(400).json({ message: "File hash required" });

    // In production, you'd fetch recent transactions and search for hash in memo
    res.json({
      message: "✅ (Mock) Verification successful",
      verified: true,
      hash,
    });
  } catch (err) {
    console.error("❌ Error verifying on-chain:", err);
    res.status(500).json({ error: err.message });
  }
};
