import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const ROOT = process.cwd();
const SVG_PATH = path.join(ROOT, 'public', 'favicon.svg');
const svgBuffer = fs.readFileSync(SVG_PATH);

// Create playstore-assets folder
const playstoreDir = path.join(ROOT, 'playstore-assets');
if (!fs.existsSync(playstoreDir)) {
  fs.mkdirSync(playstoreDir, { recursive: true });
}

async function generate() {
  console.log('Generating high-resolution Play Store 512x512 icon...');
  const icon512Path = path.join(playstoreDir, 'icon-512x512.png');
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(icon512Path);

  console.log('Generating Google Play Feature Graphic 1024x500...');
  // Render icon inside feature graphic with banner
  const centerIconBuffer = await sharp(svgBuffer)
    .resize(260, 260)
    .png()
    .toBuffer();

  const featureGraphicSvg = `
  <svg width="1024" height="500" viewBox="0 0 1024 500" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#2a1f1b" />
        <stop offset="50%" stop-color="#1c1412" />
        <stop offset="100%" stop-color="#140f0d" />
      </linearGradient>
      <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ef6c47" />
        <stop offset="100%" stop-color="#b8381a" />
      </linearGradient>
    </defs>
    <rect width="1024" height="500" fill="url(#bg)" />
    
    <!-- Subtle circular table watermark on right -->
    <circle cx="820" cy="250" r="280" fill="none" stroke="#ffffff" stroke-opacity="0.04" stroke-width="8" />
    <circle cx="820" cy="250" r="180" fill="none" stroke="#ef6c47" stroke-opacity="0.06" stroke-width="4" stroke-dasharray="12 12" />
    
    <!-- Left branding text -->
    <text x="80" y="210" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="900" fill="#ffffff" letter-spacing="-0.5">Dining Philosophers</text>
    <text x="80" y="270" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="800" fill="url(#accentGrad)" letter-spacing="1">CAFÉ</text>
    <text x="80" y="325" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="500" fill="#bfaea5">Interactive Concurrency &amp; Deadlock Simulation Lab</text>
    
    <!-- Features badge row -->
    <rect x="80" y="365" width="130" height="34" rx="17" fill="#3a2f2a" />
    <text x="145" y="387" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#ef6c47" text-anchor="middle">DEADLOCK LAB</text>

    <rect x="222" y="365" width="130" height="34" rx="17" fill="#3a2f2a" />
    <text x="287" y="387" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#38bdf8" text-anchor="middle">SOLUTION LAB</text>

    <rect x="364" y="365" width="130" height="34" rx="17" fill="#3a2f2a" />
    <text x="429" y="387" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#22c55e" text-anchor="middle">OFFLINE FIRST</text>
  </svg>
  `;

  const featureGraphicBase = Buffer.from(featureGraphicSvg);
  await sharp(featureGraphicBase)
    .composite([
      {
        input: centerIconBuffer,
        top: 120,
        left: 690,
      },
    ])
    .png()
    .toFile(path.join(playstoreDir, 'feature-graphic-1024x500.png'));

  console.log('Generating Android native launcher and adaptive icons...');
  const resDir = path.join(ROOT, 'android', 'app', 'src', 'main', 'res');

  const densities = [
    { name: 'mipmap-mdpi', iconSize: 48, fgSize: 108 },
    { name: 'mipmap-hdpi', iconSize: 72, fgSize: 162 },
    { name: 'mipmap-xhdpi', iconSize: 96, fgSize: 216 },
    { name: 'mipmap-xxhdpi', iconSize: 144, fgSize: 324 },
    { name: 'mipmap-xxxhdpi', iconSize: 192, fgSize: 432 },
  ];

  for (const d of densities) {
    const dir = path.join(resDir, d.name);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // ic_launcher.png
    await sharp(svgBuffer)
      .resize(d.iconSize, d.iconSize)
      .png()
      .toFile(path.join(dir, 'ic_launcher.png'));

    // ic_launcher_round.png
    // Apply circular mask for round launcher
    const circleSvg = Buffer.from(
      `<svg width="${d.iconSize}" height="${d.iconSize}"><circle cx="${d.iconSize / 2}" cy="${d.iconSize / 2}" r="${d.iconSize / 2}" fill="#ffffff"/></svg>`
    );
    await sharp(svgBuffer)
      .resize(d.iconSize, d.iconSize)
      .composite([{ input: circleSvg, blend: 'dest-in' }])
      .png()
      .toFile(path.join(dir, 'ic_launcher_round.png'));

    // ic_launcher_foreground.png (for adaptive icons, centered with padding)
    const padding = Math.round(d.fgSize * 0.18);
    const innerSize = d.fgSize - padding * 2;
    const innerBuf = await sharp(svgBuffer)
      .resize(innerSize, innerSize)
      .png()
      .toBuffer();

    await sharp({
      create: {
        width: d.fgSize,
        height: d.fgSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([{ input: innerBuf, top: padding, left: padding }])
      .png()
      .toFile(path.join(dir, 'ic_launcher_foreground.png'));
  }

  console.log('Generating Splash Screen drawables...');


  const splashDrawableDirs = [
    { dir: 'drawable', width: 480, height: 800 },
    { dir: 'drawable-port-mdpi', width: 320, height: 480 },
    { dir: 'drawable-port-hdpi', width: 480, height: 800 },
    { dir: 'drawable-port-xhdpi', width: 720, height: 1280 },
    { dir: 'drawable-port-xxhdpi', width: 960, height: 1600 },
    { dir: 'drawable-port-xxxhdpi', width: 1280, height: 1920 },
    { dir: 'drawable-land-mdpi', width: 480, height: 320 },
    { dir: 'drawable-land-hdpi', width: 800, height: 480 },
    { dir: 'drawable-land-xhdpi', width: 1280, height: 720 },
    { dir: 'drawable-land-xxhdpi', width: 1600, height: 960 },
    { dir: 'drawable-land-xxxhdpi', width: 1920, height: 1280 },
  ];

  for (const s of splashDrawableDirs) {
    const targetDir = path.join(resDir, s.dir);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    const iconDim = Math.min(Math.round(Math.min(s.width, s.height) * 0.35), 240);
    const currentIcon = await sharp(svgBuffer)
      .resize(iconDim, iconDim)
      .png()
      .toBuffer();

    const top = Math.round((s.height - iconDim) / 2);
    const left = Math.round((s.width - iconDim) / 2);

    await sharp({
      create: {
        width: s.width,
        height: s.height,
        channels: 4,
        background: { r: 250, g: 246, b: 242, alpha: 1 }, // #faf6f2 Cafe theme background
      },
    })
      .composite([{ input: currentIcon, top, left }])
      .png()
      .toFile(path.join(targetDir, 'splash.png'));
  }

  console.log('All icons, splash screens, and Play Store graphics generated successfully!');
}

generate().catch((err) => {
  console.error('Asset generation error:', err);
  process.exit(1);
});
