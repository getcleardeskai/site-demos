const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const dir = path.join(__dirname, 'assets', 'img');

// [topCropPct, bottomCropPct] measured against each specific screenshot's chrome.
const JOBS = {
  'hero-fireplace-src.png':    [0,     0.095],  // reel, just an "Add comment" bar at bottom
  'kitchen-island-src.png':    [0,     0.075],  // reel, "Add comment" bar at bottom
  'bathroom-marble-src.png':   [0.16,  0.185],  // feed post: status/header top, likes+caption+date bottom
  'bathroom-luxury-src.png':   [0.16,  0.185],
  'bathroom-modern-src.png':   [0.16,  0.06],   // feed post but this slide has no caption showing, just header
  'basement-hallway-src.png':  [0.16,  0.05],   // reel-style, no caption on this slide
  'basement-lounge-src.png':   [0.16,  0.30],   // feed post, full 3-line caption + engagement bar + next avatar
  'staircase-src.png':         [0.16,  0.05],
  'commercial-flooring-src.jpeg':[0,   0],      // clean camera photo, no app chrome
  'deck-src.png':              [0,     0],      // clean camera photo, no app chrome
};

async function run(){
  for (const [file, [topPct, botPct]] of Object.entries(JOBS)) {
    const src = path.join(dir, file);
    if (!fs.existsSync(src)) { console.log('MISSING', file); continue; }
    const meta = await sharp(src).metadata();
    let pipeline = sharp(src);
    if (topPct > 0 || botPct > 0) {
      const top = Math.round(meta.height * topPct);
      const bottom = Math.round(meta.height * botPct);
      pipeline = pipeline.extract({ left: 0, top, width: meta.width, height: meta.height - top - bottom });
    }
    pipeline = pipeline.resize({ width: 1600, withoutEnlargement: true })
      .normalize().modulate({ saturation: 1.06, brightness: 1.02 }).sharpen({ sigma: 0.8 });
    const outName = file.replace('-src', '').replace(/\.(png|jpeg)$/i, '.jpg');
    await pipeline.jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(dir, outName));
    fs.unlinkSync(src);
    console.log('ok', file, '->', outName);
  }
}
run().catch(e => { console.error(e); process.exit(1); });
