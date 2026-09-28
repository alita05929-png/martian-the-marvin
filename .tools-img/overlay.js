const sharp = require("./node_modules/sharp");
const path = require("path");

const UP = "E:/Rocket/sunson12/Solana/Dog/marvin/wp-content/uploads/2024/09";
const SRC = "E:/Rocket/sunson12/Solana/Dog/marvin/.tools-img/backup";
const LOGO = "E:/pack/bsc/marvin/.tools-img/bnb.svg";
const PREVIEW = "E:/Rocket/sunson12/Solana/Dog/marvin/.tools-img/preview";

const overlays = {
  "marvin_the_fluffy_dog_psyco-5.png": [{ left: 285, top: 215, size: 155, cover: "#f4f7fb" }],
  "marvin_the_fluffy_dog_psyco-6.png": [{ left: 248, top: 248, size: 145, cover: "#1e3a6e" }],
  "marvin_the_fluffy_dog_psyco-8.png": [
    { left: 168, top: 42, size: 108, cover: "#f7f9fc" },
    { left: 22, top: 388, size: 40, cover: "#1a2a4a" },
  ],
  "marvin_the_fluffy_dog_psyco-9.png": [{ left: 178, top: 88, size: 155, cover: "#cfe6f5" }],
  "marvin_the_fluffy_dog_psyco-11.png": [
    { left: 78, top: 688, size: 105, cover: "#ffffff" },
  ],
  "marvin_the_fluffy_dog_psyco-12.png": [{ left: 505, top: 68, size: 195, glow: true }],
  "marvin_the_fluffy_dog_psyco-13.png": [{ left: 995, top: 525, size: 118 }],
};

async function apply(file, writeOriginal) {
  const src = path.join(SRC, file);
  let img = sharp(src);
  const meta = await img.metadata();
  const comps = [];
  for (const o of overlays[file]) {
    if (o.cover) {
      const svg = Buffer.from(
        `<svg width="${o.size}" height="${Math.round(o.size * 0.85)}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" rx="${Math.round(o.size * 0.08)}" fill="${o.cover}"/></svg>`
      );
      comps.push({ input: svg, left: o.left, top: o.top });
    }
    if (o.glow) {
      const pad = Math.round(o.size * 0.18);
      const d = o.size + pad * 2;
      const svg = Buffer.from(
        `<svg width="${d}" height="${d}" xmlns="http://www.w3.org/2000/svg"><circle cx="${d / 2}" cy="${d / 2}" r="${d / 2}" fill="#08101c"/></svg>`
      );
      comps.push({ input: svg, left: Math.max(0, o.left - pad), top: Math.max(0, o.top - pad) });
    }
    const buf = await sharp(LOGO, { density: 400 })
      .resize(o.size, Math.round(o.size * 0.75), { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    comps.push({ input: buf, left: o.left, top: o.top });
  }
  const composed = img.composite(comps);
  const previewName = file.replace(".png", "-overlay.png");
  await composed.clone().resize({ width: 600 }).png().toFile(path.join(PREVIEW, previewName));
  if (writeOriginal) {
    const outBuf = await composed.png({ compressionLevel: 8 }).toBuffer();
    await sharp(outBuf).toFile(path.join(UP, file));
    const stem = file.replace(".png", "");
    await sharp(outBuf).resize(1024, 771).toFile(path.join(UP, `${stem}-1024x771.png`));
    await sharp(outBuf).resize(300, 226).toFile(path.join(UP, `${stem}-300x226.png`));
    console.log("wrote original + thumbs", file);
  } else {
    console.log("preview", previewName, meta.width, meta.height);
  }
}

(async () => {
  const write = process.argv.includes("--write");
  for (const file of Object.keys(overlays)) {
    await apply(file, write);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
