const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const bumpType = process.argv[2] || 'patch';

const versionFile = path.join(root, 'VERSION');
const packageFile = path.join(root, 'package.json');
const frontendVersionFile = path.join(root, 'public', 'version.json');
const frontendIndexFile = path.join(root, 'public', 'index.html');
const changelogFile = path.join(root, 'CHANGELOG.md');

function parseVersion(v) {
  const cleaned = v.trim().replace(/^V/i, '');
  const parts = cleaned.split('.').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    throw new Error(`Versión inválida: ${v}`);
  }
  return parts;
}

function bump([maj, min, pat], type) {
  if (type === 'major') return [maj + 1, 0, 0];
  if (type === 'minor') return [maj, min + 1, 0];
  return [maj, min, pat + 1];
}

function main() {
  const current = fs.readFileSync(versionFile, 'utf8').trim();
  const nextParts = bump(parseVersion(current), bumpType);
  const nextV = `V${nextParts.join('.')}`;
  const nextPlain = nextParts.join('.');

  fs.writeFileSync(versionFile, `${nextV}\n`, 'utf8');

  const pkg = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
  pkg.version = nextPlain;
  fs.writeFileSync(packageFile, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');

  const fv = { version: nextV };
  fs.writeFileSync(frontendVersionFile, `${JSON.stringify(fv, null, 2)}\n`, 'utf8');

  const html = fs.readFileSync(frontendIndexFile, 'utf8');
  const updatedHtml = html.replace(/>V\d+\.\d+\.\d+</g, `>${nextV}<`);
  fs.writeFileSync(frontendIndexFile, updatedHtml, 'utf8');

  const today = new Date().toISOString().slice(0, 10);
  const changelogEntry = `\n## ${nextV} - ${today}\n\n- Actualización de versión automática (${bumpType}).\n`;
  const existing = fs.readFileSync(changelogFile, 'utf8');
  fs.writeFileSync(changelogFile, `${existing}${changelogEntry}`, 'utf8');

  console.log(`Versión actualizada a ${nextV}`);
}

main();
