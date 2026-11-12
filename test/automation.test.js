import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateVersionAlignment } from '../scripts/check.mjs';

const appSource = "export const APP_VERSION = '0.47.1';";
const versionJson = '{ "version": "0.47.1" }';

test('Versionsprüfung akzeptiert übereinstimmende App- und Changelog-Versionen', () => {
  assert.deepEqual(validateVersionAlignment({
    appSource,
    versionJson,
    changelog: '# Änderungsprotokoll\n\n## v0.47.1 – Startseite symmetrisch\n',
  }), []);
});

test('Versionsprüfung erkennt eine abweichende oberste Changelog-Version', () => {
  const errors = validateVersionAlignment({
    appSource,
    versionJson,
    changelog: '# Änderungsprotokoll\n\n## v0.47.0 – alter Stand\n',
  });
  assert.equal(errors.length, 1);
  assert.match(errors[0], /CHANGELOG/);
});

test('Versionsprüfung meldet ungültiges version.json', () => {
  const errors = validateVersionAlignment({
    appSource,
    versionJson: 'kein JSON',
    changelog: '## v0.47.1 – gültig',
  });
  assert.equal(errors.length, 1);
  assert.match(errors[0], /JSON/);
});

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { collectJavaScriptFiles } from '../scripts/check.mjs';

test('Syntaxprüfung erfasst js/, src/, worker/ und sw.js, aber keine CSS-Dateien', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kuhhandel-check-'));
  try {
    for (const dir of ['js/nested', 'src', 'worker', 'css']) fs.mkdirSync(path.join(root, dir), { recursive: true });
    for (const file of ['js/nested/app.js', 'src/engine.js', 'worker/index.js', 'sw.js', 'css/style.css']) {
      fs.writeFileSync(path.join(root, file), '');
    }
    const files = collectJavaScriptFiles(root).map(file => path.relative(root, file)).sort();
    assert.deepEqual(files, ['js/nested/app.js', 'src/engine.js', 'sw.js', 'worker/index.js']);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
