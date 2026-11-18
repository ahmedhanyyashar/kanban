# Deploying

The web app runs on Cloudflare Pages, the API on Render, and the database on Neon. The [Deploy workflow](../.github/workflows/deploy.yml) puts a commit live when CI has passed on `main`, and does nothing until the repository variable `DEPLOY_ENABLED` is `true`.

## First time

1. **Database.** Create a Neon project and copy its connection string. Use the direct string (not the pooled one, whose host ends in `-pooler`): the container applies the migrations when it starts, and migrations need a session connection. Keep `?sslmode=require` on it.
2. **API.** Create a Render web service from [`render.yaml`](../render.yaml) and fill the variables it leaves empty: `DATABASE_URL`, `BETTER_AUTH_URL` (the API's public address), `TRUSTED_ORIGINS` (the web app's address) and `COOKIE_DOMAIN`. Optional: `LLM_API_KEY` turns the AI features on, `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` turn Google sign-in on. Copy the service's deploy hook.
3. **Web app.** Create a Cloudflare Pages project (direct upload) and an API token that may edit it.
4. **Repository.** In an environment named `production`, set the secrets `RENDER_DEPLOY_HOOK`, `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, and the variables `API_URL`, `CLOUDFLARE_PROJECT` and finally `DEPLOY_ENABLED=true`.

## The two addresses must share a domain

The session cookie is set by the API and read by the browser on requests from the web app. On two unrelated hosts (`*.pages.dev` and `*.onrender.com`) browsers treat that as a third-party cookie and may refuse it. Give both a custom domain under one registrable domain (`app.example.com` and `api.example.com`) and set `COOKIE_DOMAIN=.example.com`; the API then shares the cookie with the web app. `TRUSTED_ORIGINS` is the web app's own address, and the web app's security policy lets it talk to `API_URL` and no other origin.

## Each release

The workflow deploys the API first (Render builds the image, and the container applies the new migrations before it serves), builds the web app against `API_URL`, uploads it, and then asks the live API for `/health/ready`. Render's own health check uses `/health/live`, so a database outage does not restart the service.

A migration follows expand, then contract: a release that adds a column ships before the one that drops what it replaced, so the previous version keeps working while the new one starts.

## Rolling back

Revert the commit on `main`: CI runs, and the workflow deploys the reverted state. For an emergency, roll back to the previous deploy in Render's dashboard, and to the previous deployment in Cloudflare Pages (it keeps each one). A migration that already ran is not undone: that is why migrations are written to be compatible with the version before.

## After a release

Open the web app, sign in, and open a board. The first request after a quiet period is slow, because Render's free plan stops an idle service.
