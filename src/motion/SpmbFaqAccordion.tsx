import React, { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { FAQ_ITEMS } from "./motionConfig";

gsap.registerPlugin(useGSAP);

export const SpmbFaqAccordion: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0].id);
  const panelRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const iconRefs = useRef<Record<string, SVGSVGElement | null>>({});

  const { contextSafe } = useGSAP({ scope: containerRef });

  const toggleFaq = contextSafe((id: string) => {
    const nextOpenId = openId === id ? null : id;
    setOpenId(nextOpenId);

    FAQ_ITEMS.forEach((item) => {
      const panel = panelRefs.current[item.id];
      const icon = iconRefs.current[item.id];
      const isExpand = item.id === nextOpenId;

      if (panel) {
        if (isExpand) {
          gsap.fromTo(
            panel,
            { height: 0, opacity: 0 },
            {
              height: "auto",
              opacity: 1,
              duration: 0.42,
              ease: "power3.out",
              overwrite: "auto"
            }
          );
        } else {
          gsap.to(panel, {
            height: 0,
            opacity: 0,
            duration: 0.32,
            ease: "power2.inOut",
            overwrite: "auto"
          });
        }
      }

      if (icon) {
        gsap.to(icon, {
           rotate: isExpand ? 180 : 0,
          duration: 0.36,
          ease: "power3.out",
          overwrite: "auto"
        });
      }
    });
  });

  return (
    <div ref={containerRef} className="gridora-faq-block" aria-label="Pertanyaan Umum SPMB">
      <div className="gridora-subheader-row" style={{ marginBottom: "1.25rem" }}>
        <div>
          <span className="gridora-card-kicker">TANYA JAWAB ORANG TUA / WALI</span>
          <h3 className="gridora-subheading">Informasi Penting Seputar SPMB &amp; Pembelajaran</h3>
        </div>
      </div>

      <div className="gridora-faq-list">
        {FAQ_ITEMS.map((item) => {
          const isOpen = openId === item.id;
          const panelId = `faq-panel-${item.id}`;
          const btnId = `faq-btn-${item.id}`;
          return (
            <div
              key={item.id}
              className={`gridora-faq-item ${isOpen ? "is-open" : ""}`}
            >
              <button
                id={btnId}
                type="button"
                className="gridora-faq-trigger"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggleFaq(item.id)}
              >
                <div className="gridora-faq-trigger-text">
                  <span className="gridora-faq-category">{item.category}</span>
                  <span className="gridora-faq-question">{item.question}</span>
                </div>
                <span className="gridora-faq-icon-wrap" aria-hidden="true">
                  <svg
                    ref={(el) => {
                      iconRefs.current[item.id] = el;
                    }}
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </span>
              </button>

              <div
                id={panelId}
                role="region"
                aria-labelledby={btnId}
                ref={(el) => {
                  panelRefs.current[item.id] = el;
                }}
                className="gridora-faq-panel"
                style={{
                  height: isOpen ? "auto" : 0,
                  opacity: isOpen ? 1 : 0,
                  overflow: "hidden"
                }}
              >
                <div className="gridora-faq-answer">
                  <p>{item.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
