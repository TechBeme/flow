# Development

## Repository structure

```text
src/app/                  Next.js pages, metadata, and API routes
src/components/           Product and reusable UI components
src/lib/                  Types, state, database, and server integrations
public/                   Icons and social preview assets
docs/                     Guides and screenshots
.github/                  CI and contribution templates
```

## Local workflow

```bash
npm install
cp .env.example .env.local
npm run dev
```

Keep changes focused. Preserve the official display name separately from the upstream model ID, and update both the UI mapping and server validation when introducing a model.

## Code conventions

- TypeScript is strict.
- Components are functional React components.
- Vertex AI credentials and model calls stay server-side.
- Validate all client-provided model IDs and upstream path identifiers.
- Avoid storing secrets or access tokens in logs.
- Keep Portuguese product copy in `src/lib/i18n.ts` where practical.
- Reuse existing UI primitives and the established dark visual language.

## Adding an image model

1. Add its display option and supported controls in `generation-panel.tsx`.
2. Add the validated UI-to-Vertex mapping in `api/generate/route.ts`.
3. Confirm image sizes, aspect ratios, and optional thinking controls against current upstream documentation.
4. Run a real generation in an entitled Google Cloud project.
5. Update both READMEs and the model table.

## Adding a video model

1. Add its display option and supported controls.
2. Add its server-side model mapping and operation validation.
3. Implement or reuse the correct Vertex endpoint family.
4. Validate text-to-video, image-to-video, polling, and file retrieval.
5. Document region, duration, resolution, access, and quota constraints.

## Before opening a pull request

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Also exercise the changed workflow manually. Static checks cannot validate upstream model entitlement or quota.
