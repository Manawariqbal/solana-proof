import express from "express";
import multer from "multer";
import { uploadFile, verifyFile } from "../controllers/fileController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("file"), uploadFile);
router.post("/verify", verifyFile);

export default router;
