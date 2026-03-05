import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import Groq from "groq-sdk";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Fix __dirname for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------
// MIDDLEWARES
// --------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend folder
app.use(express.static(path.join(__dirname, "../frontend")));

// Root → open app.html automatically
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/app.html"));
});

// --------------------
// GROQ SETUP
// --------------------
if (!process.env.GROQ_API_KEY) {
  console.error("❌ GROQ_API_KEY missing in .env file");
  process.exit(1);
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// --------------------
// CHAT ROUTE (REAL AI)
// --------------------
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "Message required ❌" });
    }

    console.log("User Question:", message);

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
  role: "system",
  content:
    "You are an agriculture expert. Give clear, practical crop and farming advice in simple plain text. Do not use bold text, asterisks, markdown formatting, or special symbols. Write answers in normal paragraph style.",
},
        {
          role: "user",
          content: message,
        },
      ],
    });

    const aiReply = completion.choices[0].message.content;

    res.json({
      reply: aiReply,
    });

  } catch (error) {
    console.error("🔥 GROQ ERROR:");
    console.error(error);
    res.status(500).json({ reply: "AI processing failed ❌" });
  }
});

// --------------------
// IMAGE ROUTE (Mock)
// --------------------
const upload = multer({ storage: multer.memoryStorage() });

app.post("/detect", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ reply: "No image uploaded ❌" });
  }

  res.json({
    reply: "🌿 Image received. (You can connect real ML model here)",
  });
});

// --------------------
// START SERVER
// --------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});