"use client";

export interface ProgressStep {
  label: string;
  done: boolean;
  sectionId: string;
}

export function MobileProgressDots({
  steps,
  accentColor,
}: {
  steps: ProgressStep[];
  accentColor: string;
}) {
  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 py-2.5 md:hidden"
      aria-hidden="true"
      style={{
        background: "rgba(20, 20, 32, 0.88)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {steps.map((step, i) => (
        <button
          key={i}
          title={`Go to ${step.label}`}
          onClick={() => scrollTo(step.sectionId)}
          className="rounded-full transition-all duration-300 focus:outline-none"
          style={{
            width: step.done ? 22 : 8,
            height: 8,
            background: step.done ? accentColor : "rgba(255,255,255,0.15)",
          }}
        />
      ))}
    </div>
  );
}
