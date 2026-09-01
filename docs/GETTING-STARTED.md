# Getting Started

This guide takes a fresh Flow installation from clone to its first Vertex AI request.

## Requirements

- Node.js 20.9+
- npm 10+
- PostgreSQL database
- Google Cloud project with billing enabled
- Vertex AI API enabled
- Service account with permission to call the required Vertex AI models

Model access is not universal. Preview models, regions, allowlists, and quota can differ by Google Cloud project.

## Install

```bash
git clone https://github.com/TechBeme/flow.git
cd flow
npm install
cp .env.example .env.local
```

## Create the database

Create an empty PostgreSQL database and copy its connection string to `DATABASE_URL`. Flow creates the `projects` and `media_items` tables automatically when the application first accesses them.

Neon is the reference serverless provider, but any compatible PostgreSQL connection should work.

## Prepare Google Cloud

1. Create or select a Google Cloud project.
2. Enable billing.
3. Enable the Vertex AI API.
4. Create a service account dedicated to Flow.
5. Grant only the permissions required to invoke Vertex AI models. The standard Vertex AI User role is a practical starting point; tighten it for your production environment.
6. Create a JSON key only if your environment requires a service-account key.
7. Confirm quota and access for each model you intend to use.

For local development, save the key as `vertex.json` in the repository root. That path is ignored by Git.

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
GOOGLE_APPLICATION_CREDENTIALS=./vertex.json
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=global
GOOGLE_CLOUD_VIDEO_LOCATION=us-central1
```

For hosted environments, use `GOOGLE_SERVICE_ACCOUNT_JSON` instead of committing or bundling the file. See [Configuration](CONFIGURATION.md).

## Run

```bash
npm run dev
```

Open `http://localhost:3000`, create a project, and submit a small image generation first. Image generation is usually the fastest way to validate credentials, IAM, model access, and response handling.

## Validate the installation

```bash
npm run lint
npx tsc --noEmit
npm run build
```

A successful build proves the application compiles. It does not prove your Google Cloud project has model quota. Run a real generation to validate the upstream integration.

## Common first-run errors

| Symptom | Likely cause |
| --- | --- |
| Vertex AI is not configured | No supported credential environment variable is set |
| OAuth authentication failed | Invalid/revoked service-account key or malformed JSON |
| `403` | Missing IAM permission, API disabled, model unavailable, or wrong project |
| `404` | Model is unavailable in the selected location or model ID changed upstream |
| `429` | Project quota or capacity limit |
| Database connection error | Invalid `DATABASE_URL`, network policy, or SSL configuration |

Never paste private keys into an issue, screenshot, log, or pull request.
