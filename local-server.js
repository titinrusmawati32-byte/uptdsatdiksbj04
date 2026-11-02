// Local development server for SDN Sumberejo 04
// Jalankan dengan: node local-server.js
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createCmsStore } from "./lib/cmsStore.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const store = createCmsStore();

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
  ".txt": "text/plain; charset=utf-8"
};

const DEFAULT_GAS_URL =
  process.env.GAS_API_URL ||
  "https://script.google.com/macros/s/AKfycbycxG7Ctmdj_6x8CQJRlXBqr302UEgZ8JQ5f4qI52AlJBWI9W2YtYocEK7Z2_ZyIhhj3w/exec";

const sseClients = new Set();

function broadcastSseUpdate(action) {
  const bundle = store.handleGet("getSiteBundle");
  const payload = JSON.stringify({ action, bundle, time: new Date().toISOString() });
  for (const client of sseClients) {
    try {
      client.write(`event: cms_update\ndata: ${payload}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }
}

function sendJson(res, statusCode, data) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Cache-Control": "no-store"
  });
  res.end(body);
}

function readRequestBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf-8");
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
    req.on("error", () => resolve({}));
  });
}

function sanitizeForSheets(obj) {
  if (!obj || typeof obj !== "object") return obj;
  const copy = JSON.parse(JSON.stringify(obj));
  const cleanItem = (item) => {
    if (!item || typeof item !== "object") return item;
    const res = { ...item };
    ["fotoUrl", "bannerUrl", "foto", "gambar", "thumbnail", "url", "url_foto"].forEach((f) => {
      if (res[f] && String(res[f]).startsWith("data:")) {
        res[f] = "[Foto Cloud]";
      } else if (res[f] && String(res[f]).length > 2000) {
        res[f] = String(res[f]).substring(0, 2000);
      }
    });
    return res;
  };
  if (copy.collections) {
    Object.keys(copy.collections).forEach((col) => {
      if (Array.isArray(copy.collections[col])) {
        copy.collections[col] = copy.collections[col].map(cleanItem);
      }
    });
  }
  return copy;
}

// Hydrate initial store from live Google Apps Script in background (non-blocking)
if (DEFAULT_GAS_URL && !DEFAULT_GAS_URL.includes("SAMPLE_DEPLOYMENT_ID")) {
  fetch(`${DEFAULT_GAS_URL}?action=getSiteBundle&_t=${Date.now()}`, {
    method: "GET",
    headers: { Accept: "application/json" }
  })
    .then((r) => (r.ok ? r.json() : null))
    .then((json) => {
      if (json && json.ok && json.data) {
        store.applyRemoteBundle(json.data);
      }
    })
    .catch(() => {});
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept"
    });
    res.end();
    return;
  }

  // 1. /api/health
  if (pathname === "/api/health") {
    return sendJson(res, 200, { status: "ok", timestamp: new Date().toISOString() });
  }

  // 2. /api/firebase-config
  if (pathname === "/api/firebase-config") {
    try {
      const configPath = path.join(__dirname, "firebase-applet-config.json");
      if (fs.existsSync(configPath)) {
        const content = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        return sendJson(res, 200, content);
      }
    } catch {}
    return sendJson(res, 200, {
      projectId: "flowing-landing-p1ttq",
      appId: "1:658106437485:web:25c4a3ddaf8839d208d464",
      apiKey: "AIzaSyD1OC3GXFjNViCP5oRD8Iur7l53A10GbRA",
      authDomain: "flowing-landing-p1ttq.firebaseapp.com",
      firestoreDatabaseId: "ai-studio-senapati-576aa692-d29b-404c-a567-79c97545d9e4",
      storageBucket: "flowing-landing-p1ttq.firebasestorage.app",
      messagingSenderId: "658106437485"
    });
  }

  // 3. /api/events (SSE stream)
  if (pathname === "/api/events") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*"
    });
    res.write(`retry: 5000\n\n`);
    sseClients.add(res);
    req.on("close", () => sseClients.delete(res));
    return;
  }

  // 4. /api/media/:id
  if (pathname.startsWith("/api/media/")) {
    const rawId = pathname.replace("/api/media/", "");
    const media = store.getMediaFile(rawId);
    if (media && media.buffer) {
      res.writeHead(200, {
        "Content-Type": media.mime || "image/jpeg",
        "Content-Length": media.buffer.length,
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*"
      });
      res.end(media.buffer);
      return;
    }
    res.writeHead(302, { Location: "/assets/img/pengumuman-sumpah-pemuda.svg" });
    res.end();
    return;
  }

  // 5. /api/drive-image
  if (pathname === "/api/drive-image") {
    const driveId = parsedUrl.searchParams.get("id");
    if (!driveId || !/^[a-zA-Z0-9_-]+$/.test(driveId)) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Invalid Drive ID");
      return;
    }
    const urlsToTry = [
      `https://drive.google.com/thumbnail?id=${driveId}&sz=w1200`,
      `https://lh3.googleusercontent.com/d/${driveId}=w1200`,
      `https://drive.google.com/uc?export=view&id=${driveId}`
    ];
    for (const targetUrl of urlsToTry) {
      try {
        const r = await fetch(targetUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0",
            Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8"
          }
        });
        const ct = r.headers.get("content-type") || "";
        if (r.ok && ct.startsWith("image/")) {
          const arrBuf = await r.arrayBuffer();
          const buffer = Buffer.from(arrBuf);
          if (buffer.length > 0) {
            res.writeHead(200, {
              "Content-Type": ct,
              "Content-Length": buffer.length,
              "Cache-Control": "public, max-age=86400",
              "Access-Control-Allow-Origin": "*"
            });
            res.end(buffer);
            return;
          }
        }
      } catch {}
    }
    res.writeHead(302, { Location: "/assets/img/pengumuman-sumpah-pemuda.svg" });
    res.end();
    return;
  }

  // 6. /api/gas-sync
  if (pathname === "/api/gas-sync") {
    try {
      const body = req.method === "POST" ? await readRequestBody(req) : {};
      const mode = body.mode || parsedUrl.searchParams.get("mode");
      if (mode === "push") {
        const cleanBundle = sanitizeForSheets(body.bundle || {});
        if (DEFAULT_GAS_URL && !DEFAULT_GAS_URL.includes("SAMPLE_DEPLOYMENT_ID")) {
          fetch(DEFAULT_GAS_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({ action: "admin_pushBundle", bundle: cleanBundle })
          }).catch(() => {});
        }
        return sendJson(res, 200, {
          ok: true,
          message: "Seluruh data berhasil dikirim ke Google Sheets!"
        });
      }

      const gasRes = await fetch(`${DEFAULT_GAS_URL}?action=getSiteBundle&_t=${Date.now()}`, {
        method: "GET",
        headers: { Accept: "application/json" }
      });
      if (!gasRes.ok) {
        throw new Error(`Google Apps Script HTTP Error: ${gasRes.status}`);
      }
      const json = await gasRes.json();
      if (json && json.ok && json.data) {
        store.applyRemoteBundle(json.data);
        broadcastSseUpdate("gas_sync_pull");
      }
      return sendJson(res, 200, {
        ok: Boolean(json && json.ok),
        data: json?.data || store.handleGet("getSiteBundle"),
        message: json?.message || "Data berhasil ditarik dari Google Sheets",
        time: new Date().toISOString()
      });
    } catch (err) {
      return sendJson(res, 200, {
        ok: true,
        data: store.handleGet("getSiteBundle"),
        message: "Menggunakan penyimpanan lokal CMS (" + (err.message || "offline") + ")",
        time: new Date().toISOString()
      });
    }
  }

  // 7. /api/gas
  if (pathname === "/api/gas") {
    if (req.method === "GET") {
      try {
        const query = Object.fromEntries(parsedUrl.searchParams.entries());
        const action = query.action ? String(query.action) : "getSiteBundle";
        const data = store.handleGet(action, query);
        return sendJson(res, 200, {
          ok: true,
          data,
          message: "Berhasil",
          time: new Date().toISOString()
        });
      } catch (err) {
        return sendJson(res, 200, {
          ok: false,
          data: null,
          code: err.code || "BAD_REQUEST",
          message: err.message || "Terjadi kesalahan pada server."
        });
      }
    }

    if (req.method === "POST") {
      try {
        const body = await readRequestBody(req);
        if (
          body.action === "admin_uploadMedia" &&
          DEFAULT_GAS_URL &&
          !DEFAULT_GAS_URL.includes("SAMPLE_DEPLOYMENT_ID")
        ) {
          try {
            const driveRes = await fetch(DEFAULT_GAS_URL, {
              method: "POST",
              headers: { "Content-Type": "text/plain;charset=utf-8" },
              body: JSON.stringify(body)
            });
            const driveJson = await driveRes.json();
            if (driveJson && driveJson.ok && driveJson.url) {
              return sendJson(res, 200, {
                ok: true,
                data: driveJson,
                id: driveJson.fileId || driveJson.id,
                url: driveJson.url,
                fileId: driveJson.fileId || driveJson.id
              });
            }
          } catch {}
        }

        const data = store.handlePost(body);
        broadcastSseUpdate(body.action || "post");

        if (DEFAULT_GAS_URL && !DEFAULT_GAS_URL.includes("SAMPLE_DEPLOYMENT_ID")) {
          try {
            const cleanBody = JSON.parse(JSON.stringify(body));
            if (cleanBody.data && typeof cleanBody.data === "object") {
              ["fotoUrl", "bannerUrl", "foto", "gambar", "thumbnail", "url"].forEach((k) => {
                if (cleanBody.data[k] && String(cleanBody.data[k]).startsWith("data:")) {
                  cleanBody.data[k] = "[Foto Cloud]";
                }
              });
            }
            fetch(DEFAULT_GAS_URL, {
              method: "POST",
              headers: { "Content-Type": "text/plain;charset=utf-8" },
              body: JSON.stringify(cleanBody)
            }).catch(() => {});
          } catch {}
        }

        return sendJson(res, 200, {
          ok: true,
          data,
          message: "Berhasil",
          time: new Date().toISOString()
        });
      } catch (err) {
        return sendJson(res, 200, {
          ok: false,
          data: null,
          code: err.code || "INTERNAL_ERROR",
          message: err.message || "Terjadi kesalahan pada server."
        });
      }
    }

    return sendJson(res, 405, { ok: false, message: "Method Not Allowed" });
  }

  // 8. Redirect old website routes to the newest landing page sections
  const OLD_PAGE_REDIRECTS = {
    "/beranda": "/#beranda",
    "/beranda.html": "/#beranda",
    "/profil": "/#profil",
    "/profil.html": "/#profil",
    "/guru": "/#guru",
    "/guru.html": "/#guru",
    "/program": "/#program",
    "/program.html": "/#program",
    "/fasilitas": "/#fasilitas",
    "/fasilitas.html": "/#fasilitas",
    "/galeri": "/#galeri",
    "/galeri.html": "/#galeri",
    "/pengumuman": "/#pengumuman",
    "/pengumuman.html": "/#pengumuman",
    "/spmb": "/#spmb",
    "/spmb.html": "/#spmb",
    "/daftar": "/#spmb",
    "/daftar.html": "/#spmb",
    "/kontak": "/#kontak",
    "/kontak.html": "/#kontak"
  };

  if (OLD_PAGE_REDIRECTS[pathname]) {
    res.writeHead(302, { Location: OLD_PAGE_REDIRECTS[pathname] });
    res.end();
    return;
  }

  // 9. Static files
  if (pathname === "/") pathname = "/index.html";
  if (pathname === "/admin" || pathname === "/admin/") pathname = "/admin/index.html";

  const filePath = path.join(__dirname, pathname);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server lokal berjalan di http://localhost:${PORT}`);
});
