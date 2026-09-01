# API Reference

These are internal application routes, not a versioned public API. They may change between releases.

## Generation

### `POST /api/generate`

Starts one to four image generations.

```json
{
  "prompt": "A cinematic coastal city at sunrise",
  "model": "nano-banana-2",
  "aspectRatio": "16:9",
  "count": 1,
  "imageSize": "1K",
  "thinkingLevel": "minimal",
  "referenceImages": []
}
```

Returns a `results` array. Each result contains `imageData` or `error`.

### `POST /api/generate/video`

Starts Omni or Veo video generation.

```json
{
  "prompt": "Slow aerial movement through morning fog",
  "model": "veo-3.1-lite",
  "aspectRatio": "16:9",
  "durationSeconds": 8,
  "resolution": "720p",
  "referenceImages": []
}
```

Returns `interactionId` for Omni or `operationName` for Veo.

### `GET /api/generate/video`

Poll with either `?interaction=...` or `?operation=...`. Returns `{ "done": false }` while processing or `{ "done": true, "videoUrl": "..." }` on completion.

### `GET /api/generate/video/file`

Retrieves completed video data for a validated Omni interaction or Veo operation. The route is intended for URLs returned by the polling endpoint and does not accept arbitrary upstream URLs.

## Projects

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/projects` | List projects |
| `POST` | `/api/projects` | Create a project |
| `PATCH` | `/api/projects/:id` | Rename a project, update thumbnail, or update grid size |
| `DELETE` | `/api/projects/:id` | Delete a project and its media |
| `GET` | `/api/projects/:id/media` | List media belonging to a project |

## Media

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/media` | Persist a media item |
| `PATCH` | `/api/media/:id` | Update a media item |
| `DELETE` | `/api/media/:id` | Delete a media item |

## Security notes

- Routes are same-origin application endpoints and currently do not authenticate users.
- Do not treat client-provided IDs, model names, URLs, or operation names as trusted without server validation.
- Apply authentication, authorization, rate limiting, body-size limits, and abuse controls before a public multi-user deployment.
