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
      message: json?.message || "Sinkronisasi berhasil",
      time: new Date().toISOString()
    });
  } catch (err) {
    return res.status(200).json({
      ok: false,
      message: err.message || "Gagal sinkronisasi data dari Google Sheets"
    });
  }
}
