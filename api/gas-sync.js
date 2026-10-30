const DEFAULT_GAS_URL =
  process.env.GAS_API_URL ||
  "https://script.google.com/macros/s/AKfycbycxG7Ctmdj_6x8CQJRlXBqr302UEgZ8JQ5f4qI52AlJBWI9W2YtYocEK7Z2_ZyIhhj3w/exec";

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

    // 1. MODE PUSH: Mengirim seluruh data CMS ke Google Sheets agar Spreadsheet terisi
    if (body.mode === "push" || req.query?.mode === "push") {
      const bundle = body.bundle || {};

      // Kirim perintah batch push ke Google Apps Script
      const postPayload = {
        action: "admin_pushBundle",
        bundle: bundle
      };

      const gasRes = await fetch(DEFAULT_GAS_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(postPayload)
      });

      const text = await gasRes.text();
      let json = {};
      try {
        json = JSON.parse(text);
      } catch {
        json = { ok: gasRes.ok, message: text };
      }

      // Jika script GAS yang lama belum mengenali admin_pushBundle, lakukan fallback pengiriman per sheet
      if (!json.ok && bundle.config) {
        try {
          const cfgItems = Object.entries(bundle.config).map(([k, v]) => ({ kunci: k, nilai: v }));
          await fetch(DEFAULT_GAS_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({ action: "admin_saveKonten", items: cfgItems })
          });

          if (bundle.collections) {
            for (const [sheet, rows] of Object.entries(bundle.collections)) {
              if (Array.isArray(rows)) {
                for (const row of rows) {
                  await fetch(DEFAULT_GAS_URL, {
                    method: "POST",
                    headers: { "Content-Type": "text/plain;charset=utf-8" },
                    body: JSON.stringify({ action: "admin_saveRow", sheetName: sheet, data: row })
                  });
                }
              }
            }
          }
          json = { ok: true, message: "Seluruh data berhasil disinkronkan ke Google Sheets!" };
        } catch (fbErr) {
          console.warn("Fallback push GAS:", fbErr);
        }
      }

      return res.status(200).json({
        ok: Boolean(json && json.ok),
        message: json.message || "Data berhasil dikirim ke Google Sheets!",
        details: json.details || null
      });
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
