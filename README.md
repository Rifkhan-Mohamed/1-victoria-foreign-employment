# 1 Victoria Foreign Employment

A six-page, static website for employers in Sri Lanka, recovered from the supplied Victoria version 8 export. It uses plain HTML, CSS and JavaScript, with local images and licensed fonts. No framework, backend, database or runtime secret is required.

## Requirements and quick start

Use Node.js 24 LTS (Node 20+ is supported) and npm.

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run dev
```

The local server listens on port 8080. `npm run dev` builds once, then serves `dist`; after editing, run `npm run build` and refresh. `PORT=8081 npm run preview` selects another port. Use HTTP rather than opening files directly.

In Codex Cloud, use the existing checkout at `/workspace/1-victoria-foreign-employment`. The task is already isolated; no extra Git worktree is needed. If npm's default cache is not writable, add `--cache /workspace/.npm-cache` to installation commands.

## Project structure

- `src/`: six source pages, shared styles, theme/menu/enquiry scripts, local experiment and all original image/font assets. Edit these files.
- `scripts/`: build, syntax/reference checks and local HTTP server.
- `tests/`: existing script regressions, build tests and Chromium functional/accessibility tests.
- `dist/`: generated deployment output, excluded from Git.
- `docs/`: experiment design, deployment instructions, recovery provenance and validation record.
- `.github/workflows/ci.yml`: install, build and browser validation on pushes and pull requests.

Production has **zero third-party JavaScript dependencies**. Playwright and axe are pinned development dependencies only. Font licences and download provenance are under `src/assets/fonts/`.

## Configuration and production build

```sh
cp .env.example .env
# Set SITE_ORIGIN to the actual HTTPS origin, without a path, then:
npm run build
```

`SITE_ORIGIN` is optional public metadata, not a secret. A process environment setting takes precedence over `.env`. Use the real custom domain or Pages origin. With it, the build produces canonical/Open Graph URLs and `sitemap.xml`. Without it, those absolute URLs and the sitemap are omitted. Do not deploy placeholder domains. `.env` is ignored; commit only `.env.example`.

The build creates the six pages, a real 404 page, local assets, `robots.txt` and Cloudflare `_headers`. It rejects credentials, non-HTTPS URLs, paths, queries and fragments in the origin before replacing output. Deploy **only `dist/`**. The Node preview server is a development utility, not a production backend.

## Checks

```sh
npm run check           # JavaScript syntax; there is no TypeScript or separate linter
npm run test:build      # Metadata, invalid origins, repeatable builds
npm run build
npm test                # Local links/assets and script regressions
npm run test:browser    # Chromium: all pages, viewports/themes, accessibility and flows
npm run verify         # All of the above, in the required order
```

The browser runner uses `/usr/bin/chromium` when present. Else install its browser with `npx playwright install --with-deps chromium`; `CHROMIUM_PATH` can select a compatible existing executable. The tests launch and stop their own preview server on port 8080; stop a manual preview first. Two workers limit resource use.

Browser tests use synthetic enquiry details and intercept outbound handoffs. They do not send messages to the business. Reports, screenshots and failure traces go to ignored `test-results/`. The visual/accessibility matrix uses reduced motion so transient reveal animations do not distort contrast measurements; interaction tests also run with normal motion. Automated axe checks do not substitute for a complete manual accessibility audit.

`test:build` intentionally regenerates `dist/` with test origins and finally without an origin. `verify` runs the normal build afterwards to restore configured production metadata. Always run `npm run build` with the intended production origin before upload.

## Enquiries and privacy

Visitors select roles, set quantities and periods, enter contact details, review the enquiry, then choose WhatsApp or email. These buttons prepare drafts; the visitor must press Send in the external application. The site cannot confirm delivery or recruitment. There is no server-side form submission, inbox, CRM or analytics endpoint.

Theme choice uses local storage. Requirement selections and contact drafts use the current tab's session storage; “Clear all” or completion clears the draft. Browser session restoration can retain session storage: clear sensitive drafts on shared devices. Blocked storage displays a warning. With JavaScript disabled, navigation and direct contact links remain available.

## A/B experiment

The public default remains the original control with no experiment recording. Opt in to a **local demonstration** using `/?experiment=hero-cta`; assignment remains stable in that tab. Force `&variant=A` or `&variant=B` for QA, and use `/?experiment=off` to leave. Only the hero CTA label changes; no website copy is duplicated.

No events leave the browser. No real visitor sample or experiment winner has been established. See [experiment design and interpretation](docs/AB_TESTING.md) before enabling any production measurement.

## Deployment

Cloudflare Pages is the prepared hosting option. Connect this repository, select production branch `main`, build command `npm run build`, and output `dist`. See [deployment steps](docs/DEPLOYMENT.md). Publishing requires the owner's hosting account/project and real origin. This repository does not itself establish that a site is live.

For another static host, reproduce the extensionless page behavior and security headers explicitly. GitHub Pages does not apply Cloudflare `_headers` and needs additional base-path handling for a project subdirectory; the current configuration targets a domain root.

See [validation evidence and limits](docs/VALIDATION.md) and [recovery provenance](docs/RECOVERY.md).
