"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Section } from "@/lib/sections";

interface Props {
  activeSection: Section | null;
  field: React.ReactNode;
  saveMsg: string;
  saveStatus: string;
  listData: any[];
  showAllItems: boolean;
  saving: boolean;
  saveLabel: string;
  savingLabel: string;
  normalizeCustomTitle: (value?: string) => string;
  typedSectionMap: Record<string, string>;
  onClose: () => void;
  onSave: () => void;
  onEditStored: (item: any) => void;
  onDeleteStored: (item: any) => void;
  onToggleItems: () => void;
}

export default function DashboardEditorPanel({
  activeSection,
  field,
  saveMsg,
  saveStatus,
  listData,
  showAllItems,
  saving,
  saveLabel,
  savingLabel,
  normalizeCustomTitle,
  typedSectionMap,
  onClose,
  onSave,
  onEditStored,
  onDeleteStored,
  onToggleItems,
}: Props) {
  if (!activeSection) return null;
  const sectionTitle = normalizeCustomTitle(activeSection.label);
  const displayData =
    activeSection.type.split("-")[0] === "custom"
      ? listData.filter(
          (item) =>
            normalizeCustomTitle(item.title) === sectionTitle ||
            item.type === typedSectionMap[sectionTitle],
        )
      : listData;
  const visibleItems = showAllItems ? displayData : displayData.slice(0, 3);
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{activeSection.icon || "✦"}</span>
          <h2 className="text-xl font-bold text-white">
            {activeSection.label}
          </h2>
        </div>
        <button
          type="button"
          aria-label="Close editor"
          onClick={onClose}
          className="text-xl text-slate-400 hover:text-white"
        >
          ×
        </button>
      </div>
      <AnimatePresence>
        {saveMsg && (
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            className={`mb-4 rounded-xl border p-3 text-sm ${saveStatus === "success" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-red-500/30 bg-red-500/10 text-red-300"}`}
          >
            {saveMsg}
          </motion.div>
        )}
      </AnimatePresence>
      {field || (
        <p className="text-sm text-slate-500">
          No editor for this section yet.
        </p>
      )}
      {displayData.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-slate-300">
            Saved items ({displayData.length})
          </h3>
          <div className="space-y-2">
            {visibleItems.map((item) => {
              const content =
                typeof item.content === "string"
                  ? JSON.parse(item.content)
                  : item.content || {};
              const title =
                content.institution ||
                content.name ||
                content.language ||
                content.area ||
                content.title ||
                content.body ||
                "Item";
              const description =
                content.degree ||
                content.issuer ||
                content.proficiency ||
                content.description ||
                content.start_date?.slice(0, 7) ||
                "";
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/60 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {title}
                    </p>
                    {description && (
                      <p className="truncate text-xs text-slate-500">
                        {description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onEditStored(item)}
                      className="text-xs text-purple-300 hover:text-white"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteStored(item)}
                      className="text-xs text-red-300 hover:text-white"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {displayData.length > 3 && (
            <button
              type="button"
              onClick={onToggleItems}
              className="mt-3 text-sm text-purple-300 hover:text-white"
            >
              {showAllItems
                ? "Show less"
                : `Show more (${displayData.length - 3})`}
            </button>
          )}
        </div>
      )}
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm text-slate-300 hover:bg-white/10"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex-1 rounded-xl bg-purple-500 py-2.5 text-sm font-medium text-white hover:bg-purple-400 disabled:opacity-50"
        >
          {saving ? savingLabel : saveLabel}
        </button>
      </div>
    </div>
  );
}
