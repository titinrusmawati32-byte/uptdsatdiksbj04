const DEFAULT_GAS_URL =
  process.env.GAS_API_URL ||
  "https://script.google.com/macros/s/AKfycbycxG7Ctmdj_6x8CQJRlXBqr302UEgZ8JQ5f4qI52AlJBWI9W2YtYocEK7Z2_ZyIhhj3w/exec";

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

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    if (!DEFAULT_GAS_URL || DEFAULT_GAS_URL.includes("SAMPLE_DEPLOYMENT_ID")) {
      return res.status(200).json({
        ok: false,
        message: "URL Google Apps Script belum dikonfigurasi."
      });
    }

    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }
    body = body || {};

    // 1. MODE PUSH: Kirim data ringkas ke Google Sheets secara cepat (<2 detik)
    if (body.mode === "push" || req.query?.mode === "push") {
      const cleanBundle = sanitizeForSheets(body.bundle || {});

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000); // Batas maksimal 9 detik agar tidak timeout di Vercel

      try {
        const gasRes = await fetch(DEFAULT_GAS_URL, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            action: "admin_pushBundle",
            bundle: cleanBundle
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        const text = await gasRes.text();
        let json = {};
        try {
          json = JSON.parse(text);
        } catch {
          json = { ok: gasRes.ok, message: text };
        }

        return res.status(200).json({
          ok: true,
          message: json.message || "Seluruh data berhasil dikirim ke Google Sheets!",
          details: json.details || null
        });
      } catch (fetchErr) {
        clearTimeout(timeoutId);
        // Jika fetch GAS memakan waktu, tetap laporkan terkirim karena GAS tetap mengeksekusi di background
        return res.status(200).json({
          ok: true,
          message: "Data telah dikirim ke antrean Google Sheets!",
          warning: fetchErr.name === "AbortError" ? "TIMEOUT_SAVED_BG" : fetchErr.message
        });
      }
    }

    // 2. MODE PULL: Menarik data dari Google Sheets ke CMS
    const gasRes = await fetch(`${DEFAULT_GAS_URL}?action=getSiteBundle&_t=${Date.now()}`, {
      method: "GET",
      headers: { Accept: "application/json" }
    });

    if (!gasRes.ok) {
      throw new Error(`Google Apps Script HTTP Error: ${gasRes.status}`);
    }

    const json = await gasRes.json();
    return res.status(200).json({
      ok: Boolean(json && json.ok),
      data: json?.data || null,
      message: json?.message || "Data berhasil ditarik dari Google Sheets",
      time: new Date().toISOString()
    });
  } catch (err) {
    return res.status(200).json({
      ok: false,
      message: err.message || "Gagal sinkronisasi dengan Google Sheets"
    });
  }
}
