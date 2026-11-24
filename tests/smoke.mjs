// Playwright smoke test for SaralPath.
// Run from ~/workspace/video-build so playwright-core resolves:
//   cd ~/workspace/video-build && node ~/workspace/hackathons-wave4/accessed-hacks/tests/smoke.mjs
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire('/home/hatch/workspace/video-build/package.json');
const { firefox } = require('playwright-core');

const DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };

const server = http.createServer(async (req, res) => {
  try {
    const file = path.join(DIR, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404); res.end('not found');
  }
});

let failures = 0;
function check(name, ok, extra = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${extra ? ' — ' + extra : ''}`);
  if (!ok) failures++;
}

await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const browser = await firefox.launch({
  executablePath: process.env.HOME + '/.cache/ms-playwright/firefox-1543/firefox/firefox',
});
const page = await browser.newPage();
const consoleErrors = [];
const pageErrors = [];
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', (e) => pageErrors.push(String(e)));

await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'load' });
check('page title mentions SaralPath', (await page.title()).includes('SaralPath'), await page.title());
check('zero console errors', consoleErrors.length === 0, consoleErrors.join(' | '));
check('zero page errors', pageErrors.length === 0, pageErrors.join(' | '));

// Simplify the photosynthesis paragraph
await page.fill('#input', 'Photosynthesis is the fundamental process by which green plants transform sunlight, water, and carbon dioxide into glucose and oxygen.');
await page.click('#simplifyBtn');
await page.waitForTimeout(300);
const out = await page.textContent('#output');
check('simplified text contains "basic way"', /basic way/.test(out), out.slice(0, 120));
const scores = await page.textContent('#scores');
check('scores show ease gain', /Reading ease/.test(scores) && /\+/.test(scores), scores.slice(0, 120));
const words = await page.textContent('#words');
check('word list shows fundamental -> basic', /fundamental/.test(words) && /basic/.test(words), words.slice(0, 160));

// Glossary lookup
await page.fill('#lookup', 'consequently');
await page.click('#lookupBtn');
await page.waitForTimeout(300);
const lk = await page.textContent('#lookupResult');
check('lookup consequently -> so', /\bso\b/.test(lk) && /isliye/.test(lk), lk.slice(0, 120));

// Unknown word lookup is honest
await page.fill('#lookup', 'photosynthesis');
await page.click('#lookupBtn');
await page.waitForTimeout(300);
const lk2 = await page.textContent('#lookupResult');
check('unknown word says not in glossary', /not in the 93-word glossary/.test(lk2), lk2.slice(0, 120));

// Sample lessons render with measured numbers
const samples = await page.textContent('#samples');
check('samples show photosynthesis 18 -> 40.3', /18/.test(samples) && /40\.3/.test(samples), samples.slice(0, 160));
check('samples show 3 lessons', (await page.$$('#samples .sample')).length === 3);

// Large-text toggle works
await page.check('#bigText');
await page.waitForTimeout(200);
check('large-text toggle adds class', await page.evaluate(() => document.body.classList.contains('bigtext')));

await browser.close();
server.close();
process.exit(failures ? 1 : 0);
