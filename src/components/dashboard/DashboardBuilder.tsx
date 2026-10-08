"use client";

import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
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
  sensors: any;
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
  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-slate-950 md:flex-row md:overflow-hidden">
      <aside className="flex max-h-[50vh] w-full shrink-0 flex-col border-b border-white/10 bg-slate-950/80 md:max-h-none md:w-64 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            {lang === "id" ? "Bagian" : "Sections"}
          </h3>
          <button
            type="button"
            onClick={() => setShowAddSection(true)}
            className="rounded-lg bg-purple-500 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-purple-400"
          >
            + {lang === "id" ? "Tambah" : "Add"}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
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
              <div className="space-y-2">
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
        <p className="border-t border-white/10 px-3 py-2 text-center text-xs text-slate-600">
          {lang === "id" ? "Seret untuk mengatur urutan" : "Drag to reorder"}
        </p>
      </aside>
      {activeSection && (
        <section className="w-full shrink-0 overflow-y-auto border-b border-white/10 bg-slate-900/70 p-5 md:w-80 md:border-b-0 md:border-r">
          {editor}
        </section>
      )}
      <section className="flex min-h-[70vh] min-w-0 flex-1 flex-col overflow-hidden md:min-h-0">
        {preview}
      </section>
    </div>
  );
}
