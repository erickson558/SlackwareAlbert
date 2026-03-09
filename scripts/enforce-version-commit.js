const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');

function fail(message) {
  console.error(`\n[version-guard] ${message}\n`);
  process.exit(1);
}

function read(filePath) {
  return fs.readFileSync(path.join(root, filePath), 'utf8').trim();
}

function normalizeVersion(v) {
  const m = /^V(\d+)\.(\d+)\.(\d+)$/.exec(v.trim());
  if (!m) {
    fail(`VERSION debe tener formato Vx.x.x. Valor actual: ${v}`);
  }
  return `${m[1]}.${m[2]}.${m[3]}`;
}

function getHeadVersion() {
  try {
    const raw = execSync('git show HEAD:VERSION', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    return normalizeVersion(raw);
  } catch (error) {
    return null;
  }
}

function ensureStaged(filePath, stagedSet) {
  if (!stagedSet.has(filePath)) {
    fail(`Debes incluir ${filePath} en el commit.`);
  }
}

function main() {
  const stagedRaw = execSync('git diff --cached --name-only', { encoding: 'utf8' }).trim();
  const staged = stagedRaw ? stagedRaw.split(/\r?\n/).map((s) => s.trim()).filter(Boolean) : [];
  const stagedSet = new Set(staged);

  if (staged.length === 0) {
    process.exit(0);
  }

  const required = ['VERSION', 'package.json', 'public/version.json', 'CHANGELOG.md'];
  required.forEach((filePath) => ensureStaged(filePath, stagedSet));

  const versionRaw = read('VERSION');
  const versionPlain = normalizeVersion(versionRaw);

  const pkg = JSON.parse(read('package.json'));
  if (pkg.version !== versionPlain) {
    fail(`package.json version (${pkg.version}) no coincide con VERSION (${versionPlain}).`);
  }

  const frontendVersion = JSON.parse(read('public/version.json'));
  if (frontendVersion.version !== `V${versionPlain}`) {
    fail(`public/version.json version (${frontendVersion.version}) no coincide con VERSION (V${versionPlain}).`);
  }

  const changelog = read('CHANGELOG.md');
  if (!changelog.includes(`## V${versionPlain}`)) {
    fail(`CHANGELOG.md debe incluir una sección para V${versionPlain}.`);
  }

  const headVersion = getHeadVersion();
  if (headVersion && headVersion === versionPlain) {
    fail(`La versión no cambió respecto a HEAD (${headVersion}). Incrementa versión antes de commit.`);
  }

  console.log(`[version-guard] OK - versión V${versionPlain} validada.`);
}

main();
