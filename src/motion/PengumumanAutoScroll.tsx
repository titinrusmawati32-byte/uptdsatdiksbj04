import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  PENGUMUMAN_AUTOSCROLL_CONFIG,
  computePengumumanTrackMetrics,
  shouldEnableHorizontalTrackMotion,
  getPengumumanSpeedForTier,
  getResponsiveMotionTier,
  wrapPengumumanOffset,
  computeEdgeGradientOpacities
} from "./motionConfig";

gsap.registerPlugin(useGSAP);

interface GestureState {
  isTracking: boolean;
  isHorizontalSwipe: boolean;
  startX: number;
  startY: number;
  lastX: number;
  lastTimestamp: number;
  velocityPxPerMs: number;
  startTransformX: number;
  hasMovedSignificant: boolean;
}

export const PengumumanAutoScroll: React.FC = () => {
  const scopeRef = useRef<HTMLElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const isPointerInsideRef = useRef<boolean>(false);
  const isSyncingDomRef = useRef<boolean>(false);
  const isTouchingRef = useRef<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);
  const resumeTimerRef = useRef<NodeJS.Timeout | number | null>(null);
  const loopDistanceRef = useRef<number>(0);
  const activeCardIndexRef = useRef<number>(0);
  const isSectionInViewRef = useRef<boolean>(true);

  const gestureRef = useRef<GestureState>({
    isTracking: false,
    isHorizontalSwipe: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastTimestamp: 0,
    velocityPxPerMs: 0,
    startTransformX: 0,
    hasMovedSignificant: false
  });

  useGSAP(
    () => {
      const section = document.getElementById("pengumuman");
      const viewport = document.getElementById("pengumumanViewport");
      const container = document.getElementById("pengumumanContainer");
      if (!section || !viewport || !container) return;

      scopeRef.current = section;
      section.setAttribute("data-autoscroll-state", "idle");
      section.setAttribute("data-active-index", "0");

      const clearResumeTimer = () => {
        if (resumeTimerRef.current) {
          clearTimeout(resumeTimerRef.current as NodeJS.Timeout);
          resumeTimerRef.current = null;
        }
      };

      const getOriginalCards = (): HTMLElement[] => {
        return Array.from(
          container.querySelectorAll<HTMLElement>(
            '.pengumuman-card:not([data-pengumuman-clone="true"])'
          )
        );
      };

      const getCardStrideAndPositions = (): {
        stridePx: number;
        cardWidthPx: number;
        gapPx: number;
        snapOffsets: number[];
        totalCards: number;
      } => {
        const cards = getOriginalCards();
        const totalCards = cards.length;
        if (totalCards === 0) {
          return { stridePx: 320, cardWidthPx: 300, gapPx: 20, snapOffsets: [0], totalCards: 0 };
        }
        const firstLeft = cards[0].offsetLeft;
        const snapOffsets = cards.map((c) => Math.max(0, c.offsetLeft - firstLeft));
        const cardWidthPx = cards[0].offsetWidth || 300;
        let stridePx = cardWidthPx + 20;
        let gapPx = 20;
        if (totalCards > 1) {
          stridePx = Math.max(1, snapOffsets[1] - snapOffsets[0]);
          gapPx = Math.max(0, stridePx - cardWidthPx);
        }
        return { stridePx, cardWidthPx, gapPx, snapOffsets, totalCards };
      };

      const removeClones = () => {
        const clones = container.querySelectorAll<HTMLElement>('[data-pengumuman-clone="true"]');
        clones.forEach((clone) => clone.remove());
      };

      const updateGradientIndicators = () => {
        const edgeLeft = document.getElementById("pengumumanEdgeLeft");
        const edgeRight = document.getElementById("pengumumanEdgeRight");
        if (!edgeLeft || !edgeRight) return;

        const cards = getOriginalCards();
        if (cards.length <= 1) {
          edgeLeft.style.opacity = "0";
          edgeRight.style.opacity = "0";
          return;
        }

        // When looping, both edges have continuous content streaming through
        edgeLeft.style.opacity = "0.78";
        edgeRight.style.opacity = "0.78";
      };

      const syncActiveDotAndCounter = () => {
        const loopDist = loopDistanceRef.current;
        const totalCards = getOriginalCards().length;
        if (loopDist <= 0 || totalCards <= 1) return;

        const currentX = Number(gsap.getProperty(container, "x")) || 0;
        const wrappedX = Math.abs(wrapPengumumanOffset(currentX, loopDist));
        const progress = (wrappedX / loopDist) % 1;
        const activeIdx = Math.min(totalCards - 1, Math.floor(progress * totalCards));

        if (activeIdx !== activeCardIndexRef.current) {
          activeCardIndexRef.current = activeIdx;
          section.setAttribute("data-active-index", String(activeIdx));

          const bar = document.getElementById("pengumumanSwipeControls");
          if (bar) {
            const dots = bar.querySelectorAll<HTMLButtonElement>(".pengumuman-swipe-dot");
            dots.forEach((dot, idx) => {
              const isMatch = idx === activeIdx;
              dot.classList.toggle("is-active", isMatch);
              dot.setAttribute("aria-current", isMatch ? "true" : "false");
            });

            const counter = bar.querySelector<HTMLElement>("#pengumumanSwipeCounter");
            if (counter) {
              counter.textContent = `${activeIdx + 1} / ${totalCards}`;
            }
          }
        }
      };

      const syncSwipeControlsBar = (totalCards: number, activeIdx: number, visible: boolean) => {
        let bar = document.getElementById("pengumumanSwipeControls");
        if (!visible || totalCards <= 1) {
          if (bar) bar.style.display = "none";
          return;
        }

        if (!bar) {
          bar = document.createElement("div");
          bar.id = "pengumumanSwipeControls";
          bar.className = "pengumuman-swipe-bar";
          bar.setAttribute("aria-label", "Navigasi pengumuman");
          const trackWrap = document.getElementById("pengumumanTrackWrapper");
          if (trackWrap) {
            trackWrap.insertAdjacentElement("afterend", bar);
          } else {
            viewport.insertAdjacentElement("afterend", bar);
          }
        }

        bar.style.display = "flex";
        const clampedIdx = Math.max(0, Math.min(totalCards - 1, activeIdx));

        const dotsHtml = Array.from({ length: totalCards })
          .map(
            (_, idx) =>
              `<button type="button" class="pengumuman-swipe-dot${
                idx === clampedIdx ? " is-active" : ""
              }" data-swipe-dot="${idx}" aria-label="Pengumuman ${idx + 1}" aria-current="${
                idx === clampedIdx ? "true" : "false"
              }"></button>`
          )
          .join("");

        bar.innerHTML = `
          <div class="pengumuman-swipe-hint">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"></polyline></svg>
            <span>Geser kartu</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
          <div class="pengumuman-swipe-dots" role="tablist" aria-label="Indikator kartu pengumuman">
            ${dotsHtml}
          </div>
          <div class="pengumuman-swipe-nav-btns">
            <span class="pengumuman-swipe-counter" id="pengumumanSwipeCounter">${
              clampedIdx + 1
            } / ${totalCards}</span>
            <button type="button" class="pengumuman-swipe-btn" data-swipe-dir="prev" aria-label="Pengumuman sebelumnya">&#8249;</button>
            <button type="button" class="pengumuman-swipe-btn" data-swipe-dir="next" aria-label="Pengumuman berikutnya">&#8250;</button>
          </div>
        `;
      };

      const scheduleResume = (delayMs: number = PENGUMUMAN_AUTOSCROLL_CONFIG.touchResumeDelayMs) => {
        clearResumeTimer();
        resumeTimerRef.current = setTimeout(() => {
          if (!isTouchingRef.current && !isPointerInsideRef.current && isSectionInViewRef.current) {
            if (timelineRef.current) {
              section.setAttribute("data-autoscroll-state", "playing");
              timelineRef.current.play();
            }
          }
        }, delayMs);
      };

      const nudgeTrackByStride = (direction: "next" | "prev") => {
        const { stridePx } = getCardStrideAndPositions();
        const loopDist = loopDistanceRef.current;
        if (loopDist <= 0 || !timelineRef.current) return;

        clearResumeTimer();
        timelineRef.current.pause();
        section.setAttribute("data-autoscroll-state", "paused");

        const delta = direction === "next" ? -stridePx : stridePx;
        const currentX = Number(gsap.getProperty(container, "x")) || 0;
        const targetX = currentX + delta;

        gsap.to(container, {
          x: targetX,
          duration: 0.42,
          ease: "power2.out",
          force3D: true,
          onUpdate: () => {
            syncActiveDotAndCounter();
          },
          onComplete: () => {
            const finalX = Number(gsap.getProperty(container, "x")) || 0;
            const wrapped = wrapPengumumanOffset(finalX, loopDist);
            gsap.set(container, { x: wrapped });
            if (timelineRef.current && loopDist > 0) {
              const progress = (Math.abs(wrapped) / loopDist) % 1;
              timelineRef.current.progress(progress);
            }
            syncActiveDotAndCounter();
            scheduleResume(1600);
          }
        });
      };

      const jumpToCardIndex = (targetIdx: number) => {
        const { snapOffsets, totalCards } = getCardStrideAndPositions();
        const loopDist = loopDistanceRef.current;
        if (totalCards <= 0 || loopDist <= 0 || !timelineRef.current) return;

        clearResumeTimer();
        timelineRef.current.pause();
        section.setAttribute("data-autoscroll-state", "paused");

        const clampedIdx = Math.max(0, Math.min(totalCards - 1, targetIdx));
        const targetOffset = -(snapOffsets[clampedIdx] ?? 0);

        gsap.to(container, {
          x: targetOffset,
          duration: 0.48,
          ease: "power2.out",
          force3D: true,
          onUpdate: () => {
            syncActiveDotAndCounter();
          },
          onComplete: () => {
            if (timelineRef.current && loopDist > 0) {
              const progress = (Math.abs(targetOffset) / loopDist) % 1;
              timelineRef.current.progress(progress);
            }
            syncActiveDotAndCounter();
            scheduleResume(1600);
          }
        });
      };

      const buildOrUpdateAutoScroll = () => {
        if (isSyncingDomRef.current) return;
        isSyncingDomRef.current = true;

        try {
          clearResumeTimer();

          const prevX = Number(gsap.getProperty(container, "x")) || 0;
          const prevLoopDist = loopDistanceRef.current;

          if (timelineRef.current) {
            timelineRef.current.kill();
            timelineRef.current = null;
          }

          removeClones();

          const originalCards = getOriginalCards();
          const totalCards = originalCards.length;
          const viewportWidth = window.innerWidth || 1440;
          const prefersReduced =
            typeof window.matchMedia === "function" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

          const tier = getResponsiveMotionTier(viewportWidth, prefersReduced);
          const isMobileOrTablet = tier === "mobile" || tier === "tablet";
          const isDesktop = tier === "desktop";

          section.setAttribute("data-pengumuman-mode", isMobileOrTablet ? "mobile-tablet" : "desktop");
          section.setAttribute("data-pengumuman-count", String(totalCards));

          // If no cards or reduced motion requested, set static layout
          if (totalCards <= 1 || prefersReduced) {
            loopDistanceRef.current = 0;
            gsap.set(container, { x: 0, clearProps: "transform" });
            syncSwipeControlsBar(totalCards, 0, false);
            updateGradientIndicators();
            section.setAttribute("data-autoscroll-state", "idle");
            return;
          }

          // Clone cards for endless horizontal leftward loop on ALL devices (mobile, tablet, desktop)
          const fragment = document.createDocumentFragment();
          originalCards.forEach((card) => {
            const clone = card.cloneNode(true) as HTMLElement;
            clone.setAttribute("data-pengumuman-clone", "true");
            clone.removeAttribute("data-pengumuman-origin");
            clone.setAttribute("aria-hidden", "true");
            fragment.appendChild(clone);
          });
          container.appendChild(fragment);

          // Momentarily reset x to 0 to accurately measure layout offsets
          gsap.set(container, { x: 0, force3D: true });

          const firstOriginal = originalCards[0];
          const firstClone = container.querySelector<HTMLElement>(
            '.pengumuman-card[data-pengumuman-clone="true"]'
          );

          let measuredLoopDistance = 0;
          if (firstOriginal && firstClone) {
            measuredLoopDistance = firstClone.offsetLeft - firstOriginal.offsetLeft;
          }

          if (measuredLoopDistance <= 0) {
            const computedStyle = window.getComputedStyle(container);
            const gapPx =
              parseFloat(computedStyle.columnGap || computedStyle.gap || "20") || 20;
            const cardWidthPx = firstOriginal?.offsetWidth || 320;
            measuredLoopDistance = totalCards * (cardWidthPx + gapPx);
          }

          loopDistanceRef.current = measuredLoopDistance;
          const speedPxPerSecond = getPengumumanSpeedForTier(tier);
          const durationSec = measuredLoopDistance / Math.max(20, speedPxPerSecond);

          const wrappedStartX =
            prevLoopDist > 0
              ? wrapPengumumanOffset(prevX, measuredLoopDistance)
              : 0;

          // Infinite Leftward Conveyor Belt: x goes from 0 to -measuredLoopDistance
          const tl = gsap.timeline({
            paused: true,
            repeat: -1,
            defaults: { ease: "none" }
          });

          tl.fromTo(
            container,
            { x: 0 },
            {
              x: -measuredLoopDistance,
              duration: durationSec,
              ease: "none",
              force3D: true,
              onUpdate: () => {
                syncActiveDotAndCounter();
              }
            }
          );

          if (wrappedStartX < 0 && measuredLoopDistance > 0) {
            const preservedProgress = Math.min(
              0.9999,
              Math.max(0, Math.abs(wrappedStartX) / measuredLoopDistance)
            );
            tl.progress(preservedProgress);
          }

          timelineRef.current = tl;
          section.setAttribute("data-pengumuman-loop-px", String(Math.round(measuredLoopDistance)));

          // Show swipe bar for mobile and tablet
          syncSwipeControlsBar(totalCards, activeCardIndexRef.current, isMobileOrTablet);
          updateGradientIndicators();

          // Autoplay behavior:
          // On mobile & tablet: moves horizontally to the left automatically whenever section is in view!
          // On desktop: moves horizontally to the left, pausing when hovered so user can inspect cards easily.
          if (isMobileOrTablet) {
            if (isSectionInViewRef.current && !isTouchingRef.current) {
              section.setAttribute("data-autoscroll-state", "playing");
              tl.play();
            } else {
              section.setAttribute("data-autoscroll-state", "paused");
              tl.pause();
            }
          } else {
            // Desktop
            if (isPointerInsideRef.current) {
              section.setAttribute("data-autoscroll-state", "paused");
              tl.pause();
            } else if (isSectionInViewRef.current) {
              section.setAttribute("data-autoscroll-state", "playing");
              tl.play();
            } else {
              section.setAttribute("data-autoscroll-state", "idle");
              tl.pause();
            }
          }
        } finally {
          window.queueMicrotask(() => {
            isSyncingDomRef.current = false;
          });
        }
      };

      // Initial build
      buildOrUpdateAutoScroll();

      // =========================================================================
      // INTERSECTION OBSERVER: Pause when scrolled out of view, Play when visible
      // =========================================================================
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isSectionInViewRef.current = entry.isIntersecting;
            if (!timelineRef.current) return;

            if (entry.isIntersecting) {
              if (!isTouchingRef.current && !isPointerInsideRef.current) {
                section.setAttribute("data-autoscroll-state", "playing");
                timelineRef.current.play();
              }
            } else {
              timelineRef.current.pause();
              section.setAttribute("data-autoscroll-state", "off-screen");
            }
          });
        },
        { threshold: 0.15 }
      );
      observer.observe(section);

      // =========================================================================
      // DESKTOP HOVER INTERACTION: Pause on hover so user can read/click, Resume on leave
      // =========================================================================
      const handlePointerEnter = () => {
        const width = window.innerWidth || 1440;
        if (width <= 1024) return; // Touch/tablet handles touch events
        isPointerInsideRef.current = true;
        clearResumeTimer();

        if (timelineRef.current) {
          timelineRef.current.pause();
          section.setAttribute("data-autoscroll-state", "paused");
        }
      };

      const handlePointerLeave = () => {
        const width = window.innerWidth || 1440;
        if (width <= 1024) return;
        isPointerInsideRef.current = false;

        if (timelineRef.current && isSectionInViewRef.current && !isTouchingRef.current) {
          section.setAttribute("data-autoscroll-state", "playing");
          timelineRef.current.play();
        }
      };

      section.addEventListener("mouseenter", handlePointerEnter);
      section.addEventListener("mouseleave", handlePointerLeave);

      // =========================================================================
      // TOUCH & POINTER SWIPE / DRAG HANDLERS (Mobile, Tablet, and Touchscreens)
      // =========================================================================
      const startGesture = (clientX: number, clientY: number) => {
        isTouchingRef.current = true;
        clearResumeTimer();

        if (timelineRef.current) {
          timelineRef.current.pause();
          section.setAttribute("data-autoscroll-state", "touching");
        }

        const currentTransformX = Number(gsap.getProperty(container, "x")) || 0;
        gestureRef.current = {
          isTracking: true,
          isHorizontalSwipe: false,
          startX: clientX,
          startY: clientY,
          lastX: clientX,
          lastTimestamp: performance.now(),
          velocityPxPerMs: 0,
          startTransformX: currentTransformX,
          hasMovedSignificant: false
        };
      };

      const moveGesture = (clientX: number, clientY: number, ev?: Event) => {
        const g = gestureRef.current;
        if (!g.isTracking) return;

        const dx = clientX - g.startX;
        const dy = clientY - g.startY;

        if (!g.isHorizontalSwipe) {
          if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10) {
            // User is scrolling the page vertically — release horizontal swipe tracking
            g.isTracking = false;
            isTouchingRef.current = false;
            viewport.classList.remove("is-swiping");
            scheduleResume(1000);
            return;
          }
          if (Math.abs(dx) > 6 && Math.abs(dx) >= Math.abs(dy)) {
            g.isHorizontalSwipe = true;
            viewport.classList.add("is-swiping");
          }
        }

        if (g.isHorizontalSwipe) {
          if (ev && ev.cancelable) {
            ev.preventDefault();
          }

          if (Math.abs(dx) > 8) {
            g.hasMovedSignificant = true;
            isDraggingRef.current = true;
          }

          const now = performance.now();
          const dt = Math.max(1, now - g.lastTimestamp);
          const instantVx = (clientX - g.lastX) / dt;
          g.velocityPxPerMs = g.velocityPxPerMs * 0.4 + instantVx * 0.6;
          g.lastX = clientX;
          g.lastTimestamp = now;

          const rawX = g.startTransformX + dx;
          const loopDist = loopDistanceRef.current;
          const wrappedX = wrapPengumumanOffset(rawX, loopDist);

          gsap.set(container, { x: wrappedX, force3D: true });
          syncActiveDotAndCounter();
        }
      };

      const endGesture = (clientX: number) => {
        const g = gestureRef.current;
        if (!g.isTracking) {
          isTouchingRef.current = false;
          return;
        }

        g.isTracking = false;
        viewport.classList.remove("is-swiping");

        const wasHorizontal = g.isHorizontalSwipe;
        const hadMovement = g.hasMovedSignificant;

        if (hadMovement) {
          // Suppress accidental click events when completing a drag/swipe gesture
          setTimeout(() => {
            isDraggingRef.current = false;
          }, 240);
        } else {
          isDraggingRef.current = false;
        }

        if (wasHorizontal) {
          const loopDist = loopDistanceRef.current;
          const currentX = Number(gsap.getProperty(container, "x")) || 0;
          const velocity = g.velocityPxPerMs;

          // If fast flick, provide gentle momentum coasting before resuming
          if (Math.abs(velocity) > 0.28 && loopDist > 0) {
            const coastDistance = Math.max(-260, Math.min(260, velocity * 220));
            const targetX = currentX + coastDistance;

            gsap.to(container, {
              x: targetX,
              duration: 0.4,
              ease: "power2.out",
              force3D: true,
              onUpdate: () => {
                syncActiveDotAndCounter();
              },
              onComplete: () => {
                const finalX = Number(gsap.getProperty(container, "x")) || 0;
                const wrapped = wrapPengumumanOffset(finalX, loopDist);
                gsap.set(container, { x: wrapped });
                if (timelineRef.current && loopDist > 0) {
                  const progress = (Math.abs(wrapped) / loopDist) % 1;
                  timelineRef.current.progress(progress);
                }
                syncActiveDotAndCounter();
                isTouchingRef.current = false;
                scheduleResume(PENGUMUMAN_AUTOSCROLL_CONFIG.touchResumeDelayMs);
              }
            });
            return;
          }

          // Otherwise sync progress immediately
          const wrapped = wrapPengumumanOffset(currentX, loopDist);
          gsap.set(container, { x: wrapped });
          if (timelineRef.current && loopDist > 0) {
            const progress = (Math.abs(wrapped) / loopDist) % 1;
            timelineRef.current.progress(progress);
          }
          syncActiveDotAndCounter();
        }

        isTouchingRef.current = false;
        scheduleResume(PENGUMUMAN_AUTOSCROLL_CONFIG.touchResumeDelayMs);
      };

      const onTouchStart = (e: TouchEvent) => {
        if (e.touches.length !== 1) return;
        const t = e.touches[0];
        startGesture(t.clientX, t.clientY);
      };

      const onTouchMove = (e: TouchEvent) => {
        if (e.touches.length !== 1) return;
        const t = e.touches[0];
        moveGesture(t.clientX, t.clientY, e);
      };

      const onTouchEnd = (e: TouchEvent) => {
        const t = e.changedTouches[0];
        endGesture(t ? t.clientX : gestureRef.current.lastX);
      };

      const onPointerDown = (e: PointerEvent) => {
        if (e.pointerType === "touch") return; // Touch handled by touchstart
        const width = window.innerWidth || 1440;
        if (width <= 1024 && e.button === 0) {
          const targetEl = e.target as HTMLElement | null;
          if (targetEl && targetEl.closest("button, a")) return;
          startGesture(e.clientX, e.clientY);
        }
      };

      const onPointerMove = (e: PointerEvent) => {
        if (!gestureRef.current.isTracking || e.pointerType === "touch") return;
        moveGesture(e.clientX, e.clientY, e);
      };

      const onPointerUp = (e: PointerEvent) => {
        if (!gestureRef.current.isTracking || e.pointerType === "touch") return;
        endGesture(e.clientX);
      };

      // Suppress click events when user was dragging/swiping
      const onContainerClickCapture = (e: MouseEvent) => {
        if (isDraggingRef.current) {
          e.preventDefault();
          e.stopPropagation();
        }
      };

      // Handle pagination dots or Prev/Next navigation clicks
      const onSectionClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement | null;
        if (!target) return;

        const dotBtn = target.closest<HTMLButtonElement>("[data-swipe-dot]");
        if (dotBtn) {
          const idx = Number(dotBtn.getAttribute("data-swipe-dot"));
          if (Number.isFinite(idx)) {
            jumpToCardIndex(idx);
          }
          return;
        }

        const dirBtn = target.closest<HTMLButtonElement>("[data-swipe-dir]");
        if (dirBtn) {
          const dir = dirBtn.getAttribute("data-swipe-dir") as "prev" | "next";
          nudgeTrackByStride(dir);
        }
      };

      viewport.addEventListener("touchstart", onTouchStart, { passive: true });
      viewport.addEventListener("touchmove", onTouchMove, { passive: false });
      viewport.addEventListener("touchend", onTouchEnd, { passive: true });
      viewport.addEventListener("touchcancel", onTouchEnd, { passive: true });
      viewport.addEventListener("pointerdown", onPointerDown, { passive: true });
      window.addEventListener("pointermove", onPointerMove, { passive: false });
      window.addEventListener("pointerup", onPointerUp, { passive: true });
      container.addEventListener("click", onContainerClickCapture, { capture: true });
      section.addEventListener("click", onSectionClick);

      // Re-calculate bounds dynamically when announcements are updated via CMS/API
      const handlePengumumanUpdated = () => {
        buildOrUpdateAutoScroll();
      };
      window.addEventListener("pengumuman:updated", handlePengumumanUpdated);

      // Observe external DOM changes to #pengumumanContainer
      const mutationObserver = new MutationObserver((mutations) => {
        if (isSyncingDomRef.current) return;
        const hasExternalChildChange = mutations.some((m) => m.type === "childList");
        if (hasExternalChildChange) {
          buildOrUpdateAutoScroll();
        }
      });
      mutationObserver.observe(container, { childList: true });

      // Observe viewport resize
      let resizeRaf = 0;
      const handleResize = () => {
        if (resizeRaf) window.cancelAnimationFrame(resizeRaf);
        resizeRaf = window.requestAnimationFrame(() => {
          buildOrUpdateAutoScroll();
        });
      };
      window.addEventListener("resize", handleResize, { passive: true });

      return () => {
        clearResumeTimer();
        observer.disconnect();
        section.removeEventListener("mouseenter", handlePointerEnter);
        section.removeEventListener("mouseleave", handlePointerLeave);
        section.removeEventListener("click", onSectionClick);
        viewport.removeEventListener("touchstart", onTouchStart);
        viewport.removeEventListener("touchmove", onTouchMove);
        viewport.removeEventListener("touchend", onTouchEnd);
        viewport.removeEventListener("touchcancel", onTouchEnd);
        viewport.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        container.removeEventListener("click", onContainerClickCapture, { capture: true });
        window.removeEventListener("pengumuman:updated", handlePengumumanUpdated);
        window.removeEventListener("resize", handleResize);
        if (resizeRaf) window.cancelAnimationFrame(resizeRaf);
        mutationObserver.disconnect();
        if (timelineRef.current) {
          timelineRef.current.kill();
          timelineRef.current = null;
        }
        removeClones();
        gsap.set(container, { clearProps: "transform" });
      };
    },
    { scope: scopeRef }
  );

  return null;
};
