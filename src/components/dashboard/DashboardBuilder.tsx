"use client";

import { DndContext, closestCenter, DragEndEvent, useSensors } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableSection from "@/components/builder/SortableSection";
import { Section } from "@/lib/sections";

interface DashboardBuilderProps {
  lang: "id" | "en";
  sections: Section[];
  activeSection: Section | null;
  sensors: ReturnType<typeof useSensors>;
  setShowAddSection: (open: boolean) => void;
  setActiveSection: (section: Section | null) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  editor: React.ReactNode;
  preview: React.ReactNode;
}

export default function DashboardBuilder({
  lang,
  sections,
  activeSection,
  sensors,
  setShowAddSection,
  setActiveSection,
  onDragEnd,
  onToggle,
  onDelete,
  editor,
  preview,
}: DashboardBuilderProps) {
  const visibleCount = sections.filter((section) => section.enabled).length;
  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-paper text-ink md:flex-row md:overflow-hidden">
      <aside className="flex max-h-[50vh] w-full shrink-0 flex-col border-b border-rule bg-paper md:max-h-none md:w-64 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between gap-2 border-b border-rule px-3 py-2.5">
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-ink">
              {lang === "id" ? "Bagian halaman" : "Page sections"}
            </h3>
            <p className="font-mono text-[11px] text-ink-soft">
              {visibleCount}/{sections.length} {lang === "id" ? "tampil" : "shown"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddSection(true)}
            className="inline-flex shrink-0 items-center gap-1 rounded-md border border-rule bg-white px-2 py-1 text-xs font-medium text-ink transition-colors hover:border-ink-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/15"
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="h-3 w-3">
              <path d="M8 3v10 M3 8h10" />
            </svg>
            {lang === "id" ? "Tambah" : "Add"}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <DndContext
            id="dashboard-dnd"
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={sections.map((section) => section.id)}
              strategy={verticalListSortingStrategy}
            >
              <div>
                {sections.map((section) => (
                  <SortableSection
                    key={section.id}
                    section={section}
                    onToggle={onToggle}
                    onEdit={setActiveSection}
                    onDelete={onDelete}
                    isActive={activeSection?.id === section.id}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
        <p className="border-t border-rule px-3 py-2 text-xs text-ink-soft">
          {lang === "id"
            ? "Seret titik di kiri untuk mengubah urutan."
            : "Drag the handle on the left to reorder."}
        </p>
      </aside>
      {activeSection && (
        // Below xl there isn't room for list + editor + preview, so the editor takes the space
        // and the preview comes back when the editor closes.
        <section className="w-full overflow-y-auto border-b border-rule bg-white p-5 md:min-w-0 md:flex-1 md:border-b-0 md:border-r xl:w-96 xl:flex-none xl:shrink-0">
          {editor}
        </section>
      )}
      <section className={`${activeSection ? "hidden xl:flex" : "flex"} min-h-[70vh] min-w-0 flex-1 flex-col overflow-hidden md:min-h-0`}>
        {preview}
      </section>
    </div>
  );
}
