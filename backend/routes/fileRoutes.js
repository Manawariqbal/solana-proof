// backend/routes/fileRoutes.js
import express from "express";
import multer from "multer";
import {
  uploadFile,
  verifyFile,
  storeHashOnSolana,
  verifyFileOnChain, // ✅ add this import
} from "../controllers/fileController.js";
import { initWallet, getBalance } from "../config/solana.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// 🧾 Upload a file and get its hash
router.post("/upload", upload.single("file"), uploadFile);

// ✅ Verify a file hash locally
router.post("/verify", verifyFile);

// 🌐 Store file hash on Solana blockchain
router.post("/onchain", storeHashOnSolana);

// 🔗 Verify file hash on-chain (Solana)
router.post("/verify-onchain", verifyFileOnChain); // ✅ add this route

// 💰 Check wallet balance
router.get("/balance", async (req, res) => {
  try {
    const wallet = await initWallet();
    const balance = await getBalance(wallet);
    res.json({
      publicKey: wallet.publicKey.toBase58(),
      balance: `${balance} SOL`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get wallet balance" });
  }
});

export default router;
