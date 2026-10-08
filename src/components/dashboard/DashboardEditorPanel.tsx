"use client";

import { Section } from "@/lib/sections";
import type { CustomSectionContent, StoredSectionItem } from "@/types";

interface Props {
  activeSection: Section | null;
  field: React.ReactNode;
  saveMsg: string;
  saveStatus: string;
  listData: StoredSectionItem[];
  showAllItems: boolean;
  saving: boolean;
  saveLabel: string;
  savingLabel: string;
  normalizeCustomTitle: (value?: string) => string;
  typedSectionMap: Record<string, string>;
  onClose: () => void;
  onSave: () => void;
  onEditStored: (item: StoredSectionItem) => void;
  onDeleteStored: (item: StoredSectionItem) => void;
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
  const isSuccess = saveStatus === "success";
  return (
    <div className="font-sans text-ink">
      <div className="mb-5 flex items-start justify-between gap-4 border-b border-rule pb-4">
        <div className="min-w-0">
          <p className="text-xs text-ink-soft">Edit section</p>
          <h2 className="mt-0.5 truncate text-lg font-semibold tracking-tight text-ink">
            {activeSection.label}
          </h2>
        </div>
        <button
          type="button"
          aria-label="Close editor"
          onClick={onClose}
          className="-mr-1 rounded-md p-1.5 text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      {saveMsg && (
        <div
          role={isSuccess ? "status" : "alert"}
          className={`mb-4 rounded-md border px-3 py-2.5 text-sm ${isSuccess ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-red-300 bg-red-50 text-red-800"}`}
        >
          {saveMsg}
        </div>
      )}
      {field || (
        <p className="text-sm text-ink-soft">
          No editor for this section yet.
        </p>
      )}
      {displayData.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-2 flex items-baseline justify-between text-xs font-medium text-ink-soft">
            <span>Saved items</span>
            <span className="font-mono tabular-nums">{displayData.length}</span>
          </h3>
          <ul className="divide-y divide-rule border-y border-rule">
            {visibleItems.map((item) => {
              const content: CustomSectionContent =
                typeof item.content === "string"
                  ? JSON.parse(item.content)
                  : item.content || {};
              // Custom sections keep their fields in `content`; regular sections (experience,
              // projects, skills, ...) keep them on the row itself.
              const title =
                content.institution ||
                content.name ||
                content.language ||
                content.area ||
                content.title ||
                content.body ||
                item.company ||
                item.title ||
                item.name ||
                "Item";
              const description =
                content.degree ||
                content.issuer ||
                content.proficiency ||
                content.description ||
                content.start_date?.slice(0, 7) ||
                item.position ||
                item.start_date?.slice(0, 7) ||
                "";
              return (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-4 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {title}
                    </p>
                    {description && (
                      <p className="truncate text-xs text-ink-soft">
                        {description}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => onEditStored(item)}
                      className="text-ink-soft underline-offset-2 hover:text-ink hover:underline focus-visible:outline-none focus-visible:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteStored(item)}
                      className="text-red-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:underline"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          {displayData.length > 3 && (
            <button
              type="button"
              onClick={onToggleItems}
              className="mt-2 text-xs font-medium text-accent hover:text-accent-dark hover:underline"
            >
              {showAllItems
                ? "Show less"
                : `Show more (${displayData.length - 3})`}
            </button>
          )}
        </div>
      )}
      <div className="mt-8 flex justify-end gap-2 border-t border-rule pt-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-rule bg-white px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:border-ink-soft"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-md bg-ink px-3.5 py-2 text-sm font-medium text-paper transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? savingLabel : saveLabel}
        </button>
      </div>
    </div>
  );
}
