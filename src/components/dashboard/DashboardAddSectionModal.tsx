"use client";

import { motion } from "framer-motion";
import { availableSections, Section, SectionType } from "@/lib/sections";
import { SectionIcon } from "@/components/builder/SortableSection";

interface DashboardAddSectionModalProps {
  open: boolean;
  sections: Section[];
  onClose: () => void;
  onAdd: (type: SectionType, label: string, icon: string) => void;
}

export default function DashboardAddSectionModal({
  open,
  sections,
  onClose,
  onAdd,
}: DashboardAddSectionModalProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/30 px-4"
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-section-title"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-md rounded-lg border border-rule bg-white text-ink shadow-[0_12px_32px_rgba(20,20,20,0.12)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-rule px-5 py-4">
          <div>
            <h2 id="add-section-title" className="font-display text-lg font-semibold tracking-tight">
              Add a section
            </h2>
            <p className="mt-0.5 text-xs text-ink-soft">
              New sections are added at the bottom.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="-mr-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-soft hover:bg-paper hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/15"
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="h-3.5 w-3.5">
              <path d="M4 4l8 8 M12 4l-8 8" />
            </svg>
          </button>
        </div>
        <ul className="max-h-[60vh] overflow-y-auto py-1">
          {availableSections.map((section) => {
            const exists =
              section.type !== "custom" &&
              sections.some((item) => item.type === section.type);
            return (
              <li key={section.type}>
                <button
                  type="button"
                  disabled={exists}
                  onClick={() => onAdd(section.type, section.label, section.icon)}
                  className={`flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink/15 ${exists ? "cursor-not-allowed text-[#9a9aa0]" : "text-ink hover:bg-paper"}`}
                >
                  <span className={exists ? "" : "text-ink-soft"}>
                    <SectionIcon type={section.type} label={section.label} />
                  </span>
                  <span className="flex-1 text-sm">{section.label}</span>
                  <span className="text-xs text-ink-soft">
                    {exists ? "Added" : "Add"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </motion.div>
    </div>
  );
}
