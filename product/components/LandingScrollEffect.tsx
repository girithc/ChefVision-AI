"use client";

import { useEffect } from "react";

export default function LandingScrollEffect() {
  useEffect(() => {
    const mockup = document.getElementById("dashboardMockup");
    const productSection = document.getElementById("product");

    if (!mockup || !productSection) {
      return;
    }

    const handleScrollZoom = () => {
      const rect = productSection.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const startPoint = windowHeight * 0.92;
      const endPoint = windowHeight * 0.18;

      let progress = (startPoint - rect.top) / (startPoint - endPoint);
      progress = Math.max(0, Math.min(1, progress));

      const minScale = 0.7;
      const maxScale = 1;
      const currentScale = minScale + (maxScale - minScale) * progress;
      const currentTilt = 9 * (1 - progress);
      const shadowSpread = 18 + progress * 24;
      const shadowBlur = 35 + progress * 30;
      const alpha = 0.16 + 0.16 * progress;

      mockup.style.transform = `rotateX(${currentTilt.toFixed(2)}deg) scale(${currentScale.toFixed(3)})`;
      mockup.style.boxShadow =
        `0 ${shadowSpread.toFixed(0)}px ${shadowBlur.toFixed(0)}px -12px rgba(16, 185, 129, ${alpha.toFixed(2)}), ` +
        "0 0 0 1px rgba(255, 255, 255, 0.95)";
    };

    let ticking = false;

    const requestZoomUpdate = () => {
      if (ticking) {
        return;
      }

      ticking = true;
      window.requestAnimationFrame(() => {
        handleScrollZoom();
        ticking = false;
      });
    };

    handleScrollZoom();
    window.addEventListener("scroll", requestZoomUpdate, { passive: true });
    window.addEventListener("resize", requestZoomUpdate);

    return () => {
      window.removeEventListener("scroll", requestZoomUpdate);
      window.removeEventListener("resize", requestZoomUpdate);
    };
  }, []);

  return null;
}
