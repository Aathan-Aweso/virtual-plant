# Gemini Image Generation Script

This folder contains a standalone script for generating plant state images with the Gemini API.

## What it does

- Uses a consistent structured prompt
- Generates images for every combination of:
  - stage
  - weather
  - health state
- Saves PNG files into `public/images/`

## Required environment variables

Set these in your root `.env` file:

```env
GEMINI_API_KEY=your_key_here
GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
PLANT_TYPE=houseplant
```

## Run it manually

```bash
npm run images:generate
```

The script is intentionally manual and does not run during page requests.
