<div align="center">
  <img src="public/favicon.png" alt="Flow logo" width="112" />

  # Flow

  **An open-source creative workspace for AI image and video generation with Google Cloud Vertex AI.**

  Turn prompts and reference images into visual stories with Nano Banana, Omni, and Veo — from one focused, cinematic interface.

  [![Demo](https://img.shields.io/badge/demo-flow.techbe.me-111111?style=for-the-badge)](https://flow.techbe.me)
  [![GitHub stars](https://img.shields.io/github/stars/TechBeme/flow?style=for-the-badge&logo=github&color=F4C430)](https://github.com/TechBeme/flow/stargazers)
  [![MIT License](https://img.shields.io/badge/license-MIT-2ea44f?style=for-the-badge)](LICENSE)

  [English](README.md) · [Português (Brasil)](README.pt-BR.md) · [Documentation](docs/GETTING-STARTED.md) · [Report a bug](https://github.com/TechBeme/flow/issues/new?template=bug_report.yml) · [Request a feature](https://github.com/TechBeme/flow/issues/new?template=feature_request.yml)
</div>

> [!IMPORTANT]
> The public demo URL is reserved at [flow.techbe.me](https://flow.techbe.me). Until its deployment is announced, run Flow locally using the guide below.

![Flow generation workspace showing model, aspect ratio, duration, resolution, and prompt controls](docs/images/generation-controls.png)

## Why Flow?

Most generative media tools separate image creation, video generation, references, files, and project history across different screens. Flow brings that creative loop into one visual workspace:

- **Create images and videos in the same project** without switching products.
- **Choose the exact Vertex AI model** instead of hiding it behind a generic quality selector.
- **Control the output** with model-specific aspect ratios, image sizes, durations, resolutions, and thinking levels.
- **Use references naturally** by uploading, pasting, or dragging an image into the composer.
- **Keep the creative context** with project galleries, reusable prompts, downloads, and generated-media history.
- **Own the stack** with an MIT-licensed Next.js application connected directly to your Google Cloud project.

## Screenshots

| Project dashboard | Creative workspace |
| --- | --- |
| ![Flow project dashboard](docs/images/dashboard.png) | ![Flow image and video workspace](docs/images/workspace.png) |

| Generation controls | Mobile workspace |
| --- | --- |
| ![Flow model and output controls](docs/images/generation-controls.png) | <img src="docs/images/mobile-workspace.png" alt="Flow mobile workspace" width="360" /> |

## Supported models

Flow currently exposes these model choices in the UI. Availability, quota, supported regions, and preview access are controlled by Google Cloud and may differ between projects.

### Image generation

| Display name | Vertex AI model ID | Output controls |
| --- | --- | --- |
| Nano Banana Pro | `gemini-3-pro-image` | 1K, 2K, 4K; model-supported aspect ratios |
| Nano Banana 2 | `gemini-3.1-flash-image` | 512, 1K, 2K, 4K; thinking level; extended aspect ratios |
| Nano Banana 2 Lite | `gemini-3.1-flash-lite-image` | 1K; model-supported aspect ratios |

### Video generation

| Display name | Vertex AI model ID | Duration | Resolution |
| --- | --- | --- | --- |
| Omni 1.1 Flash | `gemini-omni-1.1-flash-preview` | 3–10 seconds | 360p, 720p, 1080p, 4K |
| Veo 3.1 - Lite | `veo-3.1-lite-generate-001` | 4, 6, or 8 seconds | 720p, 1080p |
| Veo 3.1 - Fast | `veo-3.1-fast-generate-001` | 4, 6, or 8 seconds | 720p, 1080p |
| Veo 3.1 - Quality | `veo-3.1-generate-001` | 4, 6, or 8 seconds | 720p, 1080p, 4K |

For Veo, outputs above 720p use an 8-second duration because that is the constraint implemented by the current Vertex AI integration. Flow supports `16:9` and `9:16` video output, plus text-to-video and image-to-video workflows.

## Features

- Prompt-to-image and prompt-to-video generation
- Image-to-image and image-to-video reference workflows
- Up to four image outputs per request
- Drag, paste, upload, and gallery-to-prompt reference images
- Per-model sizes, aspect ratios, durations, and resolutions
- Asynchronous Omni and Veo operation polling
- Project creation, rename, deletion, and visual thumbnails
- Persistent PostgreSQL media and project library
- Responsive desktop and mobile interface
- Media preview, zoom, download, delete, and prompt reuse
- Portuguese product interface with English-first project documentation
- Direct Vertex AI authentication — no Google AI Studio API key required

## Tech stack

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React_19-20232a?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vertex AI](https://img.shields.io/badge/Google_Cloud-Vertex_AI-4285F4?logo=googlecloud&logoColor=white)](https://cloud.google.com/vertex-ai)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white)](https://neon.tech/)

- Next.js App Router and server route handlers
- React 19, TypeScript, Tailwind CSS 4, Motion, Radix UI, and Zustand
- Neon serverless PostgreSQL
- Google Cloud OAuth service-account authentication
- Vertex AI Gemini image generation, Interactions API, and Veo long-running operations

## Architecture

```mermaid
flowchart LR
    U[Browser] -->|Projects and generation controls| N[Next.js application]
    N -->|CRUD| P[(PostgreSQL / Neon)]
    N -->|Signed OAuth request| A[Google Cloud OAuth]
    A --> V[Vertex AI]
    V --> I[Gemini image models]
    V --> O[Omni Interactions API]
    V --> E[Veo long-running API]
    I --> N
    O --> N
    E --> N
```

The browser never receives Google Cloud credentials. All Vertex AI authentication and model calls happen in server-only route handlers. See [Architecture](docs/ARCHITECTURE.md) for the request flows and module map.

## Quick start

### Prerequisites

- Node.js 20.9 or newer
- A PostgreSQL database (Neon works out of the box)
- A Google Cloud project with billing enabled
- Vertex AI API enabled
- A service account allowed to use Vertex AI
- Access and quota for the models you want to run

### 1. Clone and install

```bash
git clone https://github.com/TechBeme/flow.git
cd flow
npm install
```

### 2. Configure the environment

```bash
cp .env.example .env.local
```

For local development, keep the downloaded service-account file outside Git history and point to it:

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
GOOGLE_APPLICATION_CREDENTIALS=./vertex.json
GOOGLE_CLOUD_PROJECT=your-google-cloud-project
GOOGLE_CLOUD_LOCATION=global
GOOGLE_CLOUD_VIDEO_LOCATION=us-central1
```

`vertex.json`, `.env.local`, and common credential-file patterns are ignored by Git. Never commit a real private key.

### 3. Start Flow

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), create a project, and start generating. The database schema is created automatically on the first project/media request.

The complete setup — including Google Cloud IAM — is in [Getting Started](docs/GETTING-STARTED.md).

## Deploy on Vercel

1. Import the GitHub repository into Vercel.
2. Add `DATABASE_URL`.
3. Add the complete service-account JSON as `GOOGLE_SERVICE_ACCOUNT_JSON`.
4. Add the optional location overrides when your project requires them.
5. Deploy and attach your custom domain.

Flow also accepts `GOOGLE_SERVICE_ACCOUNT_JSON_BASE64`, which can be useful when a platform makes multiline secret values difficult to manage. File-based `GOOGLE_APPLICATION_CREDENTIALS` is intended primarily for local or container deployments.

> [!WARNING]
> Flow currently has no built-in user authentication, rate limiting, or per-user quota. Do not expose a deployment backed by a billable Google Cloud project without adding access control and abuse protection appropriate for your use case.

See [Deployment](docs/DEPLOYMENT.md) and [Configuration](docs/CONFIGURATION.md) for production details.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Run TypeScript checks without emitting files |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |

## Documentation

- [Getting Started](docs/GETTING-STARTED.md) — local setup and Google Cloud preparation
- [Configuration](docs/CONFIGURATION.md) — every environment variable and credential method
- [Architecture](docs/ARCHITECTURE.md) — components, data flow, and model integrations
- [API Reference](docs/API.md) — internal HTTP routes and payloads
- [Development](docs/DEVELOPMENT.md) — repository structure and contribution workflow
- [Testing](docs/TESTING.md) — current checks and manual verification
- [Deployment](docs/DEPLOYMENT.md) — Vercel and production considerations
- [Security Policy](SECURITY.md) — responsible vulnerability reporting

## Roadmap

- [ ] Authentication and private multi-user workspaces
- [ ] Rate limiting, quotas, and cost controls
- [ ] Cloud object storage for generated media
- [ ] Background job queue with durable generation state
- [ ] More Vertex AI models as they become generally available
- [ ] Timeline and scene-building tools
- [ ] Prompt presets and reusable style libraries
- [ ] Internationalized interface
- [ ] Automated unit, integration, and browser test suites

Have an idea? [Open a feature request](https://github.com/TechBeme/flow/issues/new?template=feature_request.yml) or start a discussion after the repository launches.

## Contributing

Contributions are welcome — from bug fixes and provider improvements to accessibility, documentation, model support, and creative tooling.

1. Read [CONTRIBUTING.md](CONTRIBUTING.md).
2. Fork the repository and create a focused branch.
3. Run lint, type checks, and the production build.
4. Open a pull request using the provided template.

If Flow is useful to you, the simplest way to support it is to **star the repository**, share it with another creator, and tell us what you build.

## Security

Do not report vulnerabilities in public issues. Follow [SECURITY.md](SECURITY.md) and avoid including credentials, project IDs, generated private media, or personal data in reports.

## Disclaimer

Flow is an independent open-source project. It is not affiliated with, endorsed by, or sponsored by Google. Google Cloud, Vertex AI, Gemini, Nano Banana, Omni, and Veo are trademarks or product names of their respective owners. Model names, APIs, availability, pricing, quota, and capabilities may change upstream.

You are responsible for your cloud costs, generated content, deployment security, and compliance with Google Cloud terms and applicable law.

## License

Released under the [MIT License](LICENSE).

<div align="center">
  Built by <a href="https://github.com/TechBeme">TechBeme</a> for people who want a faster path from an idea to a visual story.
</div>
