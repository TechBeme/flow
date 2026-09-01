# Security Policy

## Reporting a vulnerability

Please do not open a public issue for a suspected vulnerability.

Use GitHub's private vulnerability reporting feature for `TechBeme/flow` when it is available. If private reporting is not enabled yet, contact the repository owner through the private contact method listed on the [TechBeme GitHub profile](https://github.com/TechBeme) and include only the minimum information required to establish contact.

Do not send:

- Google Cloud service-account keys or OAuth tokens
- Database credentials
- Private project IDs or billing details
- Generated media containing personal or confidential content
- Destructive proof-of-concept payloads against public infrastructure

Include the affected version/commit, impact, reproduction conditions, and a safe proof of concept. We will acknowledge a valid report as soon as practical and coordinate disclosure after a fix is available.

## Supported versions

The latest commit on the default branch receives security fixes. No older release line is currently maintained.

## Deployment responsibility

Flow is a self-hosted application and currently does not include built-in user authentication, authorization, rate limiting, or per-user cost controls. A public deployment can expose billable Vertex AI operations. Operators must add controls appropriate to their environment.

Keep all credentials server-side, use least-privilege IAM, rotate exposed keys immediately, set cloud budget alerts, and review logs before sharing them.
