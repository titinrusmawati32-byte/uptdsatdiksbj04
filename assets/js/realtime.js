/**
 * REAL-TIME CLOUD DATABASE SYNCHRONIZER (FIREBASE FIRESTORE)
 * SDN SUMBEREJO 04 AMBULU
 * 
 * Menghubungkan Landing Page Publik ke Cloud Firestore secara REAL-TIME.
 * Setiap perubahan yang disimpan dari menu Admin CMS akan langsung
 * tampil di layar pengguna (HP, tablet, laptop) dalam hitungan milidetik
 * TANPA PERLU REFRESH HALAMAN!
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  doc,
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const FIREBASE_CONFIG = {
  projectId: "flowing-landing-p1ttq",
  appId: "1:658106437485:web:25c4a3ddaf8839d208d464",
  apiKey: "AIzaSyD1OC3GXFjNViCP5oRD8Iur7l53A10GbRA",
  authDomain: "flowing-landing-p1ttq.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-senapati-576aa692-d29b-404c-a567-79c97545d9e4",
  storageBucket: "flowing-landing-p1ttq.firebasestorage.app",
  messagingSenderId: "658106437485"
};

(function initClientRealtime() {
  try {
    const app = initializeApp(FIREBASE_CONFIG, "PublicRealtimeApp");
    const db = getFirestore(app, FIREBASE_CONFIG.firestoreDatabaseId);

    // ==========================================
    // 1. SINKRONISASI REAL-TIME: PENGATURAN SITUS & HERO SLIDER
    // ==========================================
    const configDocRef = doc(db, "settings", "site_config");
    onSnapshot(
      configDocRef,
      (docSnap) => {
        if (!docSnap.exists()) return;
        const config = docSnap.data();
        if (!config || typeof config !== "object") return;

        try {
          localStorage.setItem("sdn_site_config", JSON.stringify(config));
        } catch (e) {}

        if (typeof window.applyConfigToDom === "function") {
          window.applyConfigToDom(config);
        }
        if (typeof window.renderHeroSlider === "function") {
          window.renderHeroSlider(config);
        }
      },
      (err) => {
        console.warn("[Realtime Cloud] Listener Config fallback ke Polling:", err);
      }
    );

    // ==========================================
    // 2. SINKRONISASI REAL-TIME: PENGUMUMAN SEKOLAH
    // ==========================================
    const pengumumanColRef = collection(db, "pengumuman");
    onSnapshot(
      pengumumanColRef,
      (querySnap) => {
        if (querySnap.empty) return;
        const list = [];
        querySnap.forEach((d) => {
          const item = { id: d.id, ...d.data() };
          if (item.tampil !== false) list.push(item);
        });

        list.sort((a, b) => {
          if (a.urutan !== undefined && b.urutan !== undefined) return a.urutan - b.urutan;
          return (b.tanggal || "").localeCompare(a.tanggal || "");
        });

        try {
          localStorage.setItem("sdn_pengumuman_list", JSON.stringify(list));
        } catch (e) {}

        const container = document.getElementById("pengumumanContainer");
        if (container && typeof window.renderPengumumanCards === "function") {
          window.renderPengumumanCards(container, list);
        }
      },
      (err) => {
        console.warn("[Realtime Cloud] Listener Pengumuman fallback ke Polling:", err);
      }
    );

    // ==========================================
    // 3. SINKRONISASI REAL-TIME: DEWAN GURU & FOTO KEPALA SEKOLAH
    // ==========================================
    const guruColRef = collection(db, "guru");
    onSnapshot(
      guruColRef,
      (querySnap) => {
        if (querySnap.empty) return;
        const list = [];
        querySnap.forEach((d) => {
          const item = { id: d.id, ...d.data() };
          if (item.tampil !== false) list.push(item);
        });

        list.sort((a, b) => (a.urutan || 99) - (b.urutan || 99));

        try {
          localStorage.setItem("sdn_guru_list", JSON.stringify(list));
        } catch (e) {}

        const container = document.getElementById("guruContainer");
        if (container && typeof window.renderGuruCards === "function") {
          window.renderGuruCards(container, list);
        }
        if (typeof window.updateKepsekPhotoFromGuru === "function") {
          window.updateKepsekPhotoFromGuru(list);
        }
      },
      (err) => {
        console.warn("[Realtime Cloud] Listener Guru fallback ke Polling:", err);
      }
    );

    // ==========================================
    // 4. SINKRONISASI REAL-TIME: PROGRAM EKSTRAKURIKULER
    // ==========================================
    const ekskulColRef = collection(db, "ekskul");
    onSnapshot(
      ekskulColRef,
      (querySnap) => {
        if (querySnap.empty) return;
        const list = [];
        querySnap.forEach((d) => {
          const item = { id: d.id, ...d.data() };
          if (item.tampil !== false) list.push(item);
        });

        list.sort((a, b) => (a.urutan || 99) - (b.urutan || 99));

        try {
          localStorage.setItem("sdn_ekskul_list", JSON.stringify(list));
        } catch (e) {}

        const container = document.getElementById("ekskulContainer");
        if (container && typeof window.renderEkskulCards === "function") {
          window.renderEkskulCards(container, list);
        }
      },
      (err) => {
        console.warn("[Realtime Cloud] Listener Ekskul fallback ke Polling:", err);
      }
    );

    // ==========================================
    // 5. SINKRONISASI REAL-TIME: FASILITAS SEKOLAH
    // ==========================================
    const fasilitasColRef = collection(db, "fasilitas");
    onSnapshot(
      fasilitasColRef,
      (querySnap) => {
        if (querySnap.empty) return;
        const list = [];
        querySnap.forEach((d) => {
          const item = { id: d.id, ...d.data() };
          if (item.tampil !== false) list.push(item);
        });

        list.sort((a, b) => (a.urutan || 99) - (b.urutan || 99));

        try {
          localStorage.setItem("sdn_fasilitas_list", JSON.stringify(list));
        } catch (e) {}

        const container = document.getElementById("fasilitasContainer");
        if (container && typeof window.renderFasilitasCards === "function") {
          window.renderFasilitasCards(container, list);
        }
      },
      (err) => {
        console.warn("[Realtime Cloud] Listener Fasilitas fallback ke Polling:", err);
      }
    );

    // ==========================================
    // 6. SINKRONISASI REAL-TIME: GALERI KEGIATAN
    // ==========================================
    const galeriColRef = collection(db, "galeri");
    onSnapshot(
      galeriColRef,
      (querySnap) => {
        if (querySnap.empty) return;
        const list = [];
        querySnap.forEach((d) => {
          const item = { id: d.id, ...d.data() };
          if (item.tampil !== false) list.push(item);
        });

        list.sort((a, b) => (b.tanggal || "").localeCompare(a.tanggal || ""));

        try {
          localStorage.setItem("sdn_galeri_list", JSON.stringify(list));
        } catch (e) {}

        const container = document.getElementById("galeriContainer");
        if (container && typeof window.renderGaleriCards === "function") {
          window.renderGaleriCards(container, list);
        }
      },
      (err) => {
        console.warn("[Realtime Cloud] Listener Galeri fallback ke Polling:", err);
      }
    );

    console.log("⚡ [Realtime Cloud] Pelacak Real-Time Aktif Terhubung ke Firestore Cloud.");
  } catch (err) {
    console.warn("Inisialisasi Real-Time Firestore dialihkan ke Engine Polling:", err);
  }
})();
