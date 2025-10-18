import {
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  PublicKey,
} from "@solana/web3.js";
import { getConnection, initWallet, fundWallet } from "../config/solana.js";
import { MemoProgram } from "@solana/spl-memo";

export const storeHashOnSolana = async (req, res) => {
  try {
    const { hash } = req.body;
    if (!hash) return res.status(400).json({ error: "Hash is required" });

    const connection = getConnection();
    const wallet = await initWallet();
    await fundWallet(wallet);

    // 🧠 Add hash to the blockchain using the Memo program (clean metadata)
    const instruction = MemoProgram.writeUtf8(wallet.publicKey, hash);

    const tx = new Transaction().add(instruction);
    const signature = await sendAndConfirmTransaction(connection, tx, [wallet]);

    res.json({
      message: "✅ File hash stored on Solana",
      hash,
      signature,
      explorer: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
    });
  } catch (error) {
    console.error("❌ Solana Error:", error);
    res.status(500).json({ error: "Failed to store on Solana" });
  }
};
