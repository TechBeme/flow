# Contributing to Flow

Thank you for helping make generative media creation more open and approachable.

## Good contributions

- Reproducible bug fixes
- New Vertex AI model support backed by current documentation and a real test
- Accessibility, responsive design, and performance improvements
- Safer authentication, authorization, rate limiting, and storage
- Clear documentation and translations
- Focused automated tests

For a substantial feature or architecture change, open an issue first so maintainers and contributors can align before implementation begins.

## Development setup

1. Fork and clone the repository.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Use a development database and non-production Google Cloud project.
5. Start the app with `npm run dev`.

Never commit `.env.local`, service-account files, private keys, generated private media, or real customer data.

## Branches and commits

- Create one focused branch per change.
- Use a descriptive name such as `fix/video-polling` or `feat/model-selector`.
- Keep commits reviewable and avoid unrelated formatting rewrites.
- Explain behavior changes and tradeoffs in the pull request.

## Required checks

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Manually test the user-facing flow you changed. If the change touches a model integration, report which Google Cloud region and model were actually exercised without exposing project identifiers or credentials.

## Pull requests

- Complete the pull request template.
- Link related issues.
- Include before/after screenshots for visual changes.
- Document new environment variables and model limitations.
- Update both READMEs when user-facing model support changes.
- Keep secrets and sensitive generated content out of screenshots and logs.

By contributing, you agree that your contribution is licensed under the MIT License and that you will follow the [Code of Conduct](CODE_OF_CONDUCT.md).
