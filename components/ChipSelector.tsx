"use client";

import { motion, useReducedMotion } from "framer-motion";

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
  const prefersReducedMotion = useReducedMotion();
  const isSelected = (id: string) => selected.includes(id);
  const isDisabled = (id: string) =>
    max !== undefined && selected.length >= max && !isSelected(id);

  return (
    <motion.div
      className="flex flex-wrap gap-2"
      initial={prefersReducedMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.04 } },
      }}
    >
      {items.map((item) => {
        const active = isSelected(item.id);
        const disabled = isDisabled(item.id);

        return (
          <motion.div
            key={item.id}
            variants={{
              hidden: { opacity: 0, y: 8 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.28 } },
            }}
          >
            <motion.button
              onClick={() => !disabled && onToggle(item.id)}
              disabled={disabled}
              whileTap={prefersReducedMotion || disabled ? undefined : { scale: 0.92 }}
              whileHover={prefersReducedMotion || disabled ? undefined : { y: -1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="relative font-medium transition-colors duration-150 border focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
              style={{
                /* 44px min tap target on mobile */
                minHeight: "44px",
                padding: "0 12px",
                borderRadius: "9999px",
                fontSize: "0.875rem",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                ...(active
                  ? {
                      borderColor: `${accentColor}80`,
                      background: `${accentColor}22`,
                      color: accentColor,
                      boxShadow: `0 0 12px ${accentColor}20`,
                    }
                  : disabled
                  ? {
                      borderColor: "rgba(255,255,255,0.06)",
                      background: "rgba(255,255,255,0.02)",
                      color: "#707080",
                      opacity: 0.35,
                      cursor: "not-allowed",
                    }
                  : {
                      borderColor: "rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.03)",
                      color: "#A8A8BC",
                    }),
              }}
            >
              {item.label}
              {renderBadge && renderBadge(item)}
            </motion.button>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
