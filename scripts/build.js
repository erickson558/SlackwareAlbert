const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'dist');
const icoName = 'social_media_social_network_logo_message_logotype_logos_chat_whatsapp_red_icon-icons.com_61223.ico';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);

  if (stat.isDirectory()) {
    ensureDir(dest);
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
    return;
  }

  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function cleanDist() {
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  ensureDir(distDir);
}

function main() {
  cleanDist();

  const toCopy = ['public', 'api', 'src', 'index.php', 'README.md', 'LICENSE', 'VERSION'];
  for (const item of toCopy) {
    const src = path.join(root, item);
    const dest = path.join(distDir, item);

    if (fs.existsSync(src)) {
      copyRecursive(src, dest);
    }
  }

  const iconSrc = path.join(root, icoName);
  const iconDest = path.join(distDir, icoName);
  if (fs.existsSync(iconSrc)) {
    fs.copyFileSync(iconSrc, iconDest);
  } else {
    throw new Error(`No se encontró el ícono requerido: ${icoName}`);
  }

  console.log('Build completado en dist/ con favicon .ico incluido.');
}

main();
