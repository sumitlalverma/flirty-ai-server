import express from "express";
import cors from "cors";
import getRepliesFromChatGPT from "./puppeteer.js";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/generate-replies", async (req, res) => {
  const { messages, mood } = req.body;

  if (!Array.isArray(messages) || !mood) {
    return res.status(400).json({ error: "Missing messages or mood" });
  }

  try {
    const replies = await getRepliesFromChatGPT(messages, mood);
    res.json({ replies });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong scraping replies" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🔥 Server running on http://localhost:${PORT}`)
);
