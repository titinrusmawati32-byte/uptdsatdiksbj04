import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8"
};

export default function handler(req, res) {
  const host = req.headers.host || "localhost";
  const parsedUrl = new URL(req.url || "/", `https://${host}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Normalisasi rute utama
  if (pathname === "/" || pathname === "") {
    pathname = "/index.html";
  } else if (pathname === "/admin" || pathname === "/admin/") {
    pathname = "/admin/index.html";
  }

  let filePath = path.join(__dirname, pathname);

  // Jika file tanpa ekstensi, coba cari file .html yang cocok
  if (!path.extname(pathname) && !fs.existsSync(filePath)) {
    if (fs.existsSync(filePath + ".html")) {
      filePath = filePath + ".html";
    }
  }

  // Jika file ditemukan pada disk, sajikan dengan MIME type yang benar
  if (fs.existsSync(filePath)) {
    try {
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        res.statusCode = 200;
        res.setHeader("Content-Type", MIME_TYPES[ext] || "application/octet-stream");
        res.setHeader("Content-Length", stat.size);
        if (ext === ".css" || ext === ".js" || ext === ".svg" || ext === ".png" || ext === ".jpg" || ext === ".webp") {
          res.setHeader("Cache-Control", "public, max-age=86400");
        } else {
          res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
        }
        return fs.createReadStream(filePath).pipe(res);
      }
    } catch (e) {
      // lanjut ke fallback jika error
    }
  }

  // Fallback untuk subrute admin
  if (pathname.startsWith("/admin/")) {
    const adminIndex = path.join(__dirname, "admin", "index.html");
    if (fs.existsSync(adminIndex)) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return fs.createReadStream(adminIndex).pipe(res);
    }
  }

  // 404 Not Found
  res.statusCode = 404;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.end("Not Found: " + pathname);
}
