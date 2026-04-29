# Virtual Plant

A production-minded MVP built with Next.js, a file-backed local database, cookie-based auth, and a standalone Gemini image generation script.

## Stack

- Next.js App Router for the frontend
- `pages/api` endpoints for auth and plant actions
- File-backed local database with `users` and `plants` collections
- Cookie-based JWT session auth
- Standalone Gemini image generation script saving to `public/images`

## Folder structure

```text
app/
pages/api/
lib/
scripts/image-generation/
public/images/
data/
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
Copy-Item .env.example .env
```

3. Set a strong `SESSION_SECRET` in `.env`.

4. Start the app:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## Data model

The app uses a simple persisted JSON database at `data/database.json` with two collections:

- `users`
- `plants`

Each new user gets exactly one plant.

## Gemini image generation

The image generator is intentionally separate from the web app and only runs when you call it manually.

1. Put your Gemini API key in `.env`:

```env
GEMINI_API_KEY=your_key_here
```

2. Run the generator:

```bash
npm run images:generate
```

This will generate plant images into `public/images/` using the naming format:

```text
{stage}_{weather}_{health}.png
```

## Improvements to consider after MVP

- Move the file store to PostgreSQL for multi-instance deployments
- Add CSRF protection and rate limiting
- Add email verification and password reset
- Add websocket or polling refinement for smoother live updates
- Add image generation job management and asset validation