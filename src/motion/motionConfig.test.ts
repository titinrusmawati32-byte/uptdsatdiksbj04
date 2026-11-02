import test from "node:test";
import assert from "node:assert/strict";
import {
  STORY_CHAPTERS,
  FAQ_ITEMS,
  HERO_HEADLINE_STAGGER_CONFIG,
  HERO_STATS_ANIMATION_CONFIG,
  CINEMATIC_TRANSITION_CONFIG,
  parseCounterTarget,
  computeStoryChapterIndex,
  computeWaveControlY,
  getResponsiveMotionTier,
  splitHeadlineWords,
  getSectionRevealTiming,
  computePengumumanTrackMetrics,
  shouldEnablePengumumanHoverAutoScroll,
  wrapPengumumanOffset,
  computeSwipeTargetCardIndex,
  computeActiveCardIndexFromScroll,
  computeEdgeGradientOpacities,
  shouldEnableHorizontalTrackMotion,
  getPengumumanSpeedForTier,
  SECTION_DIVIDER_CONFIG,
  getDividerStyleForTheme,
  computeDividerProgressValues
} from "./motionConfig";

test("parseCounterTarget extracts numeric values and preserves non-numeric grades", () => {
  assert.deepEqual(parseCounterTarget("286"), {
    prefix: "",
    numericValue: 286,
    suffix: ""
  });
  assert.deepEqual(parseCounterTarget("100%"), {
    prefix: "",
    numericValue: 100,
    suffix: "%"
  });
  assert.deepEqual(parseCounterTarget("A"), {
    prefix: "",
    numericValue: null,
    suffix: "A"
  });
});

test("computeStoryChapterIndex maps scroll progress accurately across 4 chapters", () => {
  assert.equal(computeStoryChapterIndex(0, 4), 0);
  assert.equal(computeStoryChapterIndex(0.24, 4), 0);
  assert.equal(computeStoryChapterIndex(0.26, 4), 1);
  assert.equal(computeStoryChapterIndex(0.55, 4), 2);
  assert.equal(computeStoryChapterIndex(0.88, 4), 3);
  assert.equal(computeStoryChapterIndex(1.0, 4), 3);
  assert.equal(computeStoryChapterIndex(-0.5, 4), 0);
});

test("computeWaveControlY interpolates SVG wave arch control point smoothly", () => {
  assert.equal(computeWaveControlY(0), 6);
  assert.equal(computeWaveControlY(0.5), 46);
  assert.equal(computeWaveControlY(1), 86);
});

test("getResponsiveMotionTier respects prefers-reduced-motion and breakpoints", () => {
  assert.equal(getResponsiveMotionTier(1440, true), "reduced");
  assert.equal(getResponsiveMotionTier(390, false), "mobile");
  assert.equal(getResponsiveMotionTier(820, false), "tablet");
  assert.equal(getResponsiveMotionTier(1440, false), "desktop");
});

test("STORY_CHAPTERS and FAQ_ITEMS contain complete content for SDN Sumberejo 04", () => {
  assert.equal(STORY_CHAPTERS.length, 4);
  assert.equal(STORY_CHAPTERS[0].imageUrl, "/assets/aistudio/image_65df5734.png");
  assert.equal(STORY_CHAPTERS[3].imageUrl, "/assets/aistudio/image_e537deb1.png");
  assert.equal(FAQ_ITEMS.length, 4);
});

test("splitHeadlineWords and hero GSAP stagger configs provide smooth timing parameters", () => {
  assert.deepEqual(splitHeadlineWords("  Cerdas   di kelas. "), ["Cerdas", "di", "kelas."]);
  assert.deepEqual(splitHeadlineWords("Santun di masyarakat."), ["Santun", "di", "masyarakat."]);
  assert.equal(HERO_HEADLINE_STAGGER_CONFIG.ease, "expo.out");
  assert.equal(HERO_STATS_ANIMATION_CONFIG.ease, "expo.out");
  assert.ok(HERO_STATS_ANIMATION_CONFIG.staggerEach > 0);
});

test("CINEMATIC_TRANSITION_CONFIG and getSectionRevealTiming enforce center-out gold divider and once-only scroll behavior", () => {
  assert.equal(CINEMATIC_TRANSITION_CONFIG.divider.transformOrigin, "center center");
  assert.equal(CINEMATIC_TRANSITION_CONFIG.divider.once, true);
  assert.equal(CINEMATIC_TRANSITION_CONFIG.heading.once, true);
  assert.equal(CINEMATIC_TRANSITION_CONFIG.cards.once, true);
  assert.equal(CINEMATIC_TRANSITION_CONFIG.imageMask.once, true);

  const desktopTiming = getSectionRevealTiming("desktop");
  const mobileTiming = getSectionRevealTiming("mobile");
  const reducedTiming = getSectionRevealTiming("reduced");

  assert.ok(desktopTiming.dividerDuration > mobileTiming.dividerDuration);
  assert.equal(reducedTiming.dividerDuration, 0);
});

test("computePengumumanTrackMetrics scales dynamically when announcement count increases while keeping constant speed", () => {
  const m3 = computePengumumanTrackMetrics(3, 372, 28, 200);
  const m5 = computePengumumanTrackMetrics(5, 372, 28, 200);

  assert.equal(m3.loopDistancePx, 1200);
  assert.equal(m3.durationSec, 6);
  assert.equal(m5.loopDistancePx, 2000);
  assert.equal(m5.durationSec, 10);
  assert.equal(m3.loopDistancePx / m3.durationSec, m5.loopDistancePx / m5.durationSec);
});

test("shouldEnablePengumumanHoverAutoScroll replaces hover auto-scroll with touch-swipe on tablet, mobile, and touch interactions", () => {
  assert.equal(shouldEnablePengumumanHoverAutoScroll(1440, true, false, false), true);
  assert.equal(shouldEnablePengumumanHoverAutoScroll(1440, true, false, true), false);
  assert.equal(shouldEnablePengumumanHoverAutoScroll(1024, true, false, false), false);
  assert.equal(shouldEnablePengumumanHoverAutoScroll(768, true, false, false), false);
  assert.equal(shouldEnablePengumumanHoverAutoScroll(390, false, false, false), false);
  assert.equal(shouldEnablePengumumanHoverAutoScroll(1440, true, true, false), false);
});

test("wrapPengumumanOffset wraps seamless loop position back to 0 at cycle boundary", () => {
  assert.equal(wrapPengumumanOffset(0, 1200), 0);
  assert.equal(wrapPengumumanOffset(-450, 1200), -450);
  assert.equal(wrapPengumumanOffset(-1200, 1200), 0);
  assert.equal(wrapPengumumanOffset(-1350, 1200), -150);
});

test("computeSwipeTargetCardIndex and computeActiveCardIndexFromScroll handle touch swipe gestures accurately", () => {
  // Swiping left (negative deltaX) advances from card 0 -> card 1
  assert.equal(
    computeSwipeTargetCardIndex({
      currentIndex: 0,
      totalCards: 4,
      deltaX: -85,
      velocityPxPerMs: -0.45,
      cardStridePx: 340
    }),
    1
  );

  // Swiping right (positive deltaX) returns from card 2 -> card 1
  assert.equal(
    computeSwipeTargetCardIndex({
      currentIndex: 2,
      totalCards: 4,
      deltaX: 90,
      velocityPxPerMs: 0.4,
      cardStridePx: 340
    }),
    1
  );

  // Clamps at bounds (0 and totalCards - 1)
  assert.equal(
    computeSwipeTargetCardIndex({
      currentIndex: 0,
      totalCards: 4,
      deltaX: 120,
      velocityPxPerMs: 0.5,
      cardStridePx: 340
    }),
    0
  );
  assert.equal(
    computeSwipeTargetCardIndex({
      currentIndex: 3,
      totalCards: 4,
      deltaX: -120,
      velocityPxPerMs: -0.5,
      cardStridePx: 340
    }),
    3
  );

  // Small tap / micro-movement stays on current card
  assert.equal(
    computeSwipeTargetCardIndex({
      currentIndex: 1,
      totalCards: 4,
      deltaX: -6,
      velocityPxPerMs: -0.04,
      cardStridePx: 340
    }),
    1
  );

  // Active card index from scrollLeft
  assert.equal(computeActiveCardIndexFromScroll(0, 340, 4), 0);
  assert.equal(computeActiveCardIndexFromScroll(330, 340, 4), 1);
  assert.equal(computeActiveCardIndexFromScroll(680, 340, 4), 2);
});

test("computeEdgeGradientOpacities provides accurate visual cue opacities for start, middle, end, and hover loop", () => {
  // Single card: no gradients
  assert.deepEqual(computeEdgeGradientOpacities(false, 0, 0, 1), { left: 0, right: 0 });

  // Desktop hover loop mode: subtle semi-transparent gradient on both edges
  assert.deepEqual(computeEdgeGradientOpacities(true, 100, 1000, 4), { left: 0.75, right: 0.75 });

  // Mobile/Tablet at start (scrollLeft: 0): left is 0 (no content to the left), right is 1 (content available to swipe!)
  assert.deepEqual(computeEdgeGradientOpacities(false, 0, 800, 4), { left: 0, right: 1 });

  // Mobile/Tablet in middle (e.g. scrollLeft: 260): both edges are 1
  assert.deepEqual(computeEdgeGradientOpacities(false, 260, 800, 4), { left: 1, right: 1 });

  // Mobile/Tablet at end (scrollLeft: 800): left is 1, right is 0 (no more content to the right)
  assert.deepEqual(computeEdgeGradientOpacities(false, 800, 800, 4), { left: 1, right: 0 });
});

test("shouldEnableHorizontalTrackMotion and getPengumumanSpeedForTier support horizontal leftward motion across mobile and tablet", () => {
  // Enables horizontal motion for > 1 cards on all devices without reduced motion
  assert.equal(shouldEnableHorizontalTrackMotion(4, false), true);
  assert.equal(shouldEnableHorizontalTrackMotion(1, false), false);
  assert.equal(shouldEnableHorizontalTrackMotion(4, true), false);

  // Speed is tuned comfortably per tier
  assert.equal(getPengumumanSpeedForTier("reduced"), 0);
  assert.equal(getPengumumanSpeedForTier("mobile"), 115);
  assert.equal(getPengumumanSpeedForTier("tablet"), 135);
  assert.equal(getPengumumanSpeedForTier("desktop"), 185);
});
