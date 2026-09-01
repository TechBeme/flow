# Deployment

## Vercel

1. Push Flow to a GitHub repository.
2. Import the repository in Vercel as a Next.js project.
3. Add the required environment variables.
4. Deploy.
5. Add the custom domain and verify HTTPS.

Required secrets:

```text
DATABASE_URL
GOOGLE_SERVICE_ACCOUNT_JSON
```

Optional configuration:

```text
GOOGLE_CLOUD_PROJECT
GOOGLE_CLOUD_LOCATION=global
GOOGLE_CLOUD_VIDEO_LOCATION=us-central1
```

Never upload `vertex.json` to the repository or add its contents to `next.config.ts`.

## Production checklist

- [ ] Use a dedicated Google Cloud service account with least privilege.
- [ ] Restrict access to the deployment before connecting billable APIs.
- [ ] Add rate limiting and per-user quota/cost controls.
- [ ] Set Google Cloud budgets, alerts, and model quotas.
- [ ] Use a production PostgreSQL branch/database with backups.
- [ ] Move media binaries to object storage for scale.
- [ ] Verify serverless request/response and execution-duration limits against target video sizes.
- [ ] Remove secrets from logs and error tracking.
- [ ] Validate image generation and every enabled video model with the deployed environment.
- [ ] Verify mobile and desktop rendering.
- [ ] Confirm the custom domain, canonical URL, Open Graph image, robots file, and sitemap.

## Important limits

Video generation is asynchronous and can outlive a single browser interaction. The current client polls Next.js endpoints, but it does not persist a durable background job. Refreshing or closing the page during generation may interrupt the client-side workflow.

Large base64 images and videos can exceed hosting request or response limits. Production deployments should use object storage, signed URLs, and a durable queue.

## Container or VM deployment

File-based credentials remain supported:

```dotenv
GOOGLE_APPLICATION_CREDENTIALS=/run/secrets/vertex.json
```

Mount the secret at runtime instead of copying it into the image. Run `npm run build`, then `npm start`, and place a TLS reverse proxy in front of the application.

## Observability

At minimum, monitor:

- Vertex request latency and status codes
- OAuth failures
- `429` quota responses
- Long-running video completion/failure rate
- Database errors and storage growth
- API request volume and generated-media cost

Do not log prompts or generated media by default if deployments may contain sensitive creative work.
