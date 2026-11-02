export interface StoryChapter {
  id: string;
  indexLabel: string;
  timeBadge: string;
  kicker: string;
  title: string;
  subtitle: string;
  description: string;
  metricValue: string;
  metricLabel: string;
  highlights: string[];
  imageUrl: string;
  imageAlt: string;
  accentColor: string;
  themeMode: "day" | "emerald" | "amber" | "night";
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: "pagi-adab-literasi",
    indexLabel: "01",
    timeBadge: "06:45 – 07:30 WIB",
    kicker: "PEMBIASAAN PAGI & LITERASI",
    title: "Penyambutan Hangat & Gerakan Literasi Pagi",
    subtitle: "Senyum, sapa, salam, doa bersama, dan 15 menit membaca nyaring.",
    description:
      "Setiap pagi di halaman berkonblok segi enam SDN Sumberejo 04, dewan guru menyambut kedatangan siswa dengan budaya 5S. Sebelum pelajaran dimulai, siswa membaca buku pengayaan dan berdiskusi singkat untuk membangun fokus, kosakata, serta kegembiraan belajar.",
    metricValue: "15 Menit",
    metricLabel: "Literasi & Doa Pagi Terjadwal",
    highlights: [
      "Budaya 5S (Senyum, Salam, Sapa, Sopan, Santun) di gerbang utama",
      "Pojok Baca aktif di seluruh ruang kelas I s.d. VI",
      "Jurnal membaca harian terpantau wali kelas"
    ],
    imageUrl: "/assets/aistudio/image_65df5734.png",
    imageAlt: "Suasana Pagi Akademik di Gedung Utama SDN Sumberejo 04 Ambulu",
    accentColor: "#176C2D",
    themeMode: "day"
  },
  {
    id: "eksplorasi-sains-numerasi",
    indexLabel: "02",
    timeBadge: "07:30 – 10:30 WIB",
    kicker: "PEMBELAJARAN INTRAKURIKULER",
    title: "Eksplorasi Sains, Numerasi & Nalar Kritis",
    subtitle: "Kurikulum Nasional yang aktif, kontekstual, dan berpusat pada murid.",
    description:
      "Pembelajaran di kelas dirancang interaktif melalui pengamatan langsung, eksperimen sains sederhana, dan pemecahan masalah matematika kontekstual. Pendidik mendampingi setiap siswa sesuai kecepatan belajarnya agar potensi akademik tumbuh merata.",
    metricValue: "100%",
    metricLabel: "Kurikulum Nasional & Projek Pancasila",
    highlights: [
      "Eksperimen sains dasar & pengamatan botani di kebun sekolah",
      "Pendekatan diferensiasi ramah anak tanpa tekanan berlebih",
      "Asesmen formatif berkala untuk memantau capaian literasi-numerasi"
    ],
    imageUrl: "/assets/aistudio/image_9a6a7bd5.png",
    imageAlt: "Kegiatan Pembelajaran Aktif Siswa SDN Sumberejo 04",
    accentColor: "#1F7A4C",
    themeMode: "emerald"
  },
  {
    id: "ekologi-sekolah-hijau",
    indexLabel: "03",
    timeBadge: "10:30 – 12:00 WIB",
    kicker: "LINGKUNGAN ASRI & RAMAH ANAK",
    title: "Laboratorium Alam & Budaya Sekolah Hijau",
    subtitle: "Merawat taman apotek hidup (TOGA) dan kebersihan ekosistem kampus.",
    description:
      "Dikelilingi perbukitan hijau Desa Sumberejo, sekolah menjadi ruang belajar ekologis yang sejuk. Siswa dilibatkan langsung merawat tanaman obat keluarga, memilah sampah organik-anorganik, dan menjaga kawasan bebas perundungan.",
    metricValue: "Zona Asri",
    metricLabel: "Sekolah Ramah Anak & Taman TOGA",
    highlights: [
      "Taman Apotek Hidup (TOGA) sebagai media belajar ilmu pengetahuan alam",
      "Kawasan sekolah aman, sehat, dan bebas perundungan (anti-bullying)",
      "Pembiasaan piket kolaboratif dan kepedulian lingkungan"
    ],
    imageUrl: "/assets/aistudio/image_5c453520.png",
    imageAlt: "Lingkungan Hijau dan Taman Belajar SDN Sumberejo 04",
    accentColor: "#D99B26",
    themeMode: "amber"
  },
  {
    id: "malam-karakter-bakat",
    indexLabel: "04",
    timeBadge: "SORE & AGENDA KHUSUS",
    kicker: "KARAKTER, PRAMUKA & SENI BUDAYA",
    title: "Kemah Karakter, Pramuka & Pentas Bakat Siswa",
    subtitle: "Kemandirian, kepemimpinan, dan apresiasi seni di bawah langit Sumberejo.",
    description:
      "Melalui kegiatan ekstrakurikuler Pramuka, olahraga, seni tari, hadrah, dan agenda pembinaan karakter, siswa belajar arti kemandirian, gotong royong, serta keberanian tampil percaya diri membawa nama baik sekolah.",
    metricValue: "Aktif",
    metricLabel: "Pramuka, Olahraga, Seni & Keagamaan",
    highlights: [
      "Pembinaan Pramuka Siaga & Penggalang untuk melatih kemandirian",
      "Ekstrakurikuler seni tari tradisional, olahraga, dan keagamaan",
      "Sinergi paguyuban wali murid dalam mendukung tumbuh kembang karakter"
    ],
    imageUrl: "/assets/aistudio/image_e537deb1.png",
    imageAlt: "Suasana Malam Karakter di Kampus SDN Sumberejo 04 Ambulu",
    accentColor: "#34D399",
    themeMode: "night"
  }
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "faq-usia-syarat",
    category: "Persyaratan",
    question: "Berapa batas usia minimal pendaftaran murid baru kelas 1 di SDN Sumberejo 04?",
    answer:
      "Sesuai regulasi nasional SPMB Sekolah Dasar, prioritas utama diberikan kepada calon peserta didik berusia 7 (tujuh) tahun. Anak berusia minimal 6 (enam) tahun pada tanggal 1 Juli tahun berjalan tetap dapat mendaftar dan diterima sepanjang kuota daya tampung masih tersedia."
  },
  {
    id: "faq-biaya-sekolah",
    category: "Biaya Pendidikan",
    question: "Apakah pendaftaran SPMB dan biaya sekolah di SDN Sumberejo 04 benar-benar gratis?",
    answer:
      "Ya, 100% Gratis (Bebas Pungutan Biaya). Sebagai Sekolah Dasar Negeri di bawah naungan Pemerintah Kabupaten Jember, seluruh proses pendaftaran SPMB maupun operasional pembelajaran dasar didukung penuh oleh dana BOS tanpa memungut biaya pendaftaran."
  },
  {
    id: "faq-dokumen-online",
    category: "Alur Online",
    question: "Bagaimana jika orang tua mengalami kendala saat mengunggah dokumen KK atau Akta secara online?",
    answer:
      "Orang tua/wali dapat langsung mengisi biodata pada Formulir SPMB Online terlebih dahulu, atau datang langsung ke Posko Layanan SPMB di SDN Sumberejo 04 pada jam kerja (Senin–Jumat, 07:00–13:00 WIB). Panitia kami siap membantu pemindaian berkas secara langsung."
  },
  {
    id: "faq-program-unggul",
    category: "Kurikulum & Karakter",
    question: "Bagaimana pembagian waktu antara pelajaran akademik dan pembinaan karakter setiap harinya?",
    answer:
      "Kegiatan dimulai pukul 06:45 WIB dengan penyambutan 5S, doa pagi, hafalan surat pendek, dan 15 menit Gerakan Literasi Sekolah. Pukul 07:30–12:30 WIB difokuskan pada pembelajaran Kurikulum Nasional berbasis eksplorasi sains & numerasi, dilanjutkan pembinaan ekstrakurikuler sesuai jadwal."
  }
];

export interface ParsedCounter {
  prefix: string;
  numericValue: number | null;
  suffix: string;
}

/**
 * Parses a text string (e.g. "286", "100%", "19", "A") into prefix, numericValue, and suffix
 * so GSAP can animate numeric counters cleanly while leaving non-numeric labels untouched.
 */
export function parseCounterTarget(rawText: string): ParsedCounter {
  const trimmed = String(rawText ?? "").trim();
  const match = trimmed.match(/^([^0-9+-]*?)(-?\d+(?:\.\d+)?)(.*)$/);
  if (!match) {
    return { prefix: "", numericValue: null, suffix: trimmed };
  }
  const num = Number(match[2]);
  if (!Number.isFinite(num)) {
    return { prefix: "", numericValue: null, suffix: trimmed };
  }
  return {
    prefix: match[1] || "",
    numericValue: num,
    suffix: match[3] || ""
  };
}

/**
 * Maps normalized scroll progress [0..1] to the active storytelling chapter index [0..totalChapters-1].
 */
export function computeStoryChapterIndex(progress: number, totalChapters: number): number {
  if (totalChapters <= 1) return 0;
  const clamped = Math.max(0, Math.min(0.9999, Number.isFinite(progress) ? progress : 0));
  return Math.floor(clamped * totalChapters);
}

/**
 * Computes the quadratic bezier control point Y for the SVG section morph divider.
 */
export function computeWaveControlY(scrollProgress: number): number {
  const clamped = Math.max(0, Math.min(1, Number.isFinite(scrollProgress) ? scrollProgress : 0));
  return Math.round(6 + clamped * 80);
}

/**
 * Determines the motion tier based on viewport width and reduced-motion preference.
 */
export function getResponsiveMotionTier(
  viewportWidth: number,
  prefersReducedMotion: boolean
): "reduced" | "mobile" | "tablet" | "desktop" {
  if (prefersReducedMotion) return "reduced";
  if (viewportWidth < 768) return "mobile";
  if (viewportWidth < 1024) return "tablet";
  return "desktop";
}

export const HERO_HEADLINE_STAGGER_CONFIG = {
  duration: 0.86,
  staggerEach: 0.068,
  lineOverlapOffset: 0.14,
  initialYPercent: 102,
  initialBlurPx: 6,
  initialScale: 0.96,
  ease: "expo.out",
  staggerEase: "power2.out"
} as const;

export const HERO_STATS_ANIMATION_CONFIG = {
  duration: 0.78,
  staggerEach: 0.085,
  initialY: 22,
  initialScale: 0.96,
  initialBlurPx: 4,
  ease: "expo.out",
  scrollStart: "top 92%",
  scrollEnd: "bottom 20%"
} as const;

export function splitHeadlineWords(text: string): string[] {
  return String(text ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export const CINEMATIC_TRANSITION_CONFIG = {
  divider: {
    duration: 0.92,
    ease: "expo.out",
    initialScaleX: 0,
    finalScaleX: 1,
    initialOpacity: 0,
    finalOpacity: 1,
    transformOrigin: "center center",
    scrollStart: "top 89%",
    once: true
  },
  heading: {
    duration: 0.76,
    initialY: 26,
    delayAfterDivider: 0.12,
    staggerEach: 0.09,
    ease: "power3.out",
    scrollStart: "top 86%",
    once: true
  },
  cards: {
    duration: 0.72,
    initialY: 28,
    initialScale: 0.975,
    staggerEach: 0.085,
    ease: "power3.out",
    scrollStart: "top 86%",
    once: true
  },
  imageMask: {
    duration: 0.96,
    initialClip: "inset(0% 0% 100% 0% round 18px)",
    finalClip: "inset(0% 0% 0% 0% round 18px)",
    initialScale: 1.05,
    finalScale: 1,
    ease: "power4.out",
    scrollStart: "top 86%",
    once: true
  },
  palette: {
    navyDeep: "#0B1D35",
    navySurface: "#102847",
    goldPrimary: "#D99B26",
    goldLight: "#F3C969",
    sageCanvas: "#F4F5F1",
    whiteSurface: "#FFFFFF"
  }
} as const;

export function getSectionRevealTiming(
  tier: "reduced" | "mobile" | "tablet" | "desktop"
): {
  dividerDuration: number;
  headingDuration: number;
  cardStagger: number;
  translateY: number;
} {
  if (tier === "reduced") {
    return { dividerDuration: 0, headingDuration: 0, cardStagger: 0, translateY: 0 };
  }
  if (tier === "mobile") {
    return {
      dividerDuration: 0.68,
      headingDuration: 0.56,
      cardStagger: 0.055,
      translateY: 18
    };
  }
  if (tier === "tablet") {
    return {
      dividerDuration: 0.8,
      headingDuration: 0.66,
      cardStagger: 0.07,
      translateY: 22
    };
  }
  return {
    dividerDuration: CINEMATIC_TRANSITION_CONFIG.divider.duration,
    headingDuration: CINEMATIC_TRANSITION_CONFIG.heading.duration,
    cardStagger: CINEMATIC_TRANSITION_CONFIG.cards.staggerEach,
    translateY: CINEMATIC_TRANSITION_CONFIG.heading.initialY
  };
}

export const SECTION_DIVIDER_CONFIG = {
  duration: 0.92,
  auraDuration: 1.08,
  ease: "expo.out",
  initialScaleX: 0,
  finalScaleX: 1,
  initialOpacity: 0,
  finalOpacity: 1,
  auraOpacity: 0.45,
  transformOrigin: "center center",
  scrollStart: "top 90%",
  once: true
} as const;

export interface DividerThemeStyle {
  primaryColor: string;
  accentBorder: string;
  auraColor: string;
  gradient: string;
}

/**
 * Returns color palette and gradient configuration for the subtle gold horizontal divider.
 */
export function getDividerStyleForTheme(theme: "light" | "dark"): DividerThemeStyle {
  if (theme === "dark") {
    return {
      primaryColor: "#F3C969",
      accentBorder: "#FEF3C7",
      auraColor: "rgba(243, 201, 105, 0.45)",
      gradient:
        "linear-gradient(90deg, rgba(243, 201, 105, 0) 0%, rgba(243, 201, 105, 0.32) 16%, rgba(253, 230, 138, 0.9) 48%, #F3C969 50%, rgba(253, 230, 138, 0.9) 52%, rgba(243, 201, 105, 0.32) 84%, rgba(243, 201, 105, 0) 100%)"
    };
  }
  return {
    primaryColor: "#D99B26",
    accentBorder: "rgba(254, 243, 199, 0.8)",
    auraColor: "rgba(217, 155, 38, 0.35)",
    gradient:
      "linear-gradient(90deg, rgba(217, 155, 38, 0) 0%, rgba(217, 155, 38, 0.28) 15%, rgba(243, 201, 105, 0.82) 48%, #D99B26 50%, rgba(243, 201, 105, 0.82) 52%, rgba(217, 155, 38, 0.28) 85%, rgba(217, 155, 38, 0) 100%)"
  };
}

/**
 * Computes progressive reveal metrics (scaleX, opacity, gemScale, auraOpacity)
 * for horizontal dividers given normalized scroll progress [0..1].
 */
export function computeDividerProgressValues(
  progress: number,
  prefersReducedMotion: boolean = false
): { scaleX: number; opacity: number; gemScale: number; auraOpacity: number } {
  if (prefersReducedMotion) {
    return {
      scaleX: 1,
      opacity: 1,
      gemScale: 1,
      auraOpacity: SECTION_DIVIDER_CONFIG.auraOpacity
    };
  }
  const clamped = Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0));
  return {
    scaleX: Number(clamped.toFixed(3)),
    opacity: Number(Math.min(1, clamped * 1.25).toFixed(3)),
    gemScale: Number(Math.min(1, clamped * 1.4).toFixed(3)),
    auraOpacity: Number((clamped * SECTION_DIVIDER_CONFIG.auraOpacity).toFixed(3))
  };
}


export const PENGUMUMAN_AUTOSCROLL_CONFIG = {
  speedPxPerSecond: 185,
  mobileSpeedPxPerSecond: 115,
  tabletSpeedPxPerSecond: 135,
  minDesktopWidth: 1025,
  defaultGapPx: 28,
  defaultCardWidthPx: 380,
  swipeDistanceThresholdPx: 42,
  swipeVelocityThresholdPxPerMs: 0.32,
  snapDurationSec: 0.42,
  snapEase: "power3.out",
  touchResumeDelayMs: 1500
} as const;

/**
 * Returns whether horizontal leftward auto-motion should run across mobile, tablet, and desktop.
 */
export function shouldEnableHorizontalTrackMotion(
  cardCount: number,
  prefersReducedMotion: boolean
): boolean {
  if (prefersReducedMotion) return false;
  return Number.isFinite(cardCount) && cardCount > 1;
}

/**
 * Returns the leftward movement speed in px/second adapted to the device tier.
 */
export function getPengumumanSpeedForTier(
  tier: "reduced" | "mobile" | "tablet" | "desktop"
): number {
  if (tier === "reduced") return 0;
  if (tier === "mobile") return PENGUMUMAN_AUTOSCROLL_CONFIG.mobileSpeedPxPerSecond;
  if (tier === "tablet") return PENGUMUMAN_AUTOSCROLL_CONFIG.tabletSpeedPxPerSecond;
  return PENGUMUMAN_AUTOSCROLL_CONFIG.speedPxPerSecond;
}

export interface PengumumanTrackMetrics {
  cardCount: number;
  loopDistancePx: number;
  durationSec: number;
}

/**
 * Dynamically calculates horizontal movement bounds (loopDistancePx) and
 * constant-velocity cycle duration (durationSec) for any number of announcements.
 */
export function computePengumumanTrackMetrics(
  cardCount: number,
  cardWidthPx: number,
  gapPx: number = PENGUMUMAN_AUTOSCROLL_CONFIG.defaultGapPx,
  speedPxPerSecond: number = PENGUMUMAN_AUTOSCROLL_CONFIG.speedPxPerSecond
): PengumumanTrackMetrics {
  const safeCount = Math.max(0, Math.floor(Number.isFinite(cardCount) ? cardCount : 0));
  const safeWidth = Math.max(0, Number.isFinite(cardWidthPx) ? cardWidthPx : 0);
  const safeGap = Math.max(0, Number.isFinite(gapPx) ? gapPx : 0);
  const safeSpeed = Math.max(10, Number.isFinite(speedPxPerSecond) ? speedPxPerSecond : 195);

  if (safeCount === 0 || safeWidth === 0) {
    return { cardCount: 0, loopDistancePx: 0, durationSec: 0 };
  }

  const loopDistancePx = safeCount * (safeWidth + safeGap);
  const durationSec = Number((loopDistancePx / safeSpeed).toFixed(4));

  return {
    cardCount: safeCount,
    loopDistancePx,
    durationSec
  };
}

/**
 * Determines whether mouse-hover auto-scroll should be active (Desktop > 1024px with fine pointer only;
 * disabled on Tablet <= 1024px, HP, or whenever touch interaction is detected so touch-friendly swipe is used).
 */
export function shouldEnablePengumumanHoverAutoScroll(
  viewportWidth: number,
  hasFineHover: boolean,
  prefersReducedMotion: boolean,
  hasTouchInteraction: boolean = false
): boolean {
  if (prefersReducedMotion) return false;
  if (hasTouchInteraction) return false;
  if (!hasFineHover) return false;
  return viewportWidth >= PENGUMUMAN_AUTOSCROLL_CONFIG.minDesktopWidth;
}

/**
 * Wraps any horizontal offset into the seamless single-set cycle range (-loopDistancePx, 0]
 * so resetting to the start or resizing never jumps or flickers.
 */
export function wrapPengumumanOffset(rawOffsetPx: number, loopDistancePx: number): number {
  if (!Number.isFinite(loopDistancePx) || loopDistancePx <= 0) return 0;
  if (!Number.isFinite(rawOffsetPx) || rawOffsetPx === 0) return 0;
  const mod = rawOffsetPx % loopDistancePx;
  if (mod === 0) return 0;
  return mod > 0 ? mod - loopDistancePx : mod;
}

export interface SwipeGestureInput {
  currentIndex: number;
  totalCards: number;
  deltaX: number;
  velocityPxPerMs: number;
  cardStridePx: number;
  currentScrollLeftPx?: number;
}

/**
 * Computes the target announcement card index after a touch/pointer swipe gesture on tablet or mobile.
 * Negative deltaX indicates swiping left (advancing to the next card on the right).
 * Positive deltaX indicates swiping right (returning to the previous card on the left).
 */
export function computeSwipeTargetCardIndex(input: SwipeGestureInput): number {
  const {
    currentIndex,
    totalCards,
    deltaX,
    velocityPxPerMs,
    cardStridePx,
    currentScrollLeftPx
  } = input;

  const safeTotal = Math.max(1, Math.floor(Number.isFinite(totalCards) ? totalCards : 1));
  const clampedCurrent = Math.max(0, Math.min(safeTotal - 1, Math.floor(currentIndex || 0)));
  const safeStride = Math.max(1, Number.isFinite(cardStridePx) && cardStridePx > 0 ? cardStridePx : 320);

  const distanceThreshold = Math.min(
    PENGUMUMAN_AUTOSCROLL_CONFIG.swipeDistanceThresholdPx,
    safeStride * 0.18
  );
  const isFlick =
    Math.abs(velocityPxPerMs) >= PENGUMUMAN_AUTOSCROLL_CONFIG.swipeVelocityThresholdPxPerMs;
  const isSwipeDistance = Math.abs(deltaX) >= distanceThreshold;

  if (isFlick || isSwipeDistance) {
    // Multi-card fast swipe support if user drags across more than 1.35 cards
    const stepCount = Math.max(1, Math.round(Math.abs(deltaX) / safeStride));
    if (deltaX < 0) {
      return Math.min(safeTotal - 1, clampedCurrent + stepCount);
    }
    if (deltaX > 0) {
      return Math.max(0, clampedCurrent - stepCount);
    }
  }

  if (typeof currentScrollLeftPx === "number" && Number.isFinite(currentScrollLeftPx)) {
    return computeActiveCardIndexFromScroll(currentScrollLeftPx, safeStride, safeTotal);
  }

  return clampedCurrent;
}

/**
 * Maps current scrollLeft position to the active announcement card index [0 .. totalCards - 1].
 */
export function computeActiveCardIndexFromScroll(
  scrollLeftPx: number,
  cardStridePx: number,
  totalCards: number
): number {
  const safeTotal = Math.max(1, Math.floor(Number.isFinite(totalCards) ? totalCards : 1));
  const safeStride = Math.max(1, Number.isFinite(cardStridePx) && cardStridePx > 0 ? cardStridePx : 320);
  const safeScroll = Math.max(0, Number.isFinite(scrollLeftPx) ? scrollLeftPx : 0);
  const rawIndex = Math.round(safeScroll / safeStride);
  return Math.max(0, Math.min(safeTotal - 1, rawIndex));
}

export interface EdgeGradientOpacities {
  left: number;
  right: number;
}

/**
 * Computes the subtle semi-transparent gradient indicators' opacity for the left and right edges
 * of the Pengumuman container, providing clear visual cues for swiping availability.
 */
export function computeEdgeGradientOpacities(
  isDesktopHover: boolean,
  scrollLeft: number,
  maxScroll: number,
  totalCards: number
): EdgeGradientOpacities {
  if (totalCards <= 1) {
    return { left: 0, right: 0 };
  }
  if (isDesktopHover) {
    return { left: 0.75, right: 0.75 };
  }
  if (maxScroll <= 4) {
    return { left: 0, right: 0 };
  }
  const isAtStart = scrollLeft <= 8;
  const isAtEnd = scrollLeft >= maxScroll - 8;
  return {
    left: isAtStart ? 0 : 1,
    right: isAtEnd ? 0 : 1
  };
}

