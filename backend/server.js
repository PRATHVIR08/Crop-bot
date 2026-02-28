import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import multer from "multer";

dotenv.config();
console.log("GROQ KEY:", process.env.GROQ_API_KEY);

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Multer setup for in-memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Test route
app.get("/", (req, res) => {
  res.send("CropBot backend is running 🌱");
});

// Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Chat route
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "Message is required" });
    }

    const completion = await groq.chat.completions.create({
     model: "llama-3.1-8b-instant",
 // Free & fast
      messages: [
        {
          role: "system",
          content: "You are an agriculture expert. Give clear, practical farming advice.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });

  } catch (error) {
  console.error("🔥 GROQ FULL ERROR 🔥");
  console.error(error);
  res.status(500).json({ reply: "Backend error ❌" });
}

});

// Detect Route (Mock Machine Learning Model)
app.post("/detect", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ reply: "No image provided." });
    }
    
    // Simulate processing time
    setTimeout(() => {
        const diseases = [
          "Early Blight",
          "Late Blight",
          "Leaf Mold",
          "Powdery Mildew",
          "Healthy Plant",
          "Spider Mites",
          "Target Spot",
          "Mosaic Virus",
          "Yellow Leaf Curl Virus"
        ];
        // Select a random disease
        const randomDisease = diseases[Math.floor(Math.random() * diseases.length)];
        
        res.json({ reply: `Detection Complete: ${randomDisease}` });
    }, 1500);

  } catch (error) {
    console.error("Detect Error:", error);
    res.status(500).json({ reply: "Image processing failed ❌" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
