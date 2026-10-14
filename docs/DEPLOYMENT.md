# Deploy to Cloudflare Pages

This is a static site. No Pages Functions, Worker, database, API key or backend binding is required by the application. A hosting account is required to publish it. The prepared local output and Git push are not proof of a deployment.

## Git integration

1. In your Cloudflare account, create or select a Pages project and connect `Rifkhan-Mohamed/1-victoria-foreign-employment` through the GitHub integration. Grant that repository access only as needed.
2. Use these build settings:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Framework preset | None |
| Root directory | Repository root (leave blank) |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | 24 |
| Public build variable | `SITE_ORIGIN=https://` followed by the actual Pages/custom domain |

3. If the Pages hostname is not known until the first deployment, deploy without `SITE_ORIGIN`, then set the actual origin and rebuild. No fake canonical domain is embedded by default.
4. After deployment, check all six pages, extensionless routes, images/fonts, mobile navigation, both themes and the enquiry review/handoff flow. Confirm a missing route returns HTTP 404. Inspect response headers to verify `_headers` was applied; confirm `robots.txt`, canonical URLs and sitemap match the final domain.
5. Run both forced experiment variants as QA only. Public visits without the experiment flag stay on the untracked control. Do not send test enquiries to the business unless authorised separately.
6. Add a custom domain through Cloudflare only when you control it and are ready to change DNS. Update `SITE_ORIGIN` and rebuild after the domain is active.

Cloudflare Pages supports `.html` files and clean extensionless URLs. Navigation retains portable `.html` links; Pages redirects them to clean URLs, matching canonical metadata. A generated top-level `404.html` avoids treating unknown routes as an SPA. The project does not need a catch-all redirect.

`src/_headers` configures CSP (self-hosted scripts/fonts; no analytics connections), no-referrer, frame protection, nosniff and permissions restrictions. Inline CSS is allowed because the existing design includes style attributes and no-JavaScript fallbacks. Inline JavaScript has been moved into local files.

## Manual upload alternative

Run a final build using the real origin, then upload **only the contents of `dist/`** through the Cloudflare dashboard. Do not upload `.env`, tests, source, `node_modules`, the original ZIP or the whole repository. Direct Upload and Git integration have different project workflows; choose Git integration for ongoing maintenance.

## Current publication blockers

No Cloudflare account/project credential is configured in this cloud task, and no production origin was supplied. GitHub API access also returned a proxy HTTP 403, so it cannot be used here to inspect or configure GitHub Pages. Native Git transport is a separate capability.

No account, project, paid service or DNS change has been created. To complete publication, connect the repository to an existing Cloudflare account as above, then provide the resulting public URL for live verification. If you want automated deployment from Codex instead, configure the hosting connection securely in environment settings; do not paste credentials into chat. Hosting/API domains may need to be added to the network policy through environment settings before that route can be used.
