import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import { OpenAI } from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const CANVA_URL = "https://ujora.my.canva.site/ujora";

let cachedContent = "";

async function fetchWebsiteContent() {
  if (cachedContent) return cachedContent;

  const response = await axios.get(CANVA_URL);
  cachedContent = response.data;
  return cachedContent;
}

app.post("/chat", async (req, res) => {
  try {
    const userQuestion = req.body.question;

    const websiteContent = await fetchWebsiteContent();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Ti je një asistent profesional që përgjigjet vetëm bazuar në përmbajtjen e faqes."
        },
        {
          role: "user",
          content: `
Përmbajtja e faqes:
${websiteContent}

Pyetja:
${userQuestion}
`
        }
      ],
      max_tokens: 300
    });

    res.json({
      answer: completion.choices[0].message.content
    });

  } catch (error) {
    res.status(500).json({ answer: "Gabim në server." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
