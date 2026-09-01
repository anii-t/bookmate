# BookMate Web

Standalone web app for BookMate, sharing the `capstone-da06d` Firebase project
with the BookMate mobile app.

## Development

    npm install
    cp .env.example .env.local   # fill in your Firebase web app config
    npm run dev

## Testing

    npm test

## Environment variables

See `.env.example` for the required Firebase config. These are public client
identifiers (not secrets — access is controlled by Firestore security rules),
but are kept in env vars rather than hardcoded so different environments
(local, preview, production) can point at different Firebase projects if
needed later. On Vercel, set them under Project Settings → Environment
Variables (or `vercel env add`), for Production/Preview/Development.

## Deployment

Deployed on Vercel. Push to the connected Git remote's default branch to trigger
a production deploy; other branches get preview deployments.
