import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const pages = ['index', 'about', 'industries', 'approach', 'hire', 'contact'];
const sizes = { mobile: { width: 390, height: 844 }, tablet: { width: 768, height: 1024 }, desktop: { width: 1440, height: 1000 } };
test.beforeEach(async ({ page }) => {
  await page.route('**/*', route => {
    if (new URL(route.request().url()).hostname === '127.0.0.1') return route.continue();
    return route.abort();
  });
});
for (const name of pages) for (const [size, viewport] of Object.entries(sizes)) for (const theme of ['light', 'dark']) {
  test(`${name}: ${size}, ${theme}, assets and accessibility`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(t => localStorage.setItem('vt', t), theme);
    const errors = [], failed = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('response', response => { if (response.status() >= 400) failed.push(response.url()); });
    expect((await page.goto(`/${name}.html`)).status()).toBe(200);
    await page.evaluate(async () => {
      document.querySelectorAll('img[loading="lazy"]').forEach(img => img.loading = 'eager');
      await document.fonts.ready;
      await Promise.all(Array.from(document.images).filter(img => img.hasAttribute('src') || img.hasAttribute('srcset')).map(img => img.decode()));
    });
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    expect(await page.evaluate(() => document.fonts.check('16px "Hanken Grotesk"'))).toBe(true);
    expect(failed).toEqual([]); expect(errors).toEqual([]);
    const a11y = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(a11y.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
    if (name === 'index' && size !== 'tablet') await page.screenshot({ path: testInfo.outputPath(`${size}-${theme}.png`), fullPage: true });
  });
}

test('mobile navigation, theme persistence, keyboard dialog, FAQ and role journey', async ({ page }) => {
  await page.setViewportSize(sizes.mobile);
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip')).toBeFocused();
  await page.locator('.menu').click();
  await expect(page.locator('.menu')).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(page.locator('.menu')).toBeFocused();
  await expect(page.locator('#nav')).not.toBeVisible();
  await page.locator('#th').click();
  await page.locator('.menu').click();
  await page.locator('#nav a[href="industries.html"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const view = page.locator('#role-electrician [data-act="view"]');
  await view.click();
  await expect(page.locator('#dlg')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(view).toBeFocused();
  await view.click();
  await page.locator('#da').click();
  await expect(page.locator('#toast')).toContainText('added');
  await page.locator('#role-electrician [data-act="add"]').click();
  await expect(page.locator('#toast')).toContainText('already');
  await page.goto('/hire');
  await expect(page.locator('#rows')).toContainText('Electrician');
  await page.goto('/approach#faq');
  const faq = page.locator('summary').first();
  await faq.focus(); await page.keyboard.press('Enter');
  await expect(page.locator('details').first()).toHaveAttribute('open', '');
});

async function roleAndDetails(page) {
  await page.goto('/industries');
  await page.locator('#role-electrician [data-act="add"]').click();
  await page.goto('/hire');
  await page.locator('#co').fill('Example Company');
  await page.locator('#nm').fill('Example Contact');
  await page.locator('#ph').fill('+94 77 123 4567');
}

test('validation, quantities, review, draft persistence, both handoffs and clearing', async ({ page }, testInfo) => {
  await page.setViewportSize(sizes.mobile);
  await page.goto('/hire');
  await page.locator('#review').click();
  await expect(page.locator('#er')).toContainText('at least one role');
  await roleAndDetails(page);
  await page.locator('[data-f="qty"]').fill('0');
  await page.locator('#co').click();
  await expect(page.locator('[data-f="qty"]')).toHaveValue('1');
  await page.locator('[data-f="qty"]').fill('12');
  await page.locator('[data-f="yrs"]').selectOption('3');
  await page.locator('[data-f="notes"]').fill('Conduit skills <script>not code</script>');
  await page.locator('#em').fill('invalid@');
  await page.locator('#review').click();
  await expect(page.locator('#em')).toHaveAttribute('aria-invalid', 'true');
  await page.locator('#em').fill('example@example.com');
  await page.locator('#iv').check();
  await page.locator('#loc').fill('Colombo');
  await page.locator('#review').click();
  await expect(page.locator('#review-panel')).toBeFocused();
  await expect(page.locator('#review-copy')).toContainText('12 personnel, 3 years');
  await expect(page.locator('#review-copy')).toContainText('<script>not code</script>');
  await expect(page.locator('#review-copy script')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  const a11y = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(a11y.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath('mobile-enquiry.png'), fullPage: true });
  await page.evaluate(() => { window.testHandoffs = []; window.open = (...args) => { window.testHandoffs.push(args); return null; }; });
  await page.locator('#sw').click();
  await page.locator('#sw2').click();
  const handoffs = await page.evaluate(() => window.testHandoffs);
  expect(handoffs.map(h => new URL(h[0]).pathname)).toEqual(['/94743825222', '/94718700077']);
  expect(new URL(handoffs[0][0]).searchParams.get('text')).toContain('Example Company');
  expect(handoffs.every(h => h[2] === 'noopener')).toBe(true);
  await expect(page.locator('#ok')).toContainText('press Send');
  await page.locator('#edit-enquiry').click();
  await expect(page.locator('#review-panel')).not.toBeVisible();
  await page.reload();
  await expect(page.locator('#co')).toHaveValue('Example Company');
  await expect(page.locator('[data-f="qty"]')).toHaveValue('12');
  await page.locator('#clear-all').click();
  await page.locator('#cancel-clear').click();
  await expect(page.locator('#rows')).toContainText('Electrician');
  await page.locator('#clear-all').click();
  await page.locator('#confirm-clear').click();
  await expect(page.locator('#rows')).toContainText('No roles selected');
  await expect(page.locator('#co')).toHaveValue('');
  expect(await page.evaluate(() => sessionStorage.getItem('vreq-details-v2'))).toBeNull();
});

for (const variant of ['A', 'B']) test(`experiment ${variant}: stable assignment, isolated event flags and reset`, async ({ page }) => {
  await page.goto(`/?experiment=hero-cta&variant=${variant}`);
  await expect(page.locator('#hero-cta')).toHaveText(variant === 'A' ? 'Build your requirement ↗' : 'Start your workforce enquiry ↗');
  for (const viewport of Object.values(sizes)) {
    await page.setViewportSize(viewport);
    await expect(page.locator('#hero-cta')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  }
  await expect.poll(() => page.evaluate(() => window.victoriaExperiment.report()?.events.exposure)).toBe(true);
  await page.locator('#hero-cta').click();
  await page.waitForLoadState('load');
  expect((await page.evaluate(() => window.victoriaExperiment.report())).events.hero_click).toBe(true);
  await roleAndDetails(page);
  await page.locator('#review').click();
  await page.evaluate(() => { window.open = () => null; });
  await page.locator('#sw').click();
  const report = await page.evaluate(() => window.victoriaExperiment.report());
  expect(report).toEqual({ id: 'hero-cta-v1', variant, assignment: 'forced', events: { exposure: true, hero_click: true, requirement_review: true, handoff_attempt: true } });
  expect(JSON.stringify(report)).not.toContain('Example');
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-experiment-variant', variant);
  await page.goto('/?experiment=off');
  expect(await page.evaluate(() => window.victoriaExperiment.report())).toBeNull();
  await expect(page.locator('#hero-cta')).toContainText('Build your requirement');
});

test('default control is untracked; random assignment persists; corrupt and denied storage are safe', async ({ page }) => {
  await page.goto('/');
  expect(await page.evaluate(() => window.victoriaExperiment.report())).toBeNull();
  expect(await page.evaluate(() => sessionStorage.length)).toBe(0);
  await page.goto('/?experiment=hero-cta');
  const report = await page.evaluate(() => window.victoriaExperiment.report());
  expect(['A', 'B']).toContain(report.variant); expect(report.assignment).toBe('random');
  await page.goto('/');
  expect((await page.evaluate(() => window.victoriaExperiment.report())).variant).toBe(report.variant);
  await page.evaluate(() => { sessionStorage.setItem('victoria-experiment-hero-cta-v1', 'bad JSON'); sessionStorage.setItem('vreq-session-v2', '[{"id":"__proto__"},{"id":"constructor"}]'); });
  await page.goto('/hire');
  await expect(page.locator('#rows')).toContainText('No roles selected');
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => { Object.defineProperty(window, 'sessionStorage', { get() { throw new Error('Storage blocked'); } }); });
  await page.goto('/?experiment=hero-cta&variant=B');
  await expect(page.locator('#hero-cta')).toContainText('Build your requirement');
  await page.goto('/industries');
  await page.locator('#role-electrician [data-act="add"]').click();
  await expect(page.locator('#toast')).toContainText('cannot save');
  expect(errors).toEqual([]);
});

test('no-JavaScript navigation and direct contact fallback', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: sizes.mobile });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:8080/hire');
  await expect(page.locator('#nav')).toBeVisible();
  expect(await page.locator('main noscript p').evaluate(el => el.textContent)).toContain('JavaScript is needed');
  await expect(page.locator('main a[href^="mailto:"]')).toBeVisible();
  await context.close();
});

test('all local links, extensionless pages, 404 and security headers', async ({ page, request }) => {
  for (const name of pages) {
    const response = await request.get('/' + name);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-security-policy']).toContain("connect-src 'none'");
  }
  expect((await request.get('/not-a-page')).status()).toBe(404);
  await page.goto('/missing/nested/page');
  await expect(page.locator('h1')).toHaveText('Page not found');
  expect(await page.locator('h1').evaluate(el => getComputedStyle(el).fontFamily)).toContain('Newsreader');
  expect((await request.get('/.env')).status()).toBe(404);
  expect((await request.post('/hire', { data: 'test' })).status()).toBe(405);
  await page.goto('/');
  const links = await page.locator('a[href]').evaluateAll(nodes => Array.from(new Set(nodes.map(n => n.getAttribute('href')).filter(h => !/^(https?:|mailto:|tel:|#)/.test(h)))));
  for (const link of links) expect((await request.get('/' + link)).status()).toBe(200);
});
