# Testing

Flow currently uses static quality gates and manual end-to-end verification. There is no automated unit or browser test suite.

## Automated checks

```bash
npm run lint
npx tsc --noEmit
npm run build
```

GitHub Actions runs these checks for pushes and pull requests.

The production build does not require live database or Vertex AI credentials. Those integrations are initialized only when their server routes are called.

## Manual smoke test

1. Start the app and load the project dashboard.
2. Create, rename, open, and delete a disposable project.
3. Upload an image and verify it persists after refresh.
4. Generate one image with a model available to your project.
5. Generate one video, wait for polling to finish, play it, and download it.
6. Reuse a prompt and verify the reference image is restored.
7. Check the project on its desktop target viewport.
8. Confirm failed upstream requests show a useful message and do not remain stuck in a generating state.

## Integration truth

- A successful production build proves compilation, not Vertex AI access.
- A successful OAuth exchange proves credentials, not model generation.
- A `429` proves the request reached the upstream service but quota/capacity blocked completion.
- Each model family should be tested independently because access and endpoint behavior can differ.

Use a non-production Google Cloud project for development whenever possible. Generated media requests may incur cost.
