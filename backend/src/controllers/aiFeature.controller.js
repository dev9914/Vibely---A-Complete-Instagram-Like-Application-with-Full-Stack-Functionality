import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { GoogleGenAI } from "@google/genai";

import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});


export const generateCaptionsFromImage = asyncHandler(async (req, res) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({
      message: "Image URL is required",
    });
  }
try {
  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",

    contents: [
      {
        role: "user",

        parts: [
          {
            fileData: {
              fileUri: imageUrl,
              mimeType: "image/jpeg",
            },
          },

          {
            text: `
You are a professional Instagram content creator.

Look at this image.

Generate exactly 5 different Instagram captions.

Rules:

- Each caption should be unique.
- Mix short and long captions.
- Add suitable emojis.
- Don't explain anything.
- Return ONLY captions.

Format:

1. caption

2. caption

3. caption

4. caption

5. caption
`,
          },
        ],
      },
    ],
  });


  const text = response.text;

  const captions = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^\d+\./.test(line));

  res.json({
    original: "Generated using Gemini Vision",
    aiCaptions: captions,
  });

} catch (error) {
   console.error("========== GEMINI ERROR ==========");
  console.error(error);
  console.error("==================================");

  return res.status(500).json({
    success: false,
    message: error.message,
    error,
  });
}
});


export const getImageUrl = asyncHandler(async ( req, res) => {
  const localImages = req.files?.image?.map(image => image.path)

  if (!localImages?.length) {
    return res.status(400).json({ message: 'No image file uploaded.' });
  }

  const result = await uploadOnCloudinary(localImages)
  console.log(result)

  if (!result?.length) {
    return res.status(500).json("Some Error Occured while uploading")
  }

  res.status(200).json({ imageUrl: result[0].secure_url });
});