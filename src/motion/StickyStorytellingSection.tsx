import React, { useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { STORY_CHAPTERS, computeStoryChapterIndex } from "./motionConfig";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export const StickyStorytellingSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const visualStageRef = useRef<HTMLDivElement | null>(null);
  const progressFillRef = useRef<HTMLDivElement | null>(null);
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const activeIdxRef = useRef<number>(0);

  const transitionToChapter = useCallback((nextIdx: number) => {
    if (nextIdx === activeIdxRef.current) return;
    activeIdxRef.current = nextIdx;
    setActiveIdx(nextIdx);

    if (!visualStageRef.current) return;
    const frames = visualStageRef.current.querySelectorAll<HTMLElement>(".story-visual-frame");
    frames.forEach((frame, idx) => {
      const isMatch = idx === nextIdx;
      gsap.to(frame, {
        opacity: isMatch ? 1 : 0,
        scale: isMatch ? 1 : 1.06,
        yPercent: isMatch ? 0 : idx < nextIdx ? -4 : 4,
        clipPath: isMatch
          ? "inset(0% 0% 0% 0% round 22px)"
          : "inset(6% 6% 6% 6% round 32px)",
        duration: 0.72,
        ease: "power3.out",
        overwrite: "auto"
      });
    });

    const badgeCard = visualStageRef.current.querySelector<HTMLElement>(".story-floating-metric");
    if (badgeCard) {
      gsap.fromTo(
        badgeCard,
        { y: 12, opacity: 0.5, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 0.48, ease: "power2.out", overwrite: "auto" }
      );
    }
  }, []);

  useGSAP(
    () => {
      const rootEl = sectionRef.current;
      if (!rootEl) return;

      const mm = gsap.matchMedia();

      // Desktop & Tablet: ScrollTrigger scrub experience
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

          const stepCards = gsap.utils.toArray<HTMLElement>(".story-step-card", rootEl);

          if (reduceMotion) {
            gsap.set(stepCards, { opacity: 1, y: 0 });
            return;
          }

          // Reveal each narrative card cleanly as it enters
          stepCards.forEach((card, idx) => {
            gsap.fromTo(
              card,
              {
                opacity: isDesktop ? 0.35 : 0,
                y: isDesktop ? 28 : 24,
                scale: isDesktop ? 0.98 : 1
              },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.65,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: card,
                  start: isDesktop ? "top 72%" : "top 85%",
                  end: isDesktop ? "bottom 38%" : "bottom 25%",
                  toggleActions: "play none none reverse",
                  onEnter: () => transitionToChapter(idx),
                  onEnterBack: () => transitionToChapter(idx)
                }
              }
            );
          });

          // Continuous scrubbed progress bar & subtle parallax on Desktop / Tablet
          if (isDesktop || isTablet) {
            ScrollTrigger.create({
              trigger: rootEl,
              start: "top 22%",
              end: "bottom 78%",
              scrub: 0.5,
              onUpdate: (self) => {
                if (progressFillRef.current) {
                  gsap.set(progressFillRef.current, {
                    scaleY: Math.max(0.08, self.progress)
                  });
                }
                const idx = computeStoryChapterIndex(self.progress, STORY_CHAPTERS.length);
                transitionToChapter(idx);
              }
            });
          }
        }
      );

      return () => {
        mm.revert();
      };
    },
    { scope: sectionRef, dependencies: [transitionToChapter] }
  );

  const handleSelectChapter = (idx: number) => {
    transitionToChapter(idx);
    if (!sectionRef.current) return;
    const stepCards = sectionRef.current.querySelectorAll<HTMLElement>(".story-step-card");
    const targetCard = stepCards[idx];
    if (targetCard && window.innerWidth >= 1024) {
      const rect = targetCard.getBoundingClientRect();
      const targetY = window.scrollY + rect.top - 150;
      window.scrollTo({ top: targetY, behavior: "smooth" });
    }
  };

  const activeChapter = STORY_CHAPTERS[activeIdx] || STORY_CHAPTERS[0];

  return (
    <section
      ref={sectionRef}
      className="gridora-sticky-story-section"
      id="alur-harian"
      aria-label="Alur Pembelajaran Harian SDN Sumberejo 04"
    >
      <div className="container">
        <div className="gridora-split-header story-section-header">
          <div>
            <span className="gridora-kicker-label">RITME EKOSISTEM SEKOLAH</span>
            <h2 className="gridora-split-title">
              <span>Dari embun pagi hingga kemah karakter.</span>
              <span className="gridora-split-title-muted">
                Perjalanan harian siswa yang terukur dan menyenangkan.
              </span>
            </h2>
          </div>

          {/* Interactive Chapter Quick-Selector Tabs */}
          <div className="story-chapter-pills" role="tablist" aria-label="Pilih Tahap Harian">
            {STORY_CHAPTERS.map((chap, idx) => {
              const isActive = idx === activeIdx;
              return (
                <button
                  key={chap.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`story-chapter-pill ${isActive ? "active" : ""}`}
                  onClick={() => handleSelectChapter(idx)}
                >
                  <span className="story-pill-num">{chap.indexLabel}</span>
                  <span className="story-pill-text">{chap.title.split("&")[0].trim()}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="story-sticky-grid">
          {/* Left Column: Scrolling Narrative Chapters + Vertical Scrub Progress Rail */}
          <div className="story-narrative-col">
            <div className="story-progress-rail" aria-hidden="true">
              <div
                ref={progressFillRef}
                className="story-progress-rail-fill"
                style={{ transform: `scaleY(${(activeIdx + 1) / STORY_CHAPTERS.length})` }}
              />
            </div>

            <div className="story-steps-list">
              {STORY_CHAPTERS.map((chap, idx) => {
                const isActive = idx === activeIdx;
                return (
                  <article
                    key={chap.id}
                    className={`story-step-card ${isActive ? "is-active" : ""}`}
                    data-story-index={idx}
                    onClick={() => handleSelectChapter(idx)}
                  >
                    <div className="story-step-meta">
                      <span className="story-step-index">{chap.indexLabel} / 04</span>
                      <span aria-hidden="true">&middot;</span>
                      <span className="story-step-time">{chap.timeBadge}</span>
                    </div>

                    <span className="story-step-kicker">{chap.kicker}</span>
                    <h3 className="story-step-title">{chap.title}</h3>
                    <p className="story-step-subtitle">{chap.subtitle}</p>
                    <p className="story-step-desc">{chap.description}</p>

                    <ul className="story-step-highlights">
                      {chap.highlights.map((item, hIdx) => (
                        <li key={hIdx}>{item}</li>
                      ))}
                    </ul>

                    {/* Inline visual preview exclusively for Mobile screens where sticky stage is stacked */}
                    <div className="story-mobile-media">
                      <img
                        src={chap.imageUrl}
                        alt={chap.imageAlt}
                        loading="lazy"
                        className="story-mobile-img"
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Right Column: Sticky Visual Stage */}
          <div className="story-sticky-col">
            <div
              ref={visualStageRef}
              className={`story-visual-stage theme-${activeChapter.themeMode}`}
              data-testid="sticky-story-stage"
              data-active-chapter={activeChapter.id}
            >
              {/* Layered Visual Frames for Smooth Opacity / Scale / Clip-Path Scrubbing */}
              <div className="story-visual-frames-wrap">
                {STORY_CHAPTERS.map((chap, idx) => {
                  const isActive = idx === activeIdx;
                  return (
                    <div
                      key={chap.id}
                      className={`story-visual-frame ${isActive ? "is-active" : ""}`}
                      style={{
                        opacity: isActive ? 1 : 0,
                        zIndex: isActive ? 2 : 1
                      }}
                    >
                      <img
                        src={chap.imageUrl}
                        alt={chap.imageAlt}
                        loading={idx === 0 ? "eager" : "lazy"}
                        className="story-stage-img"
                      />
                      <div className="story-stage-scrim" />
                    </div>
                  );
                })}
              </div>

              {/* Top Architectural Frame Header */}
              <div className="story-stage-topbar">
                <div className="story-stage-chapter-tag">
                  <span>FASE {activeChapter.indexLabel}</span>
                  <span aria-hidden="true">&middot;</span>
                  <span>{activeChapter.timeBadge}</span>
                </div>
                <div className="story-stage-dots" aria-hidden="true">
                  {STORY_CHAPTERS.map((c, idx) => (
                    <span
                      key={c.id}
                      className={`story-stage-dot ${idx === activeIdx ? "active" : ""}`}
                    />
                  ))}
                </div>
              </div>

              {/* Bottom Floating Frosted Caption & Metric Card */}
              <div className="story-stage-bottom">
                <div className="story-stage-caption-card">
                  <span className="story-stage-kicker">{activeChapter.kicker}</span>
                  <h4 className="story-stage-heading">{activeChapter.title}</h4>
                  <p className="story-stage-copy">{activeChapter.subtitle}</p>
                </div>

                <div className="story-floating-metric">
                  <strong className="story-metric-val">{activeChapter.metricValue}</strong>
                  <span className="story-metric-lbl">{activeChapter.metricLabel}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
