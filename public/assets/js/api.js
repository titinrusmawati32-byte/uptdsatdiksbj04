/**
 * Klien API Frontend SD Negeri Sumberejo 04
 * Mendukung Akselerator Realtime (/api/gas + SSE + BroadcastChannel)
 * dan Fallback Langsung ke Google Apps Script Web App
 */

(function () {
  const getGasUrl = () => {
    return (window.APP_CONFIG && window.APP_CONFIG.API_URL) ? window.APP_CONFIG.API_URL : "";
  };

  const getProxyUrl = () => {
    return (window.APP_CONFIG && window.APP_CONFIG.PROXY_URL) ? window.APP_CONFIG.PROXY_URL : "/api/gas";
  };

  async function fetchJsonWithFallback(primaryUrl, fallbackUrl, options) {
    try {
      const res = await fetch(primaryUrl, options);
      if (res.ok) {
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          return await res.json();
        }
      }
    } catch (e) {}

    if (!fallbackUrl) {
      throw new Error("Endpoint API tidak tersedia.");
    }

    const fallbackRes = await fetch(fallbackUrl, options);
    if (!fallbackRes.ok) {
      throw new Error(`HTTP Error ${fallbackRes.status}: Gagal menghubungi server Google Apps Script.`);
    }
    return await fallbackRes.json();
  }

  function extractActionFromBundle(bundle, action, params = {}) {
    if (!bundle || typeof bundle !== "object") return null;
    const cols = bundle.collections || {};
    switch (action) {
      case "getSiteBundle":
        return bundle;
      case "getSiteConfig":
        return bundle.config || {};
      case "getPengumuman": {
        const limit = Math.max(1, parseInt(params.limit, 10) || 10);
        const list = Array.isArray(bundle.pengumuman)
          ? bundle.pengumuman
          : Array.isArray(cols.Pengumuman)
          ? cols.Pengumuman.filter((r) => r.tampil === true || String(r.tampil).toUpperCase() === "TRUE")
          : [];
        return list.slice(0, limit);
      }
      case "getGuru":
        return Array.isArray(bundle.guru)
          ? bundle.guru
          : Array.isArray(cols.Guru)
          ? cols.Guru.filter((r) => r.tampil === true || String(r.tampil).toUpperCase() === "TRUE")
          : [];
      case "getEkskul":
        return Array.isArray(bundle.ekskul)
          ? bundle.ekskul
          : Array.isArray(cols.Ekstrakurikuler)
          ? cols.Ekstrakurikuler.filter((r) => r.tampil === true || String(r.tampil).toUpperCase() === "TRUE")
          : [];
      case "getFasilitas":
        return Array.isArray(bundle.fasilitas)
          ? bundle.fasilitas
          : Array.isArray(cols.Fasilitas)
          ? cols.Fasilitas.filter((r) => r.tampil === true || String(r.tampil).toUpperCase() === "TRUE")
          : [];
      case "getGaleri": {
        const limit = Math.max(1, parseInt(params.limit, 10) || 20);
        const list = Array.isArray(bundle.galeri)
          ? bundle.galeri
          : Array.isArray(cols.Galeri)
          ? cols.Galeri.filter((r) => r.tampil === true || String(r.tampil).toUpperCase() === "TRUE")
          : [];
        return list.slice(0, limit);
      }
      case "cekStatus": {
        const nomor = String(params.nomor || "").trim().toUpperCase();
        const pendaftar = Array.isArray(bundle.pendaftar) ? bundle.pendaftar : [];
        const found = pendaftar.find(
          (p) => String(p.nomorPendaftaran || "").trim().toUpperCase() === nomor
        );
        if (!found) {
          return { ditemukan: false, message: "Nomor pendaftaran tidak ditemukan." };
        }
        return {
          ditemukan: true,
          nomorPendaftaran: found.nomorPendaftaran,
          namaMurid: found.namaMurid,
          status: found.status || "diproses"
        };
      }
      default:
        return null;
    }
  }

  /**
   * Panggilan HTTP GET publik secara REAL-TIME
   * @param {string} action Nama endpoint aksi
   * @param {object} params Parameter query tambahan
   * @returns {Promise<any>}
   */
  async function apiGet(action, params = {}) {
    const gasUrl = getGasUrl();
    const proxyUrl = getProxyUrl();
    const qs = new URLSearchParams({ action, ...params, _t: Date.now() }).toString();

    const primary = `${proxyUrl}?${qs}`;
    const fallback = gasUrl && !gasUrl.includes("SAMPLE_DEPLOYMENT_ID") ? `${gasUrl}?${qs}` : "";

    try {
      const json = await fetchJsonWithFallback(primary, fallback, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store"
      });

      if (!json.ok) {
        // Jika GAS lama hanya mendukung getSiteBundle, otomatis tarik getSiteBundle lalu ekstrak datanya
        if (action !== "getSiteBundle" && fallback) {
          const bundleQs = new URLSearchParams({ action: "getSiteBundle", _t: Date.now() }).toString();
          const bundleJson = await fetchJsonWithFallback(
            `${proxyUrl}?${bundleQs}`,
            `${gasUrl}?${bundleQs}`,
            {
              method: "GET",
              headers: { Accept: "application/json" },
              cache: "no-store"
            }
          );
          if (bundleJson && bundleJson.ok && bundleJson.data) {
            const extracted = extractActionFromBundle(bundleJson.data, action, params);
            if (extracted !== null) {
              return extracted;
            }
          }
        }
        throw new Error(json.message || "Permintaan API gagal diproses.");
      }
      return json.data;
    } catch (err) {
      console.error(`[API Error - ${action}]:`, err);
      throw err;
    }
  }

  /**
   * Panggilan HTTP POST (pendaftaran & formulir)
   * @param {object} payload Payload data JSON
   * @returns {Promise<any>}
   */
  async function apiPost(payload) {
    const gasUrl = getGasUrl();
    const proxyUrl = getProxyUrl();
    const fallback = gasUrl && !gasUrl.includes("SAMPLE_DEPLOYMENT_ID") ? gasUrl : "";

    try {
      const json = await fetchJsonWithFallback(proxyUrl, fallback, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
      });

      if (!json.ok) {
        const error = new Error(json.message || "Gagal memproses permintaan.");
        error.code = json.code;
        error.data = json.data;
        throw error;
      }
      return json.data;
    } catch (err) {
      console.error("[API POST Error]:", err);
      throw err;
    }
  }

  window.SchoolAPI = {
    get: apiGet,
    post: apiPost
  };
})();
