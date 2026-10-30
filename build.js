import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const distDir = path.resolve(rootDir, "dist");

console.log("Memulai proses build static site untuk Vercel...");

if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

const filesAndDirs = [
  "index.html",
  "daftar.html",
  "profil.html",
  "guru.html",
  "program.html",
  "fasilitas.html",
  "spmb.html",
  "kontak.html",
  "pengumuman.html",
  "robots.txt",
  "firebase-applet-config.json",
  "admin",
  "assets"
];

for (const item of filesAndDirs) {
  const src = path.resolve(rootDir, item);
  const dest = path.resolve(distDir, item);
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
    console.log(`✓ Tersalin ke dist: ${item}`);
  }
}

console.log("✓ Build selesai! Output berhasil dibuat di folder 'dist'.");
