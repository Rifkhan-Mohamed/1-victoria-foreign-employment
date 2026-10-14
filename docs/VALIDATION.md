# Validation record — 14 October 2026

Validated in the attached Codex Cloud machine using Node 24.19.0, npm 11.9.0 and system Chromium 154.0.8037.57. This records local evidence; it does not certify a public deployment or external message delivery.

| Check | Observed result |
| --- | --- |
| Input integrity | ZIP CRC passed; 192/192 recorded SHA-256 entries matched |
| Source assets | All 70 files under `src/assets/` match the supplied ZIP byte-for-byte |
| Frozen installation | `npm ci --ignore-scripts --no-audit --no-fund` passed using the workspace cache |
| Syntax | 12 JavaScript files passed `node --check`; no TypeScript/separate linter applies |
| Build tests | 3 passed, 0 failed/skipped: origin metadata, unsafe origins, repeatability |
| Production build | Six source pages plus 404, local assets, robots and host headers generated |
| Reference validation | Six pages, 270 local references and 75 source/output assets passed |
| Existing workflow regressions | 86 script-level assertions passed |
| Browser suite | 43 passed, 0 failed/skipped in the final full run |
| Responsive/theme matrix | All six pages at 390×844, 768×1024 and 1440×1000, light and dark |
| Accessibility | No axe WCAG 2 A/AA or 2.1 AA violations in the tested page matrix and populated mobile review; keyboard menu, skip link, role dialog and FAQ exercised |
| Browser resources | Tested images decode, local fonts load, no matrix page/console errors or HTTP asset failures, no horizontal overflow at the selected sizes |
| Functional flow | Role selection/duplicates, invalid quantity/email, review, draft reload, WhatsApp draft destinations, clear/cancel, no-JavaScript and blocked-storage fallback passed |
| Experiment | A and B text/rendering, all selected viewports, session persistence, random/forced modes, local event flags, reset and corrupt/blocked storage passed |
| Security/configuration | CSP applied in preview; private paths return 404; POST returns 405; nested 404 page loads; invalid public origins rejected |
| Dependencies | `npm audit --audit-level=high`: 0 reported vulnerabilities at validation time |
| Credential review | No private-key/token/credential assignment patterns found in reviewed source, scripts, tests, docs and CI configuration |
| Visual inspection | Desktop light homepage, mobile dark homepage and populated mobile enquiry screenshots inspected |

The last full `npm run verify` completed successfully after repairs. Reports/screenshots are generated under ignored `test-results/`; CI is configured to upload them. CI itself has not been observed running remotely in this task.

## Diagnosed and corrected findings

- Light-theme gold small text and contact links had insufficient contrast. Darker accent text and explicit contact-link colours passed the follow-up checks.
- Saved role identifiers could resolve inherited object properties. Catalog lookup now requires own properties; corrupt/hostile identifiers render an empty safe state.
- Export verification depended on immutable source manifests, incompatible with continued maintenance. It now checks actual built references, source/output equivalence and functional behavior; the input ZIP remains the provenance baseline.
- Local source used Google Font links and old hosting URLs. These are now removed from source as well as output; fonts are bundled and metadata uses the configured origin.
- No-JavaScript form controls could suggest an available submission flow. The form is hidden in that mode and direct contact alternatives remain.
- Initial browser-test failures also exposed harness issues: empty, deliberately unpopulated dialog images must not be decoded; assertions after link navigation must wait for load; Playwright text queries skip `noscript` content, so fallback text is checked through its actual DOM paragraph. These were corrected without removing functional assertions.
- The accessibility/screenshot matrix runs with reduced motion for stable contrast measurement. Normal-motion interaction paths are covered separately.

## Limits and outstanding work

Only Chromium was executed; Safari/WebKit, Firefox, assistive-technology usability, production performance/load testing and a complete manual accessibility audit remain outside these checks. Static local response timings are not production performance evidence. All original assets, including unused earlier images, were retained; browsers request only referenced assets.

WhatsApp drafts were intercepted in-browser and email URL construction was tested at script level. No real messages were sent. Phone calls, external applications and actual delivery remain unverified. The experiment has no production traffic, aggregate analytics or winning variant.

Cloudflare publication is pending account/project connection and the real public origin. No live deployment, DNS change or public-site verification occurred. GitHub API inspection was blocked by a proxy HTTP 403; native Git transport is tested separately. See `DEPLOYMENT.md` for the exact next steps.
