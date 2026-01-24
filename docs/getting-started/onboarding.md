# Developer Onboarding: Environment Setup

This onboarding guide explains how to configure environment variables for AIOS.
Use it alongside the main Getting Started tutorial in `docs/diataxis/tutorials/getting-started.md`.

## 1) Copy the example environment file

```bash
cp .env.example .env
```

- `.env.example` contains **placeholders only**—never real secrets.
- Update values in `.env` to match your local or hosted environment.

## 2) Required variables (local development)

These are required for running the API server and Expo client locally:

- `NODE_ENV` — runtime mode (`development` recommended locally)
- `PORT` — API server port (default `5000`)
- `JWT_SECRET` — token signing secret (use a strong value in production)
- `EXPO_PUBLIC_DOMAIN` — public domain used by the client (e.g., `localhost:5000`)
- `DATABASE_URL` — Postgres connection string for migrations and server runtime

## 3) Optional variables

Use these when running in Replit or enabling optional integrations:

- `REPLIT_DEV_DOMAIN`, `REPLIT_DOMAINS`, `REPLIT_INTERNAL_APP_DOMAIN`
- `EXPO_PUBLIC_API_URL` (explicit API base URL)
- `EXPO_PUBLIC_ANALYTICS_ENABLED` (enable/disable analytics)
- `LOG_LEVEL` (server logging verbosity)
- `POSTGRES_*` (component values for infra templates)
- `AWS_*` (optional integrations)
- `STRIPE_*` (optional payments)
- `DJANGO_SECRET_KEY` (legacy Django backend only)

## 4) Validate your configuration

Once variables are set, follow the startup steps in the Getting Started tutorial:

```bash
npm run expo:dev
npm run server:dev
```

If the server fails to start, confirm `DATABASE_URL` and `JWT_SECRET` are set.
