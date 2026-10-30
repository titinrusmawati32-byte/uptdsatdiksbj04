/**
 * =======================================================================
 * GOOGLE APPS SCRIPT DATABASE RESMI — SDN SUMBEREJO 04 AMBULU
 * Terhubung dengan Admin Panel CMS & Website Publik
 * =======================================================================
 * 
 * PETUNJUK PEMASANGAN:
 * 1. Buka Google Spreadsheet baru (atau yang sudah ada).
 * 2. Klik menu 'Ekstensi' (Extensions) -> 'Apps Script'.
 * 3. Hapus semua kode bawaan, lalu salin dan tempel (paste) seluruh skrip ini.
 * 4. Klik tombol 'Terapkan' (Deploy) di kanan atas -> 'Penerapan Baru' (New Deployment).
 * 5. Pilih jenis: 'Aplikasi Web' (Web App).
 *    - Deskripsi: SDN Sumberejo 04 Database API
 *    - Jalankan sebagai: 'Saya' (Me / Akun Google Anda)
 *    - Siapa yang memiliki akses: 'Siapa saja' (Anyone) -> PENTING!
 * 6. Klik 'Terapkan' (Deploy) dan berikan Izin Akses (Authorize Access).
 * 7. Salin URL Aplikasi Web yang berakhiran /exec.
 */

// Konfigurasi Nama Sheet & Kolom Header Resmi
const SCHEMAS = {
  Pengaturan: ["kunci", "nilai", "keterangan"],
  Pengumuman: ["id", "judul", "tanggal", "kategori", "fotoUrl", "isi", "tampil", "urutan"],
  Guru: ["id", "nama", "jabatan", "fotoUrl", "urutan", "tampil"],
  Ekstrakurikuler: ["id", "nama", "pembina", "jadwal", "deskripsi", "fotoUrl", "tampil"],
  Fasilitas: ["id", "urutan", "nama", "deskripsi", "fotoUrl", "tampil"],
  Galeri: ["id", "judul", "tanggal", "tipe", "url", "tampil"],
  Pendaftar: [
    "nomorPendaftaran",
    "waktuDaftar",
    "namaMurid",
    "nik",
    "tempatLahir",
    "tanggalLahir",
    "jenisKelamin",
    "namaOrtu",
    "hp",
    "alamat",
    "asalTk",
    "linkKk",
    "linkAkta",
    "status",
    "catatanAdmin"
  ]
};

/**
 * Otomatis membuat seluruh sheet dan format tabel jika belum ada
 */
function setupDatabaseSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  Object.keys(SCHEMAS).forEach(sheetName => {
    let sheet = ss.getSheetByName(sheetName);
    const headers = SCHEMAS[sheetName];
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    
    // Jika baris pertama kosong, buat header tabel
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#1e293b");
      headerRange.setFontColor("#ffffff");
      headerRange.setFontWeight("bold");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }
  });

  // Hapus 'Sheet1' bawaan jika kosong
  const sheet1 = ss.getSheetByName("Sheet1") || ss.getSheetByName("Sheet 1");
  if (sheet1 && ss.getSheets().length > 1 && sheet1.getLastRow() === 0) {
    try { ss.deleteSheet(sheet1); } catch (e) {}
  }
}

/**
 * Handle HTTP GET Request
 */
function doGet(e) {
  setupDatabaseSheets();
  const action = (e && e.parameter && e.parameter.action) || "getSiteBundle";

  try {
    if (action === "setup") {
      return jsonResponse({ ok: true, message: "Seluruh sheet database berhasil dibuat!" });
    }

    if (action === "getSiteBundle") {
      return jsonResponse({
        ok: true,
        data: readAllDataBundle(),
        message: "Berhasil mengambil data dari Google Sheets",
        time: new Date().toISOString()
      });
    }

    return jsonResponse({ ok: false, message: "Aksi GET '" + action + "' tidak dikenali." });
  } catch (err) {
    return jsonResponse({ ok: false, message: err.toString() });
  }
}

/**
 * Handle HTTP POST Request
 */
function doPost(e) {
  setupDatabaseSheets();
  let body = {};

  try {
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }
  } catch (err) {
    body = {};
  }

  const action = body.action || (e && e.parameter && e.parameter.action) || "";

  try {
    // 1. PUSH SELURUH BUNDLE DATA CMS KE SPREADSHEET DALAM SEKALI KLIK
    if (action === "admin_pushBundle" || action === "pushAll") {
      const bundle = body.bundle || body.data || {};
      const result = pushAllBundleToSheets(bundle);
      return jsonResponse({
        ok: true,
        message: "Seluruh data CMS berhasil ditulis ke Google Sheets!",
        details: result
      });
    }

    // 2. SIMPAN PENGATURAN / KONTEN SEKOLAH
    if (action === "admin_saveKonten") {
      const items = Array.isArray(body.items) ? body.items : [];
      saveSiteConfig(items);
      return jsonResponse({ ok: true, saved: items.length });
    }

    // 3. SIMPAN ATAU PERBARUI BARIS DATA (Pengumuman, Guru, Ekskul, Fasilitas, Galeri, Pendaftar)
    if (action === "admin_saveRow") {
      const sheetName = body.sheetName;
      const data = body.data || {};
      const savedId = saveOrUpdateRow(sheetName, data);
      return jsonResponse({ ok: true, id: savedId, data: data });
    }

    // 4. HAPUS BARIS DATA
    if (action === "admin_deleteRow") {
      const sheetName = body.sheetName;
      const id = body.id;
      deleteRowById(sheetName, id);
      return jsonResponse({ ok: true, deleted: id });
    }

    // 5. UBAH STATUS TAMPIL
    if (action === "admin_toggleRow") {
      const sheetName = body.sheetName;
      const id = body.id;
      const tampil = Boolean(body.tampil);
      toggleRowStatus(sheetName, id, tampil);
      return jsonResponse({ ok: true, id: id, tampil: tampil });
    }

    // 6. UPDATE VERIFIKASI PENDAFTAR SPMB
    if (action === "admin_updatePendaftar") {
      updatePendaftarStatus(body.nomorPendaftaran, body.status, body.catatanAdmin);
      return jsonResponse({ ok: true, nomorPendaftaran: body.nomorPendaftaran });
    }

    // 7. PENDAFTARAN SPMB PUBLIK
    if (action === "daftar" || action === "daftar_spmb") {
      const p = body.data || body;
      const noReg = registerSpmb(p);
      return jsonResponse({ ok: true, nomorPendaftaran: noReg });
    }

    return jsonResponse({ ok: false, message: "Aksi POST '" + action + "' tidak dikenali." });
  } catch (err) {
    return jsonResponse({ ok: false, message: err.toString() });
  }
}

/**
 * Menulis seluruh data dari CMS ke Spreadsheet (Mengisi sheet yang kosong)
 */
function pushAllBundleToSheets(bundle) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const summary = {};

  // 1. Tulis Pengaturan
  if (bundle.config && typeof bundle.config === "object") {
    const configItems = Object.entries(bundle.config).map(([k, v]) => ({ kunci: k, nilai: v }));
    saveSiteConfig(configItems);
    summary.config = configItems.length;
  }

  // 2. Tulis Koleksi
  const colMap = ["Pengumuman", "Guru", "Ekstrakurikuler", "Fasilitas", "Galeri"];
  colMap.forEach(sheetName => {
    const list = (bundle.collections && bundle.collections[sheetName]) || bundle[sheetName.toLowerCase()] || [];
    if (Array.isArray(list) && list.length > 0) {
      let sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        setupDatabaseSheets();
        sheet = ss.getSheetByName(sheetName);
      }
      
      const headers = SCHEMAS[sheetName];
      
      // Hapus data lama (pertahankan header baris 1)
      if (sheet.getLastRow() > 1) {
        sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
      }

      const rowsToWrite = list.map(item => {
        return headers.map(h => {
          let val = item[h];
          if (val === undefined || val === null) val = "";
          if (typeof val === "boolean") val = val ? "TRUE" : "FALSE";
          return String(val);
        });
      });

      if (rowsToWrite.length > 0) {
        sheet.getRange(2, 1, rowsToWrite.length, headers.length).setValues(rowsToWrite);
      }
      summary[sheetName] = rowsToWrite.length;
    }
  });

  // 3. Tulis Pendaftar jika ada
  if (Array.isArray(bundle.pendaftar) && bundle.pendaftar.length > 0) {
    const sheet = ss.getSheetByName("Pendaftar");
    const headers = SCHEMAS.Pendaftar;
    const rows = bundle.pendaftar.map(p => {
      return headers.map(h => {
        let val = p[h];
        if (val === undefined || val === null) val = "";
        return String(val);
      });
    });
    if (rows.length > 0 && sheet) {
      if (sheet.getLastRow() > 1) {
        sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
      }
      sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
      summary.Pendaftar = rows.length;
    }
  }

  return summary;
}

/**
 * Menyimpan konfigurasi ke sheet 'Pengaturan'
 */
function saveSiteConfig(items) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Pengaturan");
  if (!sheet) {
    setupDatabaseSheets();
    sheet = ss.getSheetByName("Pengaturan");
  }

  const lastRow = sheet.getLastRow();
  let existingKeys = {};

  if (lastRow > 1) {
    const range = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
    range.forEach((row, idx) => {
      if (row[0]) existingKeys[String(row[0]).trim()] = idx + 2;
    });
  }

  items.forEach(it => {
    const k = String(it.kunci || "").trim();
    const v = String(it.nilai !== undefined && it.nilai !== null ? it.nilai : "");
    if (!k) return;

    if (existingKeys[k]) {
      sheet.getRange(existingKeys[k], 2).setValue(v);
    } else {
      sheet.appendRow([k, v, ""]);
      existingKeys[k] = sheet.getLastRow();
    }
  });
}

/**
 * Simpan atau perbarui baris pada sheet koleksi
 */
function saveOrUpdateRow(sheetName, data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    setupDatabaseSheets();
    sheet = ss.getSheetByName(sheetName);
  }

  const headers = SCHEMAS[sheetName] || [];
  let rowId = data.id ? String(data.id).trim() : "";
  if (!rowId) {
    rowId = sheetName.substring(0, 3).toUpperCase() + "-" + Date.now();
    data.id = rowId;
  }

  const lastRow = sheet.getLastRow();
  let foundRowIndex = -1;

  if (lastRow > 1) {
    const idColValues = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < idColValues.length; i++) {
      if (String(idColValues[i][0]).trim() === rowId) {
        foundRowIndex = i + 2;
        break;
      }
    }
  }

  const rowValues = headers.map(h => {
    let val = data[h];
    if (val === undefined || val === null) val = "";
    if (typeof val === "boolean") val = val ? "TRUE" : "FALSE";
    return String(val);
  });

  if (foundRowIndex > 0) {
    sheet.getRange(foundRowIndex, 1, 1, headers.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }

  return rowId;
}

/**
 * Hapus baris berdasarkan ID
 */
function deleteRowById(sheetName, id) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return;

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;

  const idColValues = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let i = 0; i < idColValues.length; i++) {
    if (String(idColValues[i][0]).trim() === String(id).trim()) {
      sheet.deleteRow(i + 2);
      break;
    }
  }
}

/**
 * Toggle status tampil
 */
function toggleRowStatus(sheetName, id, tampil) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return;

  const headers = SCHEMAS[sheetName] || [];
  const tampilColIdx = headers.indexOf("tampil") + 1;
  if (tampilColIdx <= 0) return;

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;

  const idColValues = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let i = 0; i < idColValues.length; i++) {
    if (String(idColValues[i][0]).trim() === String(id).trim()) {
      sheet.getRange(i + 2, tampilColIdx).setValue(tampil ? "TRUE" : "FALSE");
      break;
    }
  }
}

/**
 * Update verifikasi pendaftar
 */
function updatePendaftarStatus(nomorPendaftaran, status, catatanAdmin) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Pendaftar");
  if (!sheet) return;

  const headers = SCHEMAS.Pendaftar;
  const statusCol = headers.indexOf("status") + 1;
  const catatanCol = headers.indexOf("catatanAdmin") + 1;

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;

  const idColValues = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let i = 0; i < idColValues.length; i++) {
    if (String(idColValues[i][0]).trim() === String(nomorPendaftaran).trim()) {
      if (status && statusCol > 0) sheet.getRange(i + 2, statusCol).setValue(status);
      if (catatanAdmin !== undefined && catatanCol > 0) sheet.getRange(i + 2, catatanCol).setValue(catatanAdmin);
      break;
    }
  }
}

/**
 * Pendaftaran baru SPMB
 */
function registerSpmb(p) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Pendaftar");
  if (!sheet) {
    setupDatabaseSheets();
    sheet = ss.getSheetByName("Pendaftar");
  }

  const d = new Date();
  const dateStr = Utilities.formatDate(d, "GMT+7", "yyyyMMdd");
  const rand = Math.floor(1000 + Math.random() * 9000);
  const noReg = p.nomorPendaftaran || ("SPMB-" + dateStr + "-" + rand);

  const waktuStr = Utilities.formatDate(d, "GMT+7", "yyyy-MM-dd HH:mm:ss");
  const headers = SCHEMAS.Pendaftar;

  const rowValues = headers.map(h => {
    if (h === "nomorPendaftaran") return noReg;
    if (h === "waktuDaftar") return waktuStr;
    if (h === "status") return "baru";
    let val = p[h];
    return val !== undefined && val !== null ? String(val) : "";
  });

  sheet.appendRow(rowValues);
  return noReg;
}

/**
 * Membaca seluruh data bundle untuk website
 */
function readAllDataBundle() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const config = {};
  const collections = {};

  // Baca Pengaturan
  const sCfg = ss.getSheetByName("Pengaturan");
  if (sCfg && sCfg.getLastRow() > 1) {
    const vals = sCfg.getRange(2, 1, sCfg.getLastRow() - 1, 2).getValues();
    vals.forEach(r => {
      if (r[0]) config[String(r[0]).trim()] = String(r[1] || "");
    });
  }

  // Baca Koleksi
  ["Pengumuman", "Guru", "Ekstrakurikuler", "Fasilitas", "Galeri"].forEach(sName => {
    const s = ss.getSheetByName(sName);
    const headers = SCHEMAS[sName];
    const items = [];
    if (s && s.getLastRow() > 1) {
      const vals = s.getRange(2, 1, s.getLastRow() - 1, headers.length).getValues();
      vals.forEach(row => {
        const item = {};
        headers.forEach((h, idx) => {
          let val = row[idx];
          if (h === "tampil") val = String(val).toUpperCase() === "TRUE";
          if (h === "urutan") val = Number(val) || 1;
          item[h] = val;
        });
        if (item.id) items.push(item);
      });
    }
    collections[sName] = items;
  });

  // Baca Pendaftar
  const sPend = ss.getSheetByName("Pendaftar");
  const pendaftar = [];
  if (sPend && sPend.getLastRow() > 1) {
    const headers = SCHEMAS.Pendaftar;
    const vals = sPend.getRange(2, 1, sPend.getLastRow() - 1, headers.length).getValues();
    vals.forEach(row => {
      const item = {};
      headers.forEach((h, idx) => {
        item[h] = String(row[idx] || "");
      });
      if (item.nomorPendaftaran) pendaftar.push(item);
    });
  }

  return {
    config: config,
    collections: collections,
    pendaftar: pendaftar
  };
}

/**
 * Helper JSON Response dengan CORS Lengkap
 */
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
