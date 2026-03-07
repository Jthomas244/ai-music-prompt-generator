"use client";

import { clsx } from "clsx";

interface ChipSelectorProps<T extends { id: string; label: string }> {
  items: T[];
  selected: string[];
  onToggle: (id: string) => void;
  accentColor?: string;
  max?: number;
  renderBadge?: (item: T) => React.ReactNode;
}

export function ChipSelector<T extends { id: string; label: string }>({
  items,
  selected,
  onToggle,
  accentColor = "#8B5CF6",
  max,
  renderBadge,
}: ChipSelectorProps<T>) {
  const isSelected = (id: string) => selected.includes(id);
  const isDisabled = (id: string) =>
    max !== undefined && selected.length >= max && !isSelected(id);

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const active = isSelected(item.id);
        const disabled = isDisabled(item.id);

        return (
          <button
            key={item.id}
            onClick={() => !disabled && onToggle(item.id)}
            disabled={disabled}
            className={clsx(
              "relative px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150",
              "border focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20",
              disabled && !active && "opacity-30 cursor-not-allowed",
              !active && !disabled && "border-border text-secondary hover:text-primary hover:border-border-strong bg-surface hover:bg-surface-hover",
            )}
            style={
              active
                ? {
                    borderColor: `${accentColor}80`,
                    background: `${accentColor}20`,
                    color: accentColor,
                    boxShadow: `0 0 12px ${accentColor}20`,
                  }
                : undefined
            }
          >
            {item.label}
            {renderBadge && renderBadge(item)}
          </button>
        );
      })}
    </div>
  );
}
