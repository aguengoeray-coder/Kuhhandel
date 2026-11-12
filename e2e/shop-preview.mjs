import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { chromium } from 'playwright';

const root = process.cwd();
let server;
let browser;
let origin;

before(async () => {
  server = createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const relative = pathname === '/' ? 'shop-demo.html' : pathname.slice(1);
      const file = resolve(root, relative);
      if (file !== root && !file.startsWith(root + sep)) {
        res.writeHead(403).end('Forbidden');
        return;
      }
      const body = await readFile(file);
      const type = ({
        '.html': 'text/html; charset=utf-8',
        '.js': 'text/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
      })[extname(file)] || 'application/octet-stream';
      res.writeHead(200, { 'content-type': type }).end(body);
    } catch {
      res.writeHead(404).end('Not found');
    }
  });
  await new Promise((resolveListen) => server.listen(0, '127.0.0.1', resolveListen));
  origin = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ headless: true });
});

after(async () => {
  await browser?.close();
  if (server) await new Promise(resolveClose => server.close(resolveClose));
});

test('Shop-Karten sind auf beiden iPhone-Landscape-Größen vollständig sichtbar', async () => {
  await mkdir('shop-report', { recursive: true });
  for (const viewport of [{ width: 852, height: 393 }, { width: 667, height: 375 }]) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${origin}/shop-demo.html`, { waitUntil: 'load' });
    await page.locator('.shop-avatar-item').first().waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: `shop-report/shop-${viewport.width}x${viewport.height}.png`,
      fullPage: true,
    });

    assert.equal(await page.locator('.shop-avatar-item').count(), 11, 'Es müssen 11 Avatar-Karten angezeigt werden.');
    assert.equal(await page.locator('.shop-saying-item').count(), 8, 'Es müssen 8 Sprüche angezeigt werden.');

    const avatarIssues = await page.locator('.shop-avatar-item').evaluateAll(cards => cards.flatMap((card, index) => {
      const cardRect = card.getBoundingClientRect();
      const cardStyle = getComputedStyle(card);
      const sectionRect = card.closest('.shop-avatar-section').getBoundingClientRect();
      const headingRect = card.closest('.shop-avatar-section').querySelector('.shop-section-head').getBoundingClientRect();
      const issues = [];
      if (cardRect.left < -1 || cardRect.top < -1 || cardRect.right > innerWidth + 1 || cardRect.bottom > innerHeight + 1) {
        issues.push(`Avatar-Karte ${index + 1} liegt außerhalb des sichtbaren Viewports.`);
      }
      if (cardRect.top < headingRect.bottom - 1 || cardRect.bottom > sectionRect.bottom + 1) {
        issues.push(`Avatar-Karte ${index + 1} ragt aus dem Avatar-Bereich.`);
      }
      for (const child of card.querySelectorAll('.shop-art,.shop-item-name,.shop-item-sub,.shop-action,.shop-active,.shop-owned')) {
        const rect = child.getBoundingClientRect();
        if (rect.width && rect.height && (rect.left < cardRect.left - 1 || rect.top < cardRect.top - 1 || rect.right > cardRect.right + 1 || rect.bottom > cardRect.bottom + 1)) {
          issues.push(`Avatar-Karte ${index + 1}: ${child.className || child.tagName} ragt aus der Karte.`);
        }
        if (child.matches('.shop-action') && child.scrollWidth > child.clientWidth + 1) {
          issues.push(`Avatar-Karte ${index + 1}: Button-Text wird abgeschnitten.`);
        }
        if (child.matches('.shop-item-name') && child.scrollHeight > child.clientHeight + 2) {
          issues.push(`Avatar-Karte ${index + 1}: Name wird abgeschnitten.`);
        }
        if (child.matches('.shop-item-name,.shop-item-sub')) {
          const infoRect = card.querySelector('.shop-avatar-info').getBoundingClientRect();
          if (rect.height && rect.bottom > infoRect.bottom + 1) {
            issues.push(`Avatar-Karte ${index + 1}: Text ragt in die Aktionszeile.`);
          }
        }
        if (child.matches('.shop-action[data-price]') && innerWidth <= 700) {
          const priceLabel = getComputedStyle(child, '::after').content;
          if (!priceLabel.includes(String(child.dataset.price)) || !priceLabel.includes('D')) {
            issues.push(`Avatar-Karte ${index + 1}: Preis fehlt auf dem schmalen Layout.`);
          }
        }
      }
      if (cardStyle.overflow === 'hidden' || cardStyle.overflow === 'clip') issues.push(`Avatar-Karte ${index + 1} schneidet Inhalte ab.`);
      return issues;
    }));

    const fontIssues = await page.locator('.shop-shell').evaluate(root =>
      [...root.querySelectorAll('h1,h2,h3,p,span,strong,button')]
        .filter(el => parseFloat(getComputedStyle(el).fontSize) < 10)
        .map(el => `${el.tagName.toLowerCase()}.${el.className}: ${getComputedStyle(el).fontSize}`)
    );

    const sayingIssues = await page.locator('.shop-saying-item').evaluateAll(cards => cards.flatMap((card, index) => {
      const cardRect = card.getBoundingClientRect();
      const issues = [];
      for (const child of card.querySelectorAll('.shop-saying-text,.shop-saying-price,.shop-action,.shop-owned')) {
        const rect = child.getBoundingClientRect();
        if (rect.width && rect.height && (rect.left < cardRect.left - 1 || rect.top < cardRect.top - 1 || rect.right > cardRect.right + 1 || rect.bottom > cardRect.bottom + 1)) {
          issues.push(`Spruch-Karte ${index + 1}: ${child.className} ragt aus der Karte.`);
        }
        if (child.matches('.shop-action') && child.scrollWidth > child.clientWidth + 1) {
          issues.push(`Spruch-Karte ${index + 1}: Button-Text wird abgeschnitten.`);
        }
      }
      return issues;
    }));

    assert.deepEqual(errors, [], `JavaScript-Fehler bei ${viewport.width}×${viewport.height}`);
    assert.deepEqual(avatarIssues, [], `Avatar-Layout bei ${viewport.width}×${viewport.height}`);
    assert.deepEqual(sayingIssues, [], `Spruch-Layout bei ${viewport.width}×${viewport.height}`);
    assert.deepEqual(fontIssues, [], `Shop-Schriftgrößen unter 10 px bei ${viewport.width}×${viewport.height}`);
    await page.close();
  }
});
