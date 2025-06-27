import axios from 'axios';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import dotenv from 'dotenv';
dotenv.config();

export const generateCaptionsFromImage = asyncHandler(async (req, res) => {
  const { imageUrl } = req.body;

  // Step 1: Get basic caption from Replicate (BLIP model)
  const replicateResponse = await axios.post(
    'https://api.replicate.com/v1/predictions',
    {
      version: '2e1dddc8621f72155f24cf2e0adbde548458d3cab9f00c0139eea840d0ac4746',
      input: { image: imageUrl },
    },
    {
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const predictionUrl = replicateResponse.data.urls.get;

  // Poll until caption is ready
  let captionText;
  while (true) {
    const prediction = await axios.get(predictionUrl, {
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
      },
    });

    if (prediction.data.status === 'succeeded') {
      captionText = prediction.data.output;
      break;
    } else if (prediction.data.status === 'failed') {
      throw new Error('Replicate captioning failed.');
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Step 2: Use Gemini API to generate stylish Instagram captions
const response = await axios.post(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
  {
    contents: [
      {
        parts: [
          {
            text: `
You are an assistant that generates clean Instagram captions based on a photo description.

Always return output in this strict format (no extra text, no titles):

Just return captions in this format:
1. <caption>
2. <caption>
3. <caption>

Now generate based on: "${captionText}"
`,
          },
        ],
      },
    ],
  }
);


const rawText =
  response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

const captions = rawText
  .split('\n')
  .map((line) => line.trim())               // clean spaces
  .filter((line) => /^\d+\.\s+/.test(line)) // keep only lines that start with 1. 2. 3.


  res.json({
    original: captionText,
    aiCaptions: captions,
  });
});

export const getImageUrl = asyncHandler(async ( req, res) => {
  const localImages = req.files?.image?.map(image => image.path)

  if (!localImages) {
    return res.status(400).json({ message: 'No image file uploaded.' });
  }

  const result = await uploadOnCloudinary(localImages)
  console.log(result)

  if(!result) {
    return res.status(501).json("Some Error Occured while uploading")
  }

  res.status(200).json({ imageUrl: result[0].secure_url });
});