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
