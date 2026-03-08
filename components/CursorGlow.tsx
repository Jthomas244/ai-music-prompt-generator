"use client";

import { useEffect, useRef } from "react";

export function CursorGlow({ accentColor }: { accentColor: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Only on devices that support hover (non-touch)
    if (window.matchMedia("(hover: none)").matches) return;

    let rafId: number;
    let targetX = -1000;
    let targetY = -1000;
    let currentX = -1000;
    let currentY = -1000;

    function onMove(e: MouseEvent) {
      targetX = e.clientX;
      targetY = e.clientY;
    }

    function animate() {
      // Gentle lerp for a lagging, organic follow
      currentX += (targetX - currentX) * 0.07;
      currentY += (targetY - currentY) * 0.07;
      if (ref.current) {
        ref.current.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
      }
      rafId = requestAnimationFrame(animate);
    }

    document.addEventListener("mousemove", onMove, { passive: true });
    rafId = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="fixed pointer-events-none z-0 rounded-full hidden md:block"
      aria-hidden="true"
      style={{
        width: 480,
        height: 480,
        top: 0,
        left: 0,
        background: `radial-gradient(circle, ${accentColor}0C 0%, transparent 68%)`,
        willChange: "transform",
        transition: "background 0.8s ease",
      }}
    />
  );
}
