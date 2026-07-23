import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function test() {
  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
    contents: "Say hello.",
  });

  console.log(response.text);
}

test().catch(console.error);