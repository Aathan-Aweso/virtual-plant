/* eslint-disable no-console */
const fs = require("node:fs");
const path = require("node:path");
const { GoogleGenAI } = require("@google/genai");

const rootEnvPath = path.join(process.cwd(), ".env");
if (fs.existsSync(rootEnvPath)) {
  const envContents = fs.readFileSync(rootEnvPath, "utf8");
  for (const line of envContents.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue;
    const [key, ...rest] = line.split("=");
    if (!key || process.env[key]) continue;
    process.env[key] = rest.join("=").replace(/^"|"$/g, "");
  }
}

const stages = ["seed", "sprout", "seedling", "young-plant", "mature-plant"];
const weatherStates = ["sunny", "rainy", "cloudy"];
const healthStates = {
  healthy: "lush foliage, upright stem, hydrated and thriving",
  stressed: "slight droop, some yellowing, visibly stressed but still alive",
  wilted: "wilted leaves, dry texture, struggling condition but still the same plant",
};

const outputDir = path.join(process.cwd(), "public", "images");
const model = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";
const plantType = process.env.PLANT_TYPE || "houseplant";
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("Missing GEMINI_API_KEY in .env");
  process.exit(1);
}

fs.mkdirSync(outputDir, { recursive: true });

const ai = new GoogleGenAI({ apiKey });

function createPrompt(stage, weather, healthDescription) {
  return [
    `A highly realistic ${plantType}, same individual plant across all stages, consistent structure and leaf shape.`,
    "",
    `Stage: ${stage}`,
    `Weather: ${weather}`,
    `Health: ${healthDescription}`,
    "",
    "Centered composition, neutral background, natural lighting, photorealistic, no illustration, no cartoon.",
  ].join("\n");
}

async function generateImage(stage, weather, healthKey, healthDescription) {
  const prompt = createPrompt(stage, weather, healthDescription);
  const fileName = `${stage}_${weather}_${healthKey}.png`;
  const outputPath = path.join(outputDir, fileName);

  console.log(`Generating ${fileName}...`);

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  const parts = response.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((part) => part.inlineData && part.inlineData.data);

  if (!imagePart) {
    throw new Error(`No image returned for ${fileName}`);
  }

  const buffer = Buffer.from(imagePart.inlineData.data, "base64");
  fs.writeFileSync(outputPath, buffer);
  console.log(`Saved ${outputPath}`);
}

async function main() {
  for (const stage of stages) {
    for (const weather of weatherStates) {
      for (const [healthKey, healthDescription] of Object.entries(healthStates)) {
        await generateImage(stage, weather, healthKey, healthDescription);
      }
    }
  }

  console.log("All image generation jobs completed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
