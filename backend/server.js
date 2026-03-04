import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Fix __dirname for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend folder
app.use(express.static(path.join(__dirname, "../frontend")));

// Root → open app.html automatically
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/app.html"));
});

// Chat Route
app.post("/chat", (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ reply: "Message required ❌" });
  }

  console.log("Received:", message);

  res.json({
    reply: "Backend connected successfully ✅",
  });
});

// Image Route
const upload = multer({ storage: multer.memoryStorage() });

app.post("/detect", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ reply: "No image uploaded ❌" });
  }

  res.json({
    reply: "Image received by backend successfully 🌿",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});