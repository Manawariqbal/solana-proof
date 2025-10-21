import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fileRoutes from "./routes/fileRoutes.js"; // ✅ your router file

dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Mount all routes
app.use("/", fileRoutes);

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
