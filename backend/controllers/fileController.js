import crypto from "crypto";
import fs from "fs";
import path from "path";

const fileHashes = {}; // temporary in-memory store (use DB later)

export const uploadFile = (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = path.join("uploads", req.file.filename);
    const fileBuffer = fs.readFileSync(filePath);

    // Generate SHA256 hash
    const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

    // Store hash
    fileHashes[hash] = {
      originalName: req.file.originalname,
      uploadedAt: new Date(),
    };

    res.status(200).json({
      message: "File uploaded successfully",
      hash,
      filename: req.file.originalname,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const verifyFile = (req, res) => {
  try {
    const { hash } = req.body;
    if (!hash) return res.status(400).json({ error: "No hash provided" });

    const record = fileHashes[hash];
    if (!record) return res.status(404).json({ message: "File not found" });

    res.status(200).json({
      message: "File verified",
      record,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
