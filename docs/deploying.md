# Deploying

One container service on [AWS Lightsail](https://aws.amazon.com/lightsail/containers/) runs the API, which also serves the built web app, so both share one address. The database is [Neon](https://neon.com) Postgres. The image is [`apps/backend/Dockerfile`](../apps/backend/Dockerfile).

Live: https://kanban.x10w1hqvjn1e6.eu-north-1.cs.amazonlightsail.com (sign in with **Try the demo**).

## Configuration

| Variable                                | Value                                                                         |
| --------------------------------------- | ----------------------------------------------------------------------------- |
| `DATABASE_URL`                          | Neon's **direct** connection string (host without `-pooler`)                  |
| `BETTER_AUTH_SECRET`                    | A random string of 32 characters or more                                      |
| `BETTER_AUTH_URL`, `TRUSTED_ORIGINS`    | The service's public address, without a trailing slash                        |
| `NODE_ENV`, `TRUST_PROXY`               | `production`, `1`                                                             |
| `LLM_API_KEY`                           | Optional. Without it the AI actions answer "AI is not configured"             |
| `VITE_DEMO_EMAIL`, `VITE_DEMO_PASSWORD` | Build arguments, not run-time variables: they add **Try the demo** to sign-in |

The container applies pending migrations when it starts, which is why the direct connection is required. Run-time variables are listed in the service's deployment; the demo arguments are baked into the web build.

## First time

Needs the AWS CLI (logged in, in the region the account allows), the Lightsail plugin `lightsailctl` for pushing images, Docker, and the Neon CLI (`pnpm dlx neonctl`).

1. **Database.** `neonctl projects create --name kanban --region-id aws-eu-central-1`, then `neonctl connection-string --project-id <id>` (the direct string; drop `channel_binding=require`). Apply the demo data with `DATABASE_URL=<string> pnpm auth:seed`.
2. **Service.** `aws lightsail create-container-service --service-name kanban --power nano --scale 1`. Its `url` is the public address.
3. **Image and deploy,** as under _Each release_ below, with `BETTER_AUTH_URL` and `TRUSTED_ORIGINS` set to the address from step 2.
4. **Check.** `/health/ready` answers `ok` once the database is reachable. Sign in with **Try the demo**, open the board, move a task.

## Each release

```sh
docker build -f apps/backend/Dockerfile -t kanban:latest \
  --build-arg VITE_DEMO_EMAIL=alex@example.com --build-arg VITE_DEMO_PASSWORD=password1234 .
aws lightsail push-container-image --service-name kanban --label app --image kanban:latest
# the push prints the image reference, for example ":kanban.app.2"
aws lightsail create-container-service-deployment --service-name kanban \
  --containers file://containers.json --public-endpoint file://endpoint.json
```

`containers.json` names the image, its environment and port; `endpoint.json` names the container, port `3001` and the health check `/health/live`:

```json
{
  "app": {
    "image": ":kanban.app.2",
    "environment": {
      "NODE_ENV": "production",
      "TRUST_PROXY": "1",
      "DATABASE_URL": "…",
      "BETTER_AUTH_SECRET": "…",
      "BETTER_AUTH_URL": "…",
      "TRUSTED_ORIGINS": "…"
    },
    "ports": { "3001": "HTTP" }
  }
}
```

```json
{
  "containerName": "app",
  "containerPort": 3001,
  "healthCheck": { "path": "/health/live" }
}
```

Keep both files out of the repository: they hold secrets. A migration follows expand, then contract: the release that adds a column ships before the one that drops what it replaced.

## Rolling back

Deploy the previous image reference again (`aws lightsail get-container-service-deployments --service-name kanban` lists them). A migration that has run is not undone.

## Cost and limits

A Nano service costs about $7 a month, charged to the AWS account (promotional credits apply). Neon's free plan has no card and no expiry, and its compute pauses when idle. To stop paying, delete the service with `aws lightsail delete-container-service --service-name kanban`.

## Running the production image locally

```sh
pnpm db:up && pnpm db:deploy
docker build -f apps/backend/Dockerfile -t kanban .
docker run --rm -p 3001:3001 \
  -e DATABASE_URL=postgresql://postgres:postgres@host.docker.internal:5432/kanban \
  -e BETTER_AUTH_SECRET=$(openssl rand -base64 32) \
  -e BETTER_AUTH_URL=http://localhost:3001 \
  -e TRUSTED_ORIGINS=http://localhost:3001 \
  kanban
```

The web app and the API answer on http://localhost:3001.
