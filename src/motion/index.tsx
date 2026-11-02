import React from "react";
import { createRoot } from "react-dom/client";
import { StickyStorytellingSection } from "./StickyStorytellingSection";
import { SpmbFaqAccordion } from "./SpmbFaqAccordion";
import { GridoraMotionOrchestrator } from "./GridoraMotionOrchestrator";
import { PengumumanAutoScroll } from "./PengumumanAutoScroll";

function mountGridoraMotionExperience() {
  // 1. Mount Sticky Scroll Storytelling React + GSAP Component
  const storyMount = document.getElementById("gridoraStickyStoryRoot");
  if (storyMount && !storyMount.dataset.mounted) {
    storyMount.dataset.mounted = "true";
    createRoot(storyMount).render(
      <React.StrictMode>
        <StickyStorytellingSection />
      </React.StrictMode>
    );
  }

  // 2. Mount Smooth SPMB FAQ Accordion React + GSAP Component
  const faqMount = document.getElementById("gridoraFaqAccordionRoot");
  if (faqMount && !faqMount.dataset.mounted) {
    faqMount.dataset.mounted = "true";
    createRoot(faqMount).render(
      <React.StrictMode>
        <SpmbFaqAccordion />
      </React.StrictMode>
    );
  }

  // 3. Mount Top-Level GSAP + ScrollTrigger Page Orchestrator & Pengumuman Auto-Scroll Controller
  let orchestratorMount = document.getElementById("gridoraMotionOrchestratorRoot");
  if (!orchestratorMount) {
    orchestratorMount = document.createElement("div");
    orchestratorMount.id = "gridoraMotionOrchestratorRoot";
    orchestratorMount.setAttribute("aria-hidden", "true");
    document.body.appendChild(orchestratorMount);
  }
  if (!orchestratorMount.dataset.mounted) {
    orchestratorMount.dataset.mounted = "true";
    createRoot(orchestratorMount).render(
      <React.StrictMode>
        <GridoraMotionOrchestrator />
        <PengumumanAutoScroll />
      </React.StrictMode>
    );
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountGridoraMotionExperience);
} else {
  mountGridoraMotionExperience();
}
