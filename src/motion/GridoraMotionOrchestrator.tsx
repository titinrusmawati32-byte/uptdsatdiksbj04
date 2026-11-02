import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  HERO_HEADLINE_STAGGER_CONFIG,
  HERO_STATS_ANIMATION_CONFIG,
  CINEMATIC_TRANSITION_CONFIG,
  parseCounterTarget,
  computeWaveControlY,
  splitHeadlineWords,
  getResponsiveMotionTier,
  getSectionRevealTiming
} from "./motionConfig";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Helper to split an element's text into word spans for GSAP staggered text reveal
 * while keeping its text accessible and re-splittable when hero mode changes.
 */
function splitElementIntoWords(el: HTMLElement | null, textOverride?: string): HTMLElement[] {
  if (!el) return [];
  const raw = (textOverride !== undefined ? textOverride : el.textContent || "").trim();
  const words = splitHeadlineWords(raw);
  if (!words.length) return [];
  el.innerHTML = words
    .map(
      (w) =>
        `<span class="gsap-word-mask"><span class="gsap-word-inner">${w}</span></span>`
    )
    .join(" ");
  return Array.from(el.querySelectorAll<HTMLElement>(".gsap-word-inner"));
}

export const GridoraMotionOrchestrator: React.FC = () => {
  const scopeRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      scopeRef.current = document.body;
      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 1024px)",
          isTablet: "(min-width: 768px) and (max-width: 1023px)",
          isMobile: "(max-width: 767px)",
          reduceMotion: "(prefers-reduced-motion: reduce)"
        },
        (context) => {
          const { isDesktop, isTablet, reduceMotion } = context.conditions as {
            isDesktop: boolean;
            isTablet: boolean;
            isMobile: boolean;
            reduceMotion: boolean;
          };

          const cleanups: Array<() => void> = [];

          // =========================================================================
          // 1. HERO ENTRANCE (SEQUENTIAL TIMELINE + CLIP-PATH + STAGGER TEXT + PARALLAX)
          // =========================================================================
          const heroSection = document.getElementById("beranda");
          const heroCanvas = document.getElementById("heroPavilionWrap");
          const headlinePrimary = document.getElementById("heroHeadlinePrimary");
          const headlineSecondary = document.getElementById("heroHeadlineSecondary");
          const switcherDock = document.getElementById("heroSwitcherDock");
          const heroCaption = document.getElementById("heroModeCaption");
          const heroCtas = gsap.utils.toArray<HTMLElement>(".gridora-hero-actions a");

          const wordsPrimary = splitElementIntoWords(headlinePrimary);
          const wordsSecondary = splitElementIntoWords(headlineSecondary);
          const allHeroWords = [...wordsPrimary, ...wordsSecondary];

          if (!reduceMotion && heroSection) {
            const heroTl = gsap.timeline({
              defaults: { ease: "power3.out" }
            });

            // Step 1: Hero image clip-path reveal + subtle scale settle
            if (heroCanvas) {
              heroTl.fromTo(
                heroCanvas,
                {
                  clipPath: "inset(6% 4% 6% 4% round 28px)",
                  scale: 1.06
                },
                {
                  clipPath: "inset(0% 0% 0% 0% round 0px)",
                  scale: 1,
                  duration: 1.05,
                  ease: "expo.out",
                  clearProps: "clipPath"
                },
                0
              );
            }

            // Step 2: Refined Line-Aware Stagger Text Reveal on Hero Headline Words
            if (wordsPrimary.length > 0) {
              heroTl.fromTo(
                wordsPrimary,
                {
                  yPercent: HERO_HEADLINE_STAGGER_CONFIG.initialYPercent,
                  opacity: 0,
                  scale: HERO_HEADLINE_STAGGER_CONFIG.initialScale,
                  filter: `blur(${HERO_HEADLINE_STAGGER_CONFIG.initialBlurPx}px)`
                },
                {
                  yPercent: 0,
                  opacity: 1,
                  scale: 1,
                  filter: "blur(0px)",
                  duration: HERO_HEADLINE_STAGGER_CONFIG.duration,
                  stagger: {
                    each: HERO_HEADLINE_STAGGER_CONFIG.staggerEach,
                    ease: HERO_HEADLINE_STAGGER_CONFIG.staggerEase
                  },
                  ease: HERO_HEADLINE_STAGGER_CONFIG.ease,
                  clearProps: "filter,transform"
                },
                0.24
              );
            }

            if (wordsSecondary.length > 0) {
              heroTl.fromTo(
                wordsSecondary,
                {
                  yPercent: HERO_HEADLINE_STAGGER_CONFIG.initialYPercent,
                  opacity: 0,
                  scale: HERO_HEADLINE_STAGGER_CONFIG.initialScale,
                  filter: `blur(${HERO_HEADLINE_STAGGER_CONFIG.initialBlurPx}px)`
                },
                {
                  yPercent: 0,
                  opacity: 1,
                  scale: 1,
                  filter: "blur(0px)",
                  duration: HERO_HEADLINE_STAGGER_CONFIG.duration,
                  stagger: {
                    each: HERO_HEADLINE_STAGGER_CONFIG.staggerEach,
                    ease: HERO_HEADLINE_STAGGER_CONFIG.staggerEase
                  },
                  ease: HERO_HEADLINE_STAGGER_CONFIG.ease,
                  clearProps: "filter,transform"
                },
                0.24 + HERO_HEADLINE_STAGGER_CONFIG.lineOverlapOffset
              );
            }

            // Step 3: Switcher Dock & Subtitle Fade-Up Sequentially
            if (switcherDock) {
              heroTl.fromTo(
                switcherDock,
                { y: 22, opacity: 0, scale: 0.96 },
                { y: 0, opacity: 1, scale: 1, duration: 0.62, ease: "expo.out" },
                0.64
              );
            }

            if (heroCaption) {
              heroTl.fromTo(
                heroCaption,
                { y: 18, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.58, ease: "power3.out" },
                0.78
              );
            }

            // Step 4: Hero CTA Buttons Sequential Reveal
            if (heroCtas.length > 0) {
              heroTl.fromTo(
                heroCtas,
                { y: 18, opacity: 0, scale: 0.96 },
                {
                  y: 0,
                  opacity: 1,
                  scale: 1,
                  duration: 0.52,
                  stagger: 0.1,
                  clearProps: "transform"
                },
                0.98
              );
            }

            // Light Parallax on Hero Visual Elements (Desktop & Tablet)
            if (isDesktop || isTablet) {
              const parallaxIntensity = isDesktop ? 1 : 0.45;
              const photoMorning = document.getElementById("heroPhotoMorning");
              const photoNight = document.getElementById("heroPhotoNight");
              const headingsBox = document.getElementById("heroHeadingsMorphBox");

              if (photoMorning && photoNight) {
                gsap.to([photoMorning, photoNight], {
                  yPercent: 9 * parallaxIntensity,
                  ease: "none",
                  scrollTrigger: {
                    trigger: heroSection,
                    start: "top top",
                    end: "bottom top",
                    scrub: 0.6
                  }
                });
              }

              if (headingsBox) {
                gsap.to(headingsBox, {
                  yPercent: -14 * parallaxIntensity,
                  ease: "none",
                  scrollTrigger: {
                    trigger: heroSection,
                    start: "top top",
                    end: "bottom top",
                    scrub: 0.5
                  }
                });
              }
            }
          }

          // Upgrade switchGridoraHeroMode to use GSAP word-stagger & morph transitions
          const prevSwitchHero = (window as unknown as Record<string, unknown>).switchGridoraHeroMode;
          (window as unknown as Record<string, unknown>).switchGridoraHeroMode = function gsapSwitchHeroMode(
            mode: string
          ) {
            const isAfternoon = mode === "afternoon";
            const heroEl = document.getElementById("beranda");
            const dockEl = document.getElementById("heroSwitcherDock");
            const btnM = document.getElementById("btnHeroModeMorning");
            const btnA = document.getElementById("btnHeroModeAfternoon");
            const hPrimary = document.getElementById("heroHeadlinePrimary");
            const hSecondary = document.getElementById("heroHeadlineSecondary");
            const capEl = document.getElementById("heroModeCaption");

            if (heroEl) heroEl.setAttribute("data-hero-mode", isAfternoon ? "afternoon" : "morning");
            if (document.body) {
              document.body.setAttribute("data-hero-mode", isAfternoon ? "afternoon" : "morning");
            }
            if (dockEl) {
              dockEl.setAttribute("data-active-mode", isAfternoon ? "afternoon" : "morning");
              dockEl.classList.add("is-stretching");
              setTimeout(() => dockEl.classList.remove("is-stretching"), 260);
            }
            if (btnM) {
              btnM.classList.toggle("active", !isAfternoon);
              btnM.setAttribute("aria-selected", String(!isAfternoon));
            }
            if (btnA) {
              btnA.classList.toggle("active", isAfternoon);
              btnA.setAttribute("aria-selected", String(isAfternoon));
            }

            const nextPrimaryText = isAfternoon ? "Eksplorasi bakat." : "Cerdas di kelas.";
            const nextSecondaryText = isAfternoon ? "Tumbuh berkarakter." : "Santun di masyarakat.";
            const nextCaptionText = isAfternoon
              ? "Mode Malam Karakter: Pembinaan budi pekerti, Pramuka, olahraga, seni budaya, dan kepedulian lingkungan sekolah ramah anak."
              : "Mode Pagi Akademik: Pembelajaran intrakurikuler Kurikulum Nasional, penguatan literasi-numerasi, serta eksperimen sains dasar.";

            const existingWords = Array.from(
              document.querySelectorAll<HTMLElement>(
                "#heroHeadlinePrimary .gsap-word-inner, #heroHeadlineSecondary .gsap-word-inner"
              )
            );

            const runWordEntrance = () => {
              const w1 = splitElementIntoWords(hPrimary, nextPrimaryText);
              const w2 = splitElementIntoWords(hSecondary, nextSecondaryText);
              if (reduceMotion) return;

              const switchTl = gsap.timeline();
              if (w1.length > 0) {
                switchTl.fromTo(
                  w1,
                  {
                    yPercent: 96,
                    opacity: 0,
                    scale: 0.96,
                    filter: "blur(5px)"
                  },
                  {
                    yPercent: 0,
                    opacity: 1,
                    scale: 1,
                    filter: "blur(0px)",
                    duration: 0.68,
                    stagger: { each: 0.055, ease: "power2.out" },
                    ease: "expo.out",
                    clearProps: "filter,transform"
                  },
                  0
                );
              }
              if (w2.length > 0) {
                switchTl.fromTo(
                  w2,
                  {
                    yPercent: 96,
                    opacity: 0,
                    scale: 0.96,
                    filter: "blur(5px)"
                  },
                  {
                    yPercent: 0,
                    opacity: 1,
                    scale: 1,
                    filter: "blur(0px)",
                    duration: 0.68,
                    stagger: { each: 0.055, ease: "power2.out" },
                    ease: "expo.out",
                    clearProps: "filter,transform"
                  },
                  0.11
                );
              }
            };

            if (!reduceMotion && existingWords.length > 0) {
              gsap.to(existingWords, {
                yPercent: -65,
                opacity: 0,
                filter: "blur(4px)",
                duration: 0.15,
                stagger: 0.018,
                ease: "power2.in",
                overwrite: "auto",
                onComplete: runWordEntrance
              });
            } else {
              runWordEntrance();
            }

            if (capEl) {
              if (!reduceMotion) {
                gsap.to(capEl, {
                  opacity: 0,
                  y: 6,
                  duration: 0.16,
                  ease: "power2.in",
                  onComplete: () => {
                    capEl.textContent = nextCaptionText;
                    gsap.to(capEl, {
                      opacity: 1,
                      y: 0,
                      duration: 0.38,
                      ease: "power3.out"
                    });
                  }
                });
              } else {
                capEl.textContent = nextCaptionText;
              }
            }
          };

          cleanups.push(() => {
            if (prevSwitchHero) {
              (window as unknown as Record<string, unknown>).switchGridoraHeroMode = prevSwitchHero;
            }
          });

          if (reduceMotion) {
            return () => {
              cleanups.forEach((fn) => fn());
            };
          }

          // =========================================================================
          // 2. CINEMATIC SECTION TRANSITION SYSTEM (GOLD DIVIDER + COORDINATED REVEALS)
          // =========================================================================
          const tier = getResponsiveMotionTier(window.innerWidth || 1440, reduceMotion);
          const timing = getSectionRevealTiming(tier);
          const revealEase = CINEMATIC_TRANSITION_CONFIG.heading.ease;

          // 2A. Inject & Animate Minimalist Center-Out Gold Dividers + Coordinated Section Heading Fade-Up
          const transitionSections = gsap.utils.toArray<HTMLElement>(
            "section.gridora-manifesto-section, section.gridora-sticky-story-section, section.gridora-dark-platform, section.gridora-section"
          );

          transitionSections.forEach((section) => {
            const container = section.querySelector<HTMLElement>(":scope > .container");
            if (!container) return;

            let dividerWrap = container.querySelector<HTMLElement>(":scope > .cinematic-gold-divider");
            if (!dividerWrap) {
              dividerWrap = document.createElement("div");
              dividerWrap.className = "cinematic-gold-divider";
              dividerWrap.setAttribute("aria-hidden", "true");
              dividerWrap.innerHTML = `<div class="cinematic-gold-line"></div><span class="cinematic-gold-node"></span>`;
              container.prepend(dividerWrap);
            }

            const goldLine = dividerWrap.querySelector<HTMLElement>(".cinematic-gold-line");
            const goldNode = dividerWrap.querySelector<HTMLElement>(".cinematic-gold-node");

            // Collect headings and descriptions inside this section for coordinated fade-up
            const headerBlock = section.querySelector<HTMLElement>(
              ".gridora-split-header, .gridora-dark-header, .gridora-kicker-row"
            );
            const headingTargets = headerBlock
              ? Array.from(
                  headerBlock.querySelectorAll<HTMLElement>(
                    ".gridora-kicker-label, .gridora-dark-kicker, h2, .gridora-dark-sub, .gridora-header-action, .gridora-stepper, .story-chapter-pills"
                  )
                )
              : [];

            const secTl = gsap.timeline({
              scrollTrigger: {
                trigger: section,
                start: CINEMATIC_TRANSITION_CONFIG.divider.scrollStart,
                toggleActions: "play none none none"
              }
            });

            if (goldLine) {
              secTl.fromTo(
                goldLine,
                {
                  scaleX: CINEMATIC_TRANSITION_CONFIG.divider.initialScaleX,
                  opacity: CINEMATIC_TRANSITION_CONFIG.divider.initialOpacity,
                  transformOrigin: CINEMATIC_TRANSITION_CONFIG.divider.transformOrigin
                },
                {
                  scaleX: CINEMATIC_TRANSITION_CONFIG.divider.finalScaleX,
                  opacity: CINEMATIC_TRANSITION_CONFIG.divider.finalOpacity,
                  duration: timing.dividerDuration,
                  ease: CINEMATIC_TRANSITION_CONFIG.divider.ease
                },
                0
              );
            }

            if (goldNode) {
              secTl.fromTo(
                goldNode,
                { scale: 0, opacity: 0 },
                {
                  scale: 1,
                  opacity: 1,
                  duration: timing.dividerDuration * 0.65,
                  ease: "back.out(2)"
                },
                0.08
              );
            }

            if (headingTargets.length > 0) {
              secTl.fromTo(
                headingTargets,
                {
                  y: timing.translateY,
                  opacity: 0
                },
                {
                  y: 0,
                  opacity: 1,
                  duration: timing.headingDuration,
                  stagger: CINEMATIC_TRANSITION_CONFIG.heading.staggerEach,
                  ease: revealEase,
                  clearProps: "transform"
                },
                CINEMATIC_TRANSITION_CONFIG.heading.delayAfterDivider
              );
            }
          });

          // 2B. Standalone Fade-Up Elements (toggleActions: "play none none none")
          const fadeUpSelectors = [
            ".gridora-trust-caption",
            ".gridora-progress-row",
            ".gridora-subheader-row",
            "#spmbStatusAlert",
            ".gridora-faq-block"
          ];
          gsap.utils.toArray<HTMLElement>(fadeUpSelectors.join(", ")).forEach((el) => {
            gsap.fromTo(
              el,
              { y: timing.translateY, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: timing.headingDuration,
                ease: revealEase,
                clearProps: "transform",
                scrollTrigger: {
                  trigger: el,
                  start: "top 88%",
                  toggleActions: "play none none none"
                }
              }
            );
          });

          // 2C. Contact Cards Stagger & Image Mask Reveal (toggleActions: "play none none none")
          const contactCardsCol = document.querySelector<HTMLElement>(".gridora-contact-cards");
          if (contactCardsCol) {
            const contactCards = contactCardsCol.querySelectorAll<HTMLElement>(".gridora-bento-card");
            if (contactCards.length > 0) {
              gsap.fromTo(
                contactCards,
                { y: timing.translateY, opacity: 0 },
                {
                  y: 0,
                  opacity: 1,
                  duration: timing.headingDuration,
                  stagger: timing.cardStagger,
                  ease: revealEase,
                  clearProps: "transform",
                  scrollTrigger: {
                    trigger: contactCardsCol,
                    start: "top 86%",
                    toggleActions: "play none none none"
                  }
                }
              );
            }
          }

          // 2D. Image Mask Reveal (clip-path reveal on Sambutan Photo Frame & Map Frame, toggleActions: "play none none none")
          const maskTargets = gsap.utils.toArray<HTMLElement>(
            ".sambutan-photo-frame, .gridora-map-frame"
          );
          maskTargets.forEach((target) => {
            gsap.fromTo(
              target,
              {
                clipPath: CINEMATIC_TRANSITION_CONFIG.imageMask.initialClip,
                scale: CINEMATIC_TRANSITION_CONFIG.imageMask.initialScale,
                opacity: 0
              },
              {
                clipPath: CINEMATIC_TRANSITION_CONFIG.imageMask.finalClip,
                scale: CINEMATIC_TRANSITION_CONFIG.imageMask.finalScale,
                opacity: 1,
                duration: CINEMATIC_TRANSITION_CONFIG.imageMask.duration,
                ease: CINEMATIC_TRANSITION_CONFIG.imageMask.ease,
                clearProps: "clipPath,transform",
                scrollTrigger: {
                  trigger: target,
                  start: CINEMATIC_TRANSITION_CONFIG.imageMask.scrollStart,
                  toggleActions: "play none none none"
                }
              }
            );
          });

          // 2E. Text Reveal on Editorial Manifesto Phrases (toggleActions: "play none none none")
          const manifestoPhrases = gsap.utils.toArray<HTMLElement>(
            ".gridora-manifesto-text > span"
          );
          if (manifestoPhrases.length > 0) {
            gsap.fromTo(
              manifestoPhrases,
              { y: 22, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.72,
                stagger: 0.12,
                ease: revealEase,
                clearProps: "transform",
                scrollTrigger: {
                  trigger: ".gridora-manifesto-text",
                  start: "top 84%",
                  toggleActions: "play none none none"
                }
              }
            );
          }

          // Progress Fill Bar Reveal in Manifesto (toggleActions: "play none none none")
          const progressFill = document.querySelector<HTMLElement>(".gridora-progress-fill");
          if (progressFill) {
            gsap.fromTo(
              progressFill,
              { scaleX: 0, transformOrigin: "left center" },
              {
                scaleX: 1,
                duration: 1.1,
                ease: "expo.out",
                scrollTrigger: {
                  trigger: ".gridora-progress-row",
                  start: "top 88%",
                  toggleActions: "play none none none"
                }
              }
            );
          }

          // 2F. Subtle GSAP + ScrollTrigger Entrance Animation for Hero Stats Cards (toggleActions: "play none none none")
          const heroStatsSection = document.getElementById("heroStatsSection");
          const heroStatsGrid = document.getElementById("heroStatsGrid");
          if (heroStatsGrid) {
            const heroStatCards = gsap.utils.toArray<HTMLElement>(
              ".hero-stat-card",
              heroStatsGrid
            );
            const heroStatIcons = gsap.utils.toArray<HTMLElement>(
              ".hero-stat-icon",
              heroStatsGrid
            );

            if (heroStatCards.length > 0) {
              const statsTl = gsap.timeline({
                scrollTrigger: {
                  trigger: heroStatsSection || heroStatsGrid,
                  start: HERO_STATS_ANIMATION_CONFIG.scrollStart,
                  toggleActions: "play none none none"
                }
              });

              statsTl.fromTo(
                heroStatCards,
                {
                  y: HERO_STATS_ANIMATION_CONFIG.initialY,
                  opacity: 0,
                  scale: HERO_STATS_ANIMATION_CONFIG.initialScale,
                  filter: `blur(${HERO_STATS_ANIMATION_CONFIG.initialBlurPx}px)`
                },
                {
                  y: 0,
                  opacity: 1,
                  scale: 1,
                  filter: "blur(0px)",
                  duration: HERO_STATS_ANIMATION_CONFIG.duration,
                  stagger: {
                    each: HERO_STATS_ANIMATION_CONFIG.staggerEach,
                    ease: "power2.out"
                  },
                  ease: HERO_STATS_ANIMATION_CONFIG.ease,
                  clearProps: "filter,transform"
                },
                0
              );

              if (heroStatIcons.length > 0) {
                statsTl.fromTo(
                  heroStatIcons,
                  {
                    scale: 0.72,
                    rotate: -8,
                    opacity: 0
                  },
                  {
                    scale: 1,
                    rotate: 0,
                    opacity: 1,
                    duration: 0.62,
                    stagger: {
                      each: HERO_STATS_ANIMATION_CONFIG.staggerEach,
                      ease: "power2.out"
                    },
                    ease: "back.out(1.8)",
                    clearProps: "transform"
                  },
                  0.08
                );
              }

              // Subtle ScrollTrigger vertical drift on desktop (scrubbed smoothly)
              if (isDesktop) {
                gsap.fromTo(
                  heroStatsGrid,
                  { y: 8 },
                  {
                    y: -6,
                    ease: "none",
                    scrollTrigger: {
                      trigger: heroStatsSection || heroStatsGrid,
                      start: "top bottom",
                      end: "bottom top",
                      scrub: 0.5
                    }
                  }
                );
              }
            }
          }

          // 2G. Coordinated Stagger Card Reveal Groups across remaining sections (toggleActions: "play none none none")
          const staggerGroups: Array<{ container: string; items: string }> = [
            { container: ".gridora-ws-kpi-grid", items: ".gridora-kpi-card" },
            { container: "#programBentoGrid", items: ".gridora-bento-card" },
            { container: "#spmb .gridora-bento-tri", items: ".gridora-bento-card" },
            { container: ".steps-grid", items: ".step-item" },
            { container: ".footer-grid", items: ".footer-col" }
          ];

          staggerGroups.forEach(({ container, items }) => {
            const wrap = document.querySelector<HTMLElement>(container);
            if (!wrap) return;
            const cards = wrap.querySelectorAll<HTMLElement>(items);
            if (!cards.length) return;
            gsap.fromTo(
              cards,
              {
                y: CINEMATIC_TRANSITION_CONFIG.cards.initialY,
                opacity: 0,
                scale: CINEMATIC_TRANSITION_CONFIG.cards.initialScale
              },
              {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: CINEMATIC_TRANSITION_CONFIG.cards.duration,
                stagger: timing.cardStagger,
                ease: CINEMATIC_TRANSITION_CONFIG.cards.ease,
                clearProps: "transform",
                scrollTrigger: {
                  trigger: wrap,
                  start: CINEMATIC_TRANSITION_CONFIG.cards.scrollStart,
                  toggleActions: "play none none none"
                }
              }
            );
          });

          // =========================================================================
          // 4. MORPH TRANSITIONS (WORKSPACE PORTAL + SVG WAVE + CONVERSION BANNER)
          // =========================================================================
          const workspaceCard = document.getElementById("gridoraWorkspaceCard");
          if (workspaceCard) {
            gsap.fromTo(
              workspaceCard,
              {
                scale: isDesktop ? 0.93 : 0.97,
                borderRadius: isDesktop ? "48px" : "28px",
                y: 36,
                opacity: 0.65
              },
              {
                scale: 1,
                borderRadius: "28px",
                y: 0,
                opacity: 1,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: workspaceCard,
                  start: "top 92%",
                  end: "top 35%",
                  scrub: 0.55
                }
              }
            );
          }

          const ctaBanner = document.querySelector<HTMLElement>(".gridora-cta-banner");
          if (ctaBanner) {
            gsap.fromTo(
              ctaBanner,
              {
                scale: 0.94,
                borderRadius: "42px",
                opacity: 0.5,
                y: 28
              },
              {
                scale: 1,
                borderRadius: "24px",
                opacity: 1,
                y: 0,
                duration: 0.85,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: ctaBanner,
                  start: "top 88%"
                }
              }
            );
          }

          // Scroll-Driven SVG Wave Morph (#morphWaveTopPath) via GSAP ScrollTrigger
          const wavePath = document.getElementById("morphWaveTopPath");
          const waveDivider = document.querySelector<HTMLElement>(".gridora-morph-divider");
          if (wavePath && waveDivider) {
            ScrollTrigger.create({
              trigger: waveDivider,
              start: "top bottom",
              end: "bottom 25%",
              scrub: 0.4,
              onUpdate: (self) => {
                const cy = computeWaveControlY(self.progress);
                wavePath.setAttribute("d", `M0,96 Q720,${cy} 1440,96 L1440,96 L0,96 Z`);
              }
            });
          }

          // =========================================================================
          // 5. INTERACTIVE MICRO-ANIMATIONS (COUNTERS, HOVER PARALLAX, MAGNETIC CTAS, NAV)
          // =========================================================================
          // 5A. Animated Counters
          const counterElements = gsap.utils.toArray<HTMLElement>(
            ".stat-number, .gridora-kpi-val, .gridora-progress-value"
          );

          const animateCounterElement = (el: HTMLElement) => {
            const raw = el.getAttribute("data-counter-target") || el.textContent || "";
            const parsed = parseCounterTarget(raw);
            if (parsed.numericValue === null || parsed.numericValue <= 0) return;

            el.setAttribute("data-counter-target", raw.trim());
            const proxy = { val: 0 };
            gsap.to(proxy, {
              val: parsed.numericValue,
              duration: 1.45,
              ease: "power3.out",
              scrollTrigger: {
                trigger: el,
                start: "top 90%",
                toggleActions: "play none none none"
              },
              onUpdate: () => {
                el.textContent = `${parsed.prefix}${Math.round(proxy.val)}${parsed.suffix}`;
              }
            });
          };

          counterElements.forEach(animateCounterElement);

          // 5B. Smooth Card Hover Micro-Animations & Button Magnetic Pull (Desktop only)
          if (isDesktop) {
            const interactiveCards = gsap.utils.toArray<HTMLElement>(
              ".gridora-bento-card, .gridora-kpi-card, .step-item, .story-step-card"
            );
            interactiveCards.forEach((card) => {
              const onEnter = () => {
                gsap.to(card, {
                  y: -5,
                  scale: 1.008,
                  duration: 0.32,
                  ease: "power2.out",
                  overwrite: "auto"
                });
              };
              const onLeave = () => {
                gsap.to(card, {
                  y: 0,
                  scale: 1,
                  duration: 0.38,
                  ease: "power3.out",
                  overwrite: "auto"
                });
              };
              card.addEventListener("mouseenter", onEnter);
              card.addEventListener("mouseleave", onLeave);
              cleanups.push(() => {
                card.removeEventListener("mouseenter", onEnter);
                card.removeEventListener("mouseleave", onLeave);
              });
            });

            // Subtle Magnetic Button Interaction
            const magneticBtns = gsap.utils.toArray<HTMLElement>(
              ".btn-gridora-pill, .btn-gridora-ghost, .btn-gridora-light"
            );
            magneticBtns.forEach((btn) => {
              const xTo = gsap.quickTo(btn, "x", { duration: 0.35, ease: "power3.out" });
              const yTo = gsap.quickTo(btn, "y", { duration: 0.35, ease: "power3.out" });
              const onMove = (e: MouseEvent) => {
                const rect = btn.getBoundingClientRect();
                const relX = e.clientX - (rect.left + rect.width / 2);
                const relY = e.clientY - (rect.top + rect.height / 2);
                xTo(relX * 0.16);
                yTo(relY * 0.22);
              };
              const onLeave = () => {
                xTo(0);
                yTo(0);
              };
              btn.addEventListener("mousemove", onMove);
              btn.addEventListener("mouseleave", onLeave);
              cleanups.push(() => {
                btn.removeEventListener("mousemove", onMove);
                btn.removeEventListener("mouseleave", onLeave);
              });
            });
          }

          // 5C. ScrollTrigger Active Navigation State & Smooth Section Scrolling
          const navLinks = gsap.utils.toArray<HTMLAnchorElement>(
            ".gridora-nav-menu .nav-link:not(.nav-cta)"
          );
          const syncActiveNavByHref = (targetHref: string) => {
            const navMenu = document.querySelector<HTMLElement>(".gridora-nav-menu");
            const glider = navMenu?.querySelector<HTMLElement>(".gridora-nav-glider");
            navLinks.forEach((link) => {
              const isMatch = link.getAttribute("href") === targetHref;
              link.classList.toggle("active", isMatch);
              if (isMatch && navMenu && glider && window.innerWidth > 960) {
                const menuRect = navMenu.getBoundingClientRect();
                const linkRect = link.getBoundingClientRect();
                glider.style.width = `${linkRect.width}px`;
                glider.style.transform = `translate3d(${linkRect.left - menuRect.left}px, -50%, 0)`;
                glider.style.opacity = "1";
              }
            });
          };

          const trackedSectionIds = [
            "beranda",
            "profil",
            "program",
            "pengumuman",
            "guru",
            "galeri",
            "spmb",
            "kontak"
          ];
          trackedSectionIds.forEach((secId) => {
            const secEl = document.getElementById(secId);
            if (!secEl) return;
            ScrollTrigger.create({
              trigger: secEl,
              start: "top 45%",
              end: "bottom 45%",
              onEnter: () => syncActiveNavByHref(`#${secId}`),
              onEnterBack: () => syncActiveNavByHref(`#${secId}`)
            });
          });

          return () => {
            cleanups.forEach((fn) => fn());
          };
        }
      );

      return () => {
        mm.revert();
      };
    },
    { scope: scopeRef }
  );

  // Observe dynamic CMS containers (#ekskulContainer, #pengumumanContainer, #fasilitasContainer, #guruContainer, #galeriContainer)
  // so newly hydrated CMS cards receive stagger/image-mask animations and ScrollTrigger refreshes cleanly.
  useEffect(() => {
    const prefersReduced =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const dynamicContainers = [
      "ekskulContainer",
      "fasilitasContainer",
      "guruContainer",
      "galeriContainer"
    ];

    const observers: MutationObserver[] = [];

    dynamicContainers.forEach((id) => {
      const container = document.getElementById(id);
      if (!container) return;

      const animateChildren = () => {
        const children = Array.from(container.children) as HTMLElement[];
        if (!children.length) return;

        if (!prefersReduced) {
          gsap.fromTo(
            children,
            { y: 24, opacity: 0, scale: 0.98 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.62,
              stagger: 0.075,
              ease: "power3.out",
              clearProps: "transform",
              overwrite: "auto",
              scrollTrigger: {
                trigger: container,
                start: "top 88%",
                once: true
              }
            }
          );

          // Image hover parallax on cards with images
          children.forEach((card) => {
            const img = card.querySelector<HTMLElement>("img");
            if (!img || card.dataset.gsapHoverBound === "1") return;
            card.dataset.gsapHoverBound = "1";
            card.addEventListener("mouseenter", () => {
              gsap.to(img, { scale: 1.06, duration: 0.48, ease: "power2.out", overwrite: "auto" });
            });
            card.addEventListener("mouseleave", () => {
              gsap.to(img, { scale: 1, duration: 0.48, ease: "power2.out", overwrite: "auto" });
            });
          });
        }

        ScrollTrigger.refresh();
      };

      // Run once if already populated
      if (container.children.length > 0) {
        animateChildren();
      }

      const obs = new MutationObserver(() => {
        animateChildren();
      });
      obs.observe(container, { childList: true });
      observers.push(obs);
    });

    const refreshTimer = window.setTimeout(() => {
      ScrollTrigger.refresh();
    }, 650);

    return () => {
      observers.forEach((o) => o.disconnect());
      window.clearTimeout(refreshTimer);
    };
  }, []);

  return null;
};
