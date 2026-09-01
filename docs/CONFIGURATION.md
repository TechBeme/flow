# Configuration

Flow uses server-only environment variables. Variables without the `NEXT_PUBLIC_` prefix are not intentionally exposed to the browser.

## Environment variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | One credential method | — | Complete service-account JSON; recommended for Vercel |
| `GOOGLE_SERVICE_ACCOUNT_JSON_BASE64` | One credential method | — | Base64-encoded service-account JSON |
| `GOOGLE_APPLICATION_CREDENTIALS` | One credential method | — | Absolute or repository-relative path to a service-account JSON file |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | No | — | Backward-compatible alias for the credential file path |
| `GOOGLE_CLOUD_PROJECT` | No | `project_id` from credentials | Google Cloud project ID override |
| `GOOGLE_CLOUD_LOCATION` | No | `global` | Vertex location used for Gemini image and Omni requests |
| `GOOGLE_CLOUD_VIDEO_LOCATION` | No | `us-central1` | Vertex location used for Veo requests |

Credential precedence is: inline JSON, base64 JSON, then file path.

## Local configuration

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
GOOGLE_APPLICATION_CREDENTIALS=./vertex.json
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=global
GOOGLE_CLOUD_VIDEO_LOCATION=us-central1
```

Both `.env.local` and `vertex.json` are ignored. Confirm with `git check-ignore -v .env.local vertex.json` before your first commit.

## Vercel configuration

Set the complete JSON document as one secret named `GOOGLE_SERVICE_ACCOUNT_JSON`. Newline characters inside `private_key` must remain represented correctly by the JSON value. Vercel stores the value outside the repository.

If direct JSON entry is inconvenient, encode the file locally and store it as `GOOGLE_SERVICE_ACCOUNT_JSON_BASE64`:

```bash
base64 -w 0 vertex.json
```

On macOS, use `base64 < vertex.json | tr -d '\n'`.

Do not expose either credential variable with a `NEXT_PUBLIC_` prefix.

## Database behavior

Flow creates and incrementally updates its small schema at runtime through `ensureSchema()`. This is convenient for the current project stage. A larger multi-instance production deployment should replace runtime DDL with versioned migrations.

Generated images may currently be stored as data URLs. For a public or high-volume deployment, move media binaries to object storage and retain only URLs and metadata in PostgreSQL.
