# SkillSwap — Vercel deployment

## What was fixed

- Added `backend/app.js`, a serverless-safe Express app export. The previous `api/index.js` imported this file even though it was missing, which caused Vercel's `FUNCTION_INVOCATION_FAILED` error.
- Added `api/[...path].js` so `/api/*` requests reach the Express app.
- Changed MongoDB connection handling so a failed connection throws instead of calling `process.exit()` inside a serverless function.
- Added backend runtime dependencies to the root `package.json`, because Vercel installs dependencies from the project root.
- Changed the frontend API helper to use the same Vercel domain by default. `VITE_API_URL` is optional in production.
- Added SPA routing configuration for React Router.
- Removed environment files containing secrets from this deployment package and added `.env.example` files.

## Vercel settings

Use the repository root as the Root Directory.

Build Command:

    npm run build

Output Directory:

    dist

Install Command:

    npm install

## Required Vercel environment variables

Production:

    MONGO_URI=<your MongoDB Atlas URI>
    JWT_SECRET=<a long random secret>

Optional email variables:

    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=465
    SMTP_USER=<your email>
    SMTP_PASS=<your Google app password>
    EMAIL_FROM=SkillSwap <your email>

Do not commit `.env` files or real secrets to GitHub.

## Frontend API URL

No production `VITE_API_URL` is required when frontend and API are deployed in this same Vercel project. The frontend defaults to `/api` on the current domain.

For local development, create `.env` from `.env.example` and use:

    VITE_API_URL=http://localhost:5000

## Test after deployment

Open:

    https://YOUR-DOMAIN.vercel.app/

Then test:

    https://YOUR-DOMAIN.vercel.app/api/health

Expected API response:

    {"ok":true,"service":"skillswap-api","database":"mongodb"}

Then test Register and Login from the React application.
