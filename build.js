import fs from "node:fs";
import path from "node:path";
import { buildSync } from "esbuild";

const rootDir = process.cwd();
const outDir = path.join(rootDir, "public");

// 1. Bundle React + GSAP + ScrollTrigger Motion System into /assets/js/gridora-motion.js
const motionEntry = path.join(rootDir, "src", "motion", "index.tsx");
if (fs.existsSync(motionEntry)) {
  buildSync({
    entryPoints: [motionEntry],
    bundle: true,
    format: "esm",
    target: ["es2020"],
    outfile: path.join(rootDir, "assets", "js", "gridora-motion.js"),
    minify: true,
    jsx: "automatic",
    define: {
      "process.env.NODE_ENV": '"production"'
    }
  });
  console.log("✅ Compiled React + GSAP + ScrollTrigger bundle -> assets/js/gridora-motion.js");
}

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const entries = fs.readdirSync(rootDir);
for (const entry of entries) {
  if (["node_modules", ".git", "public", ".vercel", "bun.lock", "src"].includes(entry)) {
    continue;
  }
  const src = path.join(rootDir, entry);
  const dest = path.join(outDir, entry);
  try {
    fs.cpSync(src, dest, { recursive: true, force: true });
  } catch (e) {
    // ignore
  }
}

console.log("✅ Static site successfully built in public/ folder");

