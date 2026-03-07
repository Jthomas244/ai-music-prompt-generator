"use client";

interface PlatformToggleProps {
  sunoMode: boolean;
  onChange: (sunoMode: boolean) => void;
  accentColor?: string;
}

export function PlatformToggle({
  sunoMode,
  onChange,
  accentColor = "#8B5CF6",
}: PlatformToggleProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="section-label">Platform</span>
      <div className="flex items-center rounded-full border border-border p-0.5 bg-surface">
        <button
          onClick={() => onChange(true)}
          className="relative px-4 py-1.5 text-xs font-mono font-bold rounded-full transition-all duration-200 focus:outline-none"
          style={
            sunoMode
              ? {
                  background: accentColor,
                  color: "#0A0A0F",
                }
              : {
                  color: "#707080",
                }
          }
        >
          SUNO
        </button>
        <button
          onClick={() => onChange(false)}
          className="relative px-4 py-1.5 text-xs font-mono font-bold rounded-full transition-all duration-200 focus:outline-none"
          style={
            !sunoMode
              ? {
                  background: "rgba(255,255,255,0.12)",
                  color: "#E8E8ED",
                }
              : {
                  color: "#707080",
                }
          }
        >
          AGNOSTIC
        </button>
      </div>
      <span className="text-xs text-muted">
        {sunoMode ? "Optimized for Suno" : "Works on any platform"}
      </span>
    </div>
  );
}
