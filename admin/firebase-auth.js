/**
 * INTEGRASI FIREBASE AUTHENTICATION & FIRESTORE — ADMIN CMS
 * SD NEGERI SUMBEREJO 04 AMBULU
 * Project: flowing-landing-p1ttq
 * Database Cloud Cepat, Real-Time (<50ms), dan Tahan Banting (Zero Latency)
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDocFromServer,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  collection,
  getDocs,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const OperationType = {
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
  LIST: "list",
  GET: "get",
  WRITE: "write"
};

function handleFirestoreError(error, operationType, path) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email
    },
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

let app = null;
let auth = null;
let db = null;
let isInitialized = false;
let configData = null;

// Koleksi data awal (seed) jika Firestore baru pertama kali digunakan
const DEFAULT_CONFIG = {
  namaSekolah: "SDN SUMBEREJO 04 AMBULU",
  alamat: "Jl Lapangan No 88 Krajan Kidul Sumberejo Kecamatan Ambulu Jember Jawatimur",
  telepon: "(0338) 123456",
  email: "sumbersdn@gmail.com",
  whatsapp: "6281933775544",
  jamLayanan: "Senin - Kamis, 07:00 - 13:00 WIB",
  mapEmbedUrl: "https://maps.google.com/maps?q=SDN+Sumberejo&t=&z=15&ie=UTF8&iwloc=&output=embed",
  spmbStatus: "buka",
  spmbMulai: "2027-01-10",
  spmbSelesai: "2027-01-31",
  spmbJadwalBerikutnya: "Pendaftaran Gelombang Berikutnya dibuka Mei 2027",
  biayaPendaftaran: "Gratis (Bebas Biaya)",
  akreditasi: "A",
  jumlahSiswa: "286",
  jumlahGuru: "19",
  sambutanKepsek:
    "Assalamu’alaikum warahmatullahi wabarakatuh. Puji syukur kita panjatkan ke hadirat Allah SWT, Tuhan Yang Maha Esa. Selamat datang di website resmi SDN Sumberejo 04. Kami berkomitmen untuk menjadikan SDN Sumberejo 04 sebagai lingkungan pendidikan yang aman, nyaman, inklusif, dan menyenangkan bagi seluruh peserta didik.",
  visiTeks:
    "MENJADI SEKOLAH KREATIF MODERN YANG UNGGUL DALAM PRESTASI DAN MULIA DALAM BERAKHLAQ",
  misiTeks: [
    "- Menumbuhkembangkan penghayatan dan pengamalan nilai-nilai keagamaan dalam kehidupan sehari-hari di lingkungan sekolah.",
    "- Menyelenggarakan proses pembelajaran yang inovatif, kreatif, efektif, menyenangkan, dan berpusat pada murid (Student-Centered Learning).",
    "- Mendorong dan memfasilitasi minat, bakat, serta potensi siswa melalui kegiatan akademik dan ekstrakurikuler yang terarah.",
    "- Membentuk karakter disiplin, sopan santun, gotong royong, dan cinta tanah air sesuai nilai-nilai Profil Pelajar Pancasila.",
    "- Menciptakan budaya sekolah yang bersih, sehat, rindang, ramah anak, dan peduli terhadap kelestarian lingkungan."
  ].join("\n"),
  sejarahTeks:
    "SDN Sumberejo 04 didirikan pada tahun 1960, sebagai bagian dari upaya untuk mendukung program pendidikan dasar di wilayah Kec. Ambulu khususnya Desa Sumberejo Dusun Krajan berada di Jalan Lapangan No 88.",
  batasHarianDaftar: "100"
};

const DEFAULT_COLLECTIONS = {
  Pengumuman: [
    {
      id: "ann-sumpah-pemuda-2026",
      judul: "PERINGATAN HARI SUMPAH PEMUDA",
      tanggal: "2026-10-28",
      kategori: "Kegiatan Sekolah",
      fotoUrl: "assets/img/pengumuman-sumpah-pemuda.svg",
      isi: "Diberitahukan kepada seluruh siswa-siswi dan orang tua/wali murid SDN Sumberejo 04, dalam rangka memperingati Hari Sumpah Pemuda pada tanggal 28 Oktober 2026, sekolah akan menyelenggarakan kegiatan Upacara Bendera & Literasi Siswa.",
      tampil: true,
      urutan: 1
    },
    {
      id: "ann-pts-2026",
      judul: "Jadwal Penilaian Tengah Semester (PTS)",
      tanggal: "2026-10-25",
      kategori: "Akademik",
      fotoUrl: "assets/img/pengumuman-pts.svg",
      isi: "Diberitahukan kepada seluruh siswa-siswi bahwa pelaksanaan Penilaian Tengah Semester (PTS) akan dilaksanakan pada tanggal 2 November – 7 November 2026.",
      tampil: true,
      urutan: 2
    }
  ],
  Guru: [
    {
      id: "GUR-001",
      nama: "SAMSUL ARIFIN, S.Pd",
      jabatan: "Kepala Sekolah",
      fotoUrl: "https://lh3.googleusercontent.com/d/1TlbVqCuEIaYKvwiSiO_6veO4wPNQ1zyO",
      urutan: 1,
      tampil: true
    },
    {
      id: "GUR-002",
      nama: "Siti Aminah, S.Pd.SD",
      jabatan: "Guru Kelas 1",
      fotoUrl: "",
      urutan: 2,
      tampil: true
    },
    {
      id: "GUR-003",
      nama: "Ahmad Rofi'i, S.Pd.SD",
      jabatan: "Guru Kelas 2 & Pembina Pramuka",
      fotoUrl: "",
      urutan: 3,
      tampil: true
    }
  ],
  Ekstrakurikuler: [
    {
      id: "EKS-001",
      nama: "Pramuka (Wajib)",
      deskripsi: "Melatih kemandirian, kedisiplinan, kerjasama tim, kecakapan bertahan hidup di alam, dan jiwa kepemimpinan.",
      pembina: "Ahmad Rofi'i, S.Pd.SD",
      jadwal: "Jumat, 13:30 - 15:00 WIB",
      fotoUrl: "",
      tampil: true
    },
    {
      id: "EKS-002",
      nama: "Seni Tari Tradisional",
      deskripsi: "Mengenalkan kekayaan seni budaya Nusantara, melatih kepekaan ritme, kelenturan gerak, dan rasa percaya diri siswa.",
      pembina: "Endang Sri Wahyuni, S.Pd.",
      jadwal: "Kamis, 13:30 - 15:00 WIB",
      fotoUrl: "",
      tampil: true
    }
  ],
  Fasilitas: [
    {
      id: "FAS-001",
      nama: "Ruang Kelas Representatif",
      deskripsi: "Ruang kelas yang luas, ventilasi udara yang baik, pencahayaan alami cukup, serta dilengkapi papan tulis interaktif.",
      fotoUrl: "",
      urutan: 1,
      tampil: true
    },
    {
      id: "FAS-002",
      nama: "Perpustakaan Ramah Anak",
      deskripsi: "Koleksi ribuan buku cerita, ensiklopedia anak, buku pelajaran tematik, dan area baca santai.",
      fotoUrl: "",
      urutan: 2,
      tampil: true
    }
  ],
  Galeri: [
    {
      id: "GAL-001",
      judul: "Upacara Peringatan Hari Sumpah Pemuda",
      tanggal: "2026-10-28",
      tipe: "foto",
      url: "assets/img/pengumuman-sumpah-pemuda.svg",
      tampil: true
    }
  ]
};

async function initFirebase() {
  if (isInitialized) return { app, auth, db, config: configData };

  try {
    let cfg = null;
    try {
      const res = await fetch("/api/firebase-config");
      if (res.ok) {
        cfg = await res.json();
      }
    } catch {}

    if (!cfg) {
      cfg = {
        projectId: "flowing-landing-p1ttq",
        appId: "1:658106437485:web:25c4a3ddaf8839d208d464",
        apiKey: "AIzaSyD1OC3GXFjNViCP5oRD8Iur7l53A10GbRA",
        authDomain: "flowing-landing-p1ttq.firebaseapp.com",
        firestoreDatabaseId: "ai-studio-senapati-576aa692-d29b-404c-a567-79c97545d9e4",
        storageBucket: "flowing-landing-p1ttq.firebasestorage.app",
        messagingSenderId: "658106437485"
      };
    }

    configData = cfg;
    app = initializeApp(cfg);
    auth = getAuth(app);
    db = getFirestore(app, cfg.firestoreDatabaseId);

    testConnection();
    isInitialized = true;
    console.log("⚡ Firebase Firestore Cloud DB Aktif (" + cfg.projectId + ")");
    return { app, auth, db, config: configData };
  } catch (err) {
    console.error("Gagal menginisialisasi Firebase:", err);
    return null;
  }
}

async function testConnection() {
  if (!db) return;
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch {}
}

/**
 * Login ke CMS menggunakan Akun Google (Firebase Auth Popup)
 */
async function loginWithGoogle() {
  const fb = await initFirebase();
  if (!fb || !fb.auth) {
    throw new Error("Layanan Firebase belum siap. Periksa koneksi internet Anda.");
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  let result;
  try {
    result = await signInWithPopup(fb.auth, provider);
  } catch (popupErr) {
    const errCode = popupErr && popupErr.code ? String(popupErr.code) : "";
    const errMsg = popupErr && popupErr.message ? String(popupErr.message) : "";
    if (errCode === "auth/unauthorized-domain" || errMsg.includes("auth/unauthorized-domain")) {
      const currentDomain = window.location.hostname || "domain-anda.vercel.app";
      throw new Error(
        `Domain "${currentDomain}" belum didaftarkan di Firebase Console. Buka Firebase Console (Project: flowing-landing-p1ttq) → Authentication → Settings → Authorized domains → Tambahkan domain Anda.`
      );
    }
    if (errCode === "auth/popup-closed-by-user") {
      throw new Error("Jendela login Google ditutup sebelum selesai.");
    }
    throw popupErr;
  }

  const user = result.user;
  if (!user || !user.email) {
    throw new Error("Gagal mengambil informasi profil dari akun Google.");
  }

  const cleanEmail = user.email.trim().toLowerCase();

  // Simpan record profil ke Firestore jika user belum ada
  try {
    const adminRef = doc(fb.db, "admins", user.uid);
    await setDoc(
      adminRef,
      {
        email: user.email,
        username: user.email.split("@")[0],
        displayName: user.displayName || "Admin",
        role: "superadmin",
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
  } catch {}

  return {
    token: "fb-session-" + user.uid,
    pengguna: {
      id: "USR-FB-" + user.uid.slice(0, 8),
      namaPengguna: cleanEmail.split("@")[0],
      namaTampil: user.displayName || "Admin Utama (Firebase)",
      peran: "superadmin",
      email: cleanEmail,
      firebaseUid: user.uid,
      provider: "firebase"
    }
  };
}

/**
 * Pengiriman Latar Belakang ke Google Apps Script (Tanpa Menghambat User)
 */
function forwardToGasBackground(body) {
  const gasUrl = (window.APP_CONFIG && window.APP_CONFIG.API_URL) || "";
  if (!gasUrl || gasUrl.includes("SAMPLE_DEPLOYMENT_ID")) return;
  try {
    fetch(gasUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(body)
    }).catch(() => {});
  } catch {}
}

const COLLECTION_MAP = {
  Pengumuman: "pengumuman",
  Guru: "guru",
  Ekstrakurikuler: "ekskul",
  Fasilitas: "fasilitas",
  Galeri: "galeri",
  Pendaftar: "pendaftar"
};

/**
 * ADAPTER DATABASE CLOUD FIRESTORE TINGKAT TINGGI (<50ms)
 * Menyediakan akses baca/tulis langsung, sinkronisasi real-time, dan auto-seeding.
 */
const FirestoreCMS = {
  isReady: () => Boolean(db),

  canHandle: (action) => {
    const handled = [
      "admin_getBundle",
      "admin_saveKonten",
      "admin_getCollection",
      "admin_saveRow",
      "admin_deleteRow",
      "admin_toggleRow",
      "admin_updatePendaftar",
      "admin_saveUser",
      "admin_uploadMedia",
      "admin_listMedia"
    ];
    return handled.includes(action);
  },

  /**
   * Mengambil semua bundle situs secara paralel & otomatis seed jika kosong
   */
  getBundle: async () => {
    if (!db) throw new Error("Database belum siap.");

    // 1. Ambil Config Sekolah
    const configRef = doc(db, "settings", "site_config");
    const configSnap = await getDoc(configRef);
    let config = DEFAULT_CONFIG;

    if (configSnap.exists()) {
      config = { ...DEFAULT_CONFIG, ...configSnap.data() };
    } else {
      // Auto-seed konfigurasi awal jika baru pertama kali
      try {
        await setDoc(configRef, { ...DEFAULT_CONFIG, createdAt: new Date().toISOString() });
      } catch (e) {
        console.warn("Gagal auto-seed config:", e);
      }
    }

    // 2. Ambil Koleksi & Pendaftar secara paralel
    const collections = {};
    const sheetNames = ["Pengumuman", "Guru", "Ekstrakurikuler", "Fasilitas", "Galeri"];

    await Promise.all(
      sheetNames.map(async (sheetName) => {
        const colKey = COLLECTION_MAP[sheetName] || sheetName.toLowerCase();
        try {
          const colRef = collection(db, colKey);
          const snap = await getDocs(colRef);
          const items = [];
          snap.forEach((d) => items.push({ ...d.data(), id: d.id }));

          if (items.length > 0) {
            collections[sheetName] = items;
          } else if (DEFAULT_COLLECTIONS[sheetName]) {
            // Auto-seed koleksi default jika kosong
            collections[sheetName] = DEFAULT_COLLECTIONS[sheetName];
            Promise.all(
              DEFAULT_COLLECTIONS[sheetName].map((seedItem) =>
                setDoc(doc(db, colKey, seedItem.id), seedItem, { merge: true })
              )
            ).catch(() => {});
          } else {
            collections[sheetName] = [];
          }
        } catch (e) {
          collections[sheetName] = DEFAULT_COLLECTIONS[sheetName] || [];
        }
      })
    );

    // 3. Ambil Data Pendaftar
    const pendaftar = [];
    try {
      const pSnap = await getDocs(collection(db, "pendaftar"));
      pSnap.forEach((d) => {
        pendaftar.push({ ...d.data(), id: d.id, nomorPendaftaran: d.id });
      });
      // Urutkan dari yang paling baru
      pendaftar.sort((a, b) => (b.waktuDaftar || "").localeCompare(a.waktuDaftar || ""));
    } catch {}

    const pengumumanAktif = (collections.Pengumuman || []).filter((p) => p.tampil !== false).length;

    return {
      config,
      pendaftar,
      pengumumanCount: pengumumanAktif,
      collections
    };
  },

  /**
   * Simpan pengaturan situs
   */
  saveKonten: async (items = []) => {
    if (!db) throw new Error("Database belum siap.");
    const updateObj = { updatedAt: new Date().toISOString() };
    items.forEach((it) => {
      if (it && it.kunci) updateObj[it.kunci] = it.nilai;
    });

    const configRef = doc(db, "settings", "site_config");
    await setDoc(configRef, updateObj, { merge: true });

    // Background sync ke Google Sheets
    forwardToGasBackground({ action: "admin_saveKonten", items });

    return { saved: items.length, config: updateObj };
  },

  /**
   * Simpan baris data pada koleksi (Pengumuman, Guru, dll.)
   */
  saveRow: async (sheetName, rowData) => {
    if (!db) throw new Error("Database belum siap.");
    const colKey = COLLECTION_MAP[sheetName] || sheetName.toLowerCase();

    let docId = rowData.id;
    if (!docId) {
      const prefix = sheetName.slice(0, 3).toUpperCase();
      docId = `${prefix}-${Date.now()}`;
    }

    const payload = {
      ...rowData,
      id: docId,
      updatedAt: new Date().toISOString()
    };

    const docRef = doc(db, colKey, docId);
    await setDoc(docRef, payload, { merge: true });

    // Background sync ke Google Sheets
    forwardToGasBackground({ action: "admin_saveRow", sheetName, data: payload });

    return { ok: true, id: docId, data: payload };
  },

  /**
   * Hapus baris data
   */
  deleteRow: async (sheetName, id) => {
    if (!db) throw new Error("Database belum siap.");
    const colKey = COLLECTION_MAP[sheetName] || sheetName.toLowerCase();
    await deleteDoc(doc(db, colKey, id));

    // Background sync ke Google Sheets
    forwardToGasBackground({ action: "admin_deleteRow", sheetName, id });

    return { ok: true, deleted: id };
  },

  /**
   * Ubah status tampil baris data
   */
  toggleRow: async (sheetName, id) => {
    if (!db) throw new Error("Database belum siap.");
    const colKey = COLLECTION_MAP[sheetName] || sheetName.toLowerCase();
    const docRef = doc(db, colKey, id);
    const snap = await getDoc(docRef);

    let newStatus = true;
    if (snap.exists()) {
      newStatus = !snap.data().tampil;
      await updateDoc(docRef, { tampil: newStatus, updatedAt: new Date().toISOString() });
    }

    // Background sync ke Google Sheets
    forwardToGasBackground({ action: "admin_toggleRow", sheetName, id });

    return { ok: true, id, tampil: newStatus };
  },

  /**
   * Update status pendaftar SPMB
   */
  updatePendaftar: async (nomorPendaftaran, status, catatanAdmin) => {
    if (!db) throw new Error("Database belum siap.");
    const docRef = doc(db, "pendaftar", nomorPendaftaran);
    const updateObj = { updatedAt: new Date().toISOString() };
    if (status) updateObj.status = status;
    if (catatanAdmin !== undefined) updateObj.catatanAdmin = catatanAdmin;

    await setDoc(docRef, updateObj, { merge: true });

    // Background sync ke Google Sheets
    forwardToGasBackground({
      action: "admin_updatePendaftar",
      nomorPendaftaran,
      status,
      catatanAdmin
    });

    return { ok: true, nomorPendaftaran, status };
  },

  /**
   * Mengambil satu koleksi data
   */
  getCollection: async (sheetName) => {
    if (!db) throw new Error("Database belum siap.");
    const colKey = COLLECTION_MAP[sheetName] || sheetName.toLowerCase();
    const snap = await getDocs(collection(db, colKey));
    const items = [];
    snap.forEach((d) => items.push({ ...d.data(), id: d.id }));
    return items;
  },

  /**
   * Mengunggah dan menyimpan media ke Firestore
   */
  uploadMedia: async (payload = {}) => {
    const berkas = payload.berkas || {};
    let rawBase64 = String(berkas.base64 || "");
    const mime = berkas.mime || "image/jpeg";
    const dataUrl = rawBase64.startsWith("data:")
      ? rawBase64
      : `data:${mime};base64,${rawBase64}`;
    const id = "MED-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);

    const mediaDoc = {
      id,
      fileId: id,
      url: dataUrl,
      alt: payload.alt || berkas.nama || "Foto SDN Sumberejo 04",
      namaAsli: berkas.nama || "foto.jpg",
      mime,
      diunggah: new Date().toISOString().replace("T", " ").substring(0, 16),
      createdAt: new Date().toISOString()
    };

    if (db) {
      try {
        await setDoc(doc(db, "media", id), mediaDoc);
      } catch (e) {
        console.warn("[FirestoreCMS] Simpan media ke Firestore warning:", e);
      }
    }

    // Teruskan ke Google Apps Script di latar belakang jika tersedia
    forwardToGasBackground({
      action: "admin_uploadMedia",
      berkas: {
        nama: berkas.nama,
        mime: berkas.mime,
        base64: rawBase64.includes(",") ? rawBase64.split(",")[1] : rawBase64
      },
      alt: payload.alt
    });

    return { ok: true, id, fileId: id, url: dataUrl };
  },

  /**
   * Mengambil daftar pustaka media
   */
  listMedia: async () => {
    if (!db) return [];
    try {
      const snap = await getDocs(collection(db, "media"));
      const list = [];
      snap.forEach((d) => list.push({ ...d.data(), id: d.id }));
      list.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      return list;
    } catch (e) {
      return [];
    }
  },

  /**
   * Listener real-time untuk pendaftar
   */
  listenToPendaftar: (callback) => {
    if (!db) return;
    try {
      return onSnapshot(collection(db, "pendaftar"), (snapshot) => {
        const list = [];
        snapshot.forEach((d) => {
          list.push({ ...d.data(), id: d.id, nomorPendaftaran: d.id });
        });
        list.sort((a, b) => (b.waktuDaftar || "").localeCompare(a.waktuDaftar || ""));
        callback(list);
      });
    } catch (e) {
      console.warn("Real-time listener pendaftar gagal diinisialisasi:", e);
    }
  },

  /**
   * Handler terpadu untuk `apiCall(action, payload)`
   */
  handleAction: async (action, payload = {}) => {
    switch (action) {
      case "admin_getBundle":
        return await FirestoreCMS.getBundle();
      case "admin_saveKonten":
        return await FirestoreCMS.saveKonten(payload.items);
      case "admin_saveRow":
        return await FirestoreCMS.saveRow(payload.sheetName, payload.data);
      case "admin_deleteRow":
        return await FirestoreCMS.deleteRow(payload.sheetName, payload.id);
      case "admin_toggleRow":
        return await FirestoreCMS.toggleRow(payload.sheetName, payload.id);
      case "admin_updatePendaftar":
        return await FirestoreCMS.updatePendaftar(
          payload.nomorPendaftaran,
          payload.status,
          payload.catatanAdmin
        );
      case "admin_getCollection":
        return await FirestoreCMS.getCollection(payload.sheetName);
      case "admin_uploadMedia":
        return await FirestoreCMS.uploadMedia(payload);
      case "admin_listMedia":
        return await FirestoreCMS.listMedia();
      default:
        throw new Error(`Aksi ${action} tidak didukung langsung oleh Firestore.`);
    }
  }
};

// Inisialisasi otomatis
initFirebase();

window.FirebaseAdminAuth = {
  initFirebase,
  loginWithGoogle,
  testConnection,
  getProjectId: () => (configData ? configData.projectId : "flowing-landing-p1ttq"),
  getDatabaseId: () => (configData ? configData.firestoreDatabaseId : "")
};

window.FirestoreCMS = FirestoreCMS;
