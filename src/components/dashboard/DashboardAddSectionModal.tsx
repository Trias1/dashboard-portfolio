"use client";

import { motion } from "framer-motion";
import { availableSections, Section } from "@/lib/sections";

interface DashboardAddSectionModalProps {
  open: boolean;
  lang: "id" | "en";
  sections: Section[];
  onClose: () => void;
  onAdd: (type: any, label: string, icon: string) => void;
}

export default function DashboardAddSectionModal({
  open,
  lang,
  sections,
  onClose,
  onAdd,
}: DashboardAddSectionModalProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-2xl shadow-purple-950/40"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-purple-300">
              Builder
            </p>
            <h2 className="text-lg font-semibold text-white">
              {lang === "id" ? "Tambah Section" : "Add Section"}
            </h2>
            <p className="text-xs text-slate-500">
              {lang === "id"
                ? "Pilih bagian yang ingin ditambahkan."
                : "Choose a section to add."}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close add section modal"
            onClick={onClose}
            className="h-9 w-9 rounded-xl border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            ×
          </button>
        </div>
        <div className="grid gap-2">
          {availableSections.map((section) => {
            const exists =
              section.type !== "custom" &&
              sections.some((item) => item.type === section.type);
            return (
              <button
                key={section.type}
                type="button"
                disabled={exists}
                onClick={() => onAdd(section.type, section.label, section.icon)}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${exists ? "cursor-not-allowed border-white/5 bg-white/[0.02] text-slate-600" : "border-white/10 bg-white/5 text-white hover:border-purple-400/60 hover:bg-purple-500/10"}`}
              >
                <span className="flex items-center gap-3">
                  <span aria-hidden="true">{section.icon || "✦"}</span>
                  <span className="text-sm font-medium">{section.label}</span>
                </span>
                <span className="text-xs text-slate-500">
                  {exists ? (lang === "id" ? "Sudah ada" : "Added") : "+"}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
