# i job i job

i job i job is a Netlify-ready career application workspace for CV audits, pitch generation, interview coaching, and job pipeline tracking.

## Local Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file and set the required Gemini API key:

   ```bash
   cp .env.example .env.local
   ```

3. Run the app:

   ```bash
   npm run dev
   ```

## Netlify Deployment

The production site publishes the Vite build output from `dist` and serves AI endpoints from `netlify/functions`. Configure `GEMINI_API_KEY` in Netlify environment variables before deploying.
