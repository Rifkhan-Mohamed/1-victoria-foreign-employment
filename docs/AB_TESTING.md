# Hero CTA experiment: hero-cta-v1

Status: implemented and browser-testable locally; production enrolment and aggregation are not enabled. There are no visitor counts, conversion-rate estimates, significance results or declared winner.

## One change, one hypothesis

Control A retains **Build your requirement**. Variant B uses **Start your workforce enquiry**. Both retain the same placement, colours, destination, hero headline and surrounding content.

Hypothesis: explicitly naming a workforce enquiry makes the next step clearer to first-time employers and increases the proportion who review a valid enquiry. Risk: longer text may distract or wrap on small screens; the alternative may encourage low-intent clicks without more completed reviews.

Primary metric for a future production experiment: unique exposed eligible sessions with `requirement_review` / unique exposed eligible sessions. Secondary metrics: hero CTA click-through and outbound draft handoff attempt rates, each using exposed sessions as denominator. `handoff_attempt` is an attempted draft opening, **not message delivery or a completed sale**. Guardrails: invalid-form rate, accessibility/responsive regressions and page performance. Invalid-form counts are not collected by this foundation; add that only as part of an approved measurement plan.

## Local demonstration

- `/?experiment=hero-cta` assigns A or B 50/50 using `crypto.getRandomValues`.
- The versioned assignment and event flags persist in `sessionStorage` across same-tab navigation and reloads. A new independent session draws again; duplicated/restored tabs can inherit storage. This is not a cross-device visitor identity.
- `/?experiment=hero-cta&variant=A` and `&variant=B` start fresh forced QA runs marked `assignment: "forced"`. Never mix them with real observations.
- Default visits are unenrolled and render A. `/?experiment=off` clears enrolment. Unavailable session storage safely falls back to unenrolled A.
- A CTA at least 50% visible records `exposure`. Without IntersectionObserver, no exposure is recorded. Later events are ignored until exposure exists.
- `hero_click`, `requirement_review` and `handoff_attempt` are Boolean flags, deduplicated once per tab session. They contain no names, phone numbers, email addresses, notes, identifiers or exact timestamps.
- Inspect the local record in browser developer tools: `window.victoriaExperiment.report()`. `window.victoriaExperiment.reset()` clears it. Avoid exporting other browser storage, which contains the separate enquiry draft.

There is no fetch, beacon, analytics cookie or external collector. The Content Security Policy blocks connections. Browser functional tests verify both variants, persistence, event transitions, forced/random modes, opt-out, corrupt storage and blocked-storage fallback. Synthetic test events are not performance evidence.

## Before a real experiment

Obtain approval for any collector/provider, data transmission, retention policy and consent approach. Decide whether anonymous session metrics are sufficient or server assignment is required. Keep production default on A until these decisions are made; adding a query flag alone does not create a representative visitor sample.

Pre-register eligibility, bot/internal/QA exclusions, the primary metric, minimum detectable effect, sample-size calculation (baseline, 80% power and two-sided 5% alpha), a fixed duration covering normal business cycles, and stopping rules. Do not pick a sample size without a credible baseline. Determine how consent and storage refusal affect eligibility, and do not transmit contact details with experiment events.

Adopt B only after the planned sample/duration completes, the primary metric improves with a 95% confidence interval excluding zero, and predefined guardrails remain acceptable. Otherwise retain A or report an inconclusive result. Do not repeatedly peek and stop at the first favourable result. CTR alone cannot establish that B produces better enquiries; handoff attempts cannot establish delivery.

A client-side assignment can be manipulated or lost and may cause a brief text swap. For a production experiment, consider an early assignment script or server assignment after assessing cache behavior and consent; measure flicker and layout shift. Do not duplicate the complete site or add paid infrastructure merely for this local foundation.
