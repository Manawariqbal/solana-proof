// backend/controllers/fileController.js
import bs58 from "bs58";

import crypto from "crypto";
import fs from "fs";
import path from "path";
import { getConnection, initWallet, fundWallet, getBalance } from "../config/solana.js";
import { Transaction, PublicKey } from "@solana/web3.js";
import { uploadToIPFS } from "../config/ipfs.js";

const fileHashes = {}; // optional in-memory store

// helper to build memo payload
const buildMemo = (hash, cid) => JSON.stringify({ hash, cid });

// 🧾 Upload file and return hash + saved filename
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = path.join("uploads", req.file.filename);
    const fileBuffer = fs.readFileSync(filePath);
    const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

    fileHashes[req.file.filename] = {
      originalName: req.file.originalname,
      hash,
      uploadedAt: new Date().toISOString(),
    };

    return res.status(200).json({
      message: "✅ File uploaded successfully",
      hash,
      filename: req.file.filename,
      originalName: req.file.originalname,
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Verify file hash locally (optional)
export const verifyFile = async (req, res) => {
  try {
    const { hash, filename } = req.body;
    if (!hash || !filename)
      return res.status(400).json({ message: "Missing hash or filename" });

    const filePath = path.join("uploads", filename);
    if (!fs.existsSync(filePath))
      return res.status(404).json({ message: "❌ File not found" });

    const fileBuffer = fs.readFileSync(filePath);
    const computedHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

    const isMatch = computedHash === hash;
    res.json({ isMatch, computedHash });
  } catch (err) {
    console.error("❌ Error verifying file:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🌐 Store hash + IPFS CID on Solana (upload file to IPFS first)
export const storeHashOnSolana = async (req, res) => {
  try {
    const { filename, hash } = req.body;
    if (!hash) return res.status(400).json({ error: "Hash is required" });

    let filePath = null;
    if (filename) {
      filePath = path.join("uploads", filename);
      if (!fs.existsSync(filePath)) filePath = null;
    }

    let cid = null;
    if (filePath) {
      cid = await uploadToIPFS(filePath, filename || "file");
    }

    const connection = getConnection();
    const wallet = await initWallet();
    await fundWallet(wallet);

    const memoString = buildMemo(hash, cid || null);

    const memoInstruction = {
      keys: [],
      programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
      data: Buffer.from(memoString),
    };

    const tx = new Transaction().add(memoInstruction);
    const signature = await connection.sendTransaction(tx, [wallet]);
    await connection.confirmTransaction(signature, "confirmed");

    const explorer = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;

    return res.json({
      message: "✅ File hash and CID stored on Solana",
      hash,
      cid,
      signature,
      explorer,
    });
  } catch (err) {
    console.error("❌ storeHashOnSolana error:", err);
    return res.status(500).json({ error: err.message });
  }
};

export const verifyFileOnChain = async (req, res) => {
  try {
    const { hash, cid } = req.body;
    if (!hash && !cid) {
      return res.status(400).json({ error: "hash or cid is required" });
    }

    const connection = getConnection();
    const wallet = await initWallet();

    console.log("🔍 Checking recent transactions for wallet:", wallet.publicKey.toBase58());
    const sigInfos = await connection.getSignaturesForAddress(wallet.publicKey, { limit: 50 });

    for (const s of sigInfos) {
      const tx = await connection.getTransaction(s.signature, { commitment: "confirmed" });
      if (!tx) continue;

      const instructions = tx.transaction?.message?.instructions || [];
      for (const ix of instructions) {
        try {
          const programId = ix.programId?.toString();
          if (programId === "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr") {
            // 🧩 Decode base58 data safely
            let dataStr;
            try {
              dataStr = Buffer.from(bs58.decode(ix.data)).toString("utf8");
            } catch {
              dataStr = ix.data?.toString() || "";
            }

            // 🧠 Attempt to parse JSON memo payload
            let parsed;
            try {
              parsed = JSON.parse(dataStr);
            } catch {
              parsed = dataStr;
            }

            // 🔍 Check match
            if (typeof parsed === "object" && parsed !== null) {
              if ((hash && parsed.hash === hash) || (cid && parsed.cid === cid)) {
                return res.json({
                  verified: true,
                  match: parsed,
                  signature: s.signature,
                  explorer: `https://explorer.solana.com/tx/${s.signature}?cluster=devnet`,
                });
              }
            } else if (
              (hash && parsed.includes(hash)) ||
              (cid && parsed.includes(cid))
            ) {
              return res.json({
                verified: true,
                match: parsed,
                signature: s.signature,
                explorer: `https://explorer.solana.com/tx/${s.signature}?cluster=devnet`,
              });
            }
          }
        } catch (innerErr) {
          continue;
        }
      }
    }

    return res.json({ verified: false, message: "Not found on-chain in recent transactions" });
  } catch (err) {
    console.error("❌ verifyFileOnChain error:", err);
    return res.status(500).json({ error: err.message });
  }
};
