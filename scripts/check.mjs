import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const sourceDirs = ['js', 'src', 'worker'];

export function collectJavaScriptFiles(baseDir = root) {
  const files = [];
  const visit = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) visit(fullPath);
      else if (entry.isFile() && entry.name.endsWith('.js')) files.push(fullPath);
    }
  };
  for (const dir of sourceDirs) visit(path.join(baseDir, dir));
  const serviceWorker = path.join(baseDir, 'sw.js');
  if (fs.existsSync(serviceWorker)) files.push(serviceWorker);
  return [...new Set(files)].sort();
}

export function validateVersionAlignment({ appSource, versionJson, changelog }) {
  const appMatch = appSource.match(/\bAPP_VERSION\s*=\s*['"]([0-9]+\.[0-9]+\.[0-9]+)['"]/);
  if (!appMatch) return ['APP_VERSION konnte in js/app.js nicht gelesen werden.'];

  let jsonVersion;
  try {
    jsonVersion = JSON.parse(versionJson).version;
  } catch {
    return ['version.json ist kein gültiges JSON.'];
  }
  const changelogMatch = changelog.match(/^##\s+v?([0-9]+\.[0-9]+\.[0-9]+)/m);
  const errors = [];
  if (!jsonVersion) errors.push('version.json enthält kein version-Feld.');
  if (!changelogMatch) errors.push('Oberster CHANGELOG-Eintrag hat keine Versionsnummer (erwartet: ## vX.Y.Z).');
  if (jsonVersion && appMatch[1] !== jsonVersion) {
    errors.push(`APP_VERSION (${appMatch[1]}) stimmt nicht mit version.json (${jsonVersion}) überein.`);
  }
  if (changelogMatch && appMatch[1] !== changelogMatch[1]) {
    errors.push(`APP_VERSION (${appMatch[1]}) stimmt nicht mit dem obersten CHANGELOG-Eintrag (${changelogMatch[1]}) überein.`);
  }
  return errors;
}

function main() {
  const files = collectJavaScriptFiles();
  if (!files.length) {
    console.error('Keine JavaScript-Dateien in js/, src/, worker/ oder sw.js gefunden.');
    process.exitCode = 1;
    return;
  }

  let failed = false;
  for (const file of files) {
    const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    if (result.status !== 0) {
      failed = true;
      console.error(`✗ Syntaxfehler: ${path.relative(root, file)}`);
      if (result.stderr) process.stderr.write(result.stderr);
      if (result.stdout) process.stdout.write(result.stdout);
    }
  }
  if (!failed) console.log(`✓ JavaScript-Syntax: ${files.length} Dateien geprüft.`);

  const versionErrors = validateVersionAlignment({
    appSource: fs.readFileSync(path.join(root, 'js/app.js'), 'utf8'),
    versionJson: fs.readFileSync(path.join(root, 'version.json'), 'utf8'),
    changelog: fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8'),
  });
  if (versionErrors.length) {
    failed = true;
    for (const error of versionErrors) console.error(`✗ ${error}`);
  } else {
    const version = JSON.parse(fs.readFileSync(path.join(root, 'version.json'), 'utf8')).version;
    console.log(`✓ App-Version konsistent: ${version} (APP_VERSION = version.json = oberster CHANGELOG-Eintrag).`);
  }

  // package.json.version ist bewusst ausgenommen: 0.1.0 sind npm-Paketmetadaten,
  // keine Versionsnummer der ausgelieferten Browser-App.
  if (failed) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
