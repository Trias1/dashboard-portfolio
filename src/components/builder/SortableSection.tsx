"use client";

import { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Section } from "@/lib/sections";

interface Props {
  section: Section;
  onToggle: (id: string) => void;
  onEdit: (section: Section) => void;
  onDelete: (id: string) => void;
  isActive?: boolean;
}

export default function SortableSection({
  section,
  onToggle,
  onEdit,
  onDelete,
  isActive,
}: Props) {
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpenMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onEdit(section)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onEdit(section);
      }}
      className={`relative flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all ${
        isDragging
          ? "border-purple-500 bg-purple-900/30"
          : isActive
            ? "border-purple-500/50 bg-purple-900/20"
            : "border-purple-900/20 bg-[#0f0f2a] hover:border-purple-700/40"
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        onClick={(event) => event.stopPropagation()}
        className="text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing flex-shrink-0 text-base"
        aria-label="Reorder section"
      >
        =
      </button>

      <span className="flex-shrink-0 text-base">{section.icon}</span>

      <span
        className={`flex-1 text-sm font-medium truncate ${
          section.enabled ? "text-white" : "text-gray-500"
        }`}
      >
        {section.label}
      </span>

      <button
        onClick={(event) => {
          event.stopPropagation();
          onToggle(section.id);
        }}
        className={`flex-shrink-0 rounded-full transition-all relative ${
          section.enabled ? "bg-purple-600" : "bg-gray-700"
        }`}
        style={{ width: "36px", height: "20px", minWidth: "36px" }}
        aria-label={`Toggle ${section.label}`}
      >
        <span
          className="absolute top-0.5 bg-white rounded-full transition-all"
          style={{
            width: "16px",
            height: "16px",
            left: section.enabled ? "18px" : "2px",
          }}
        />
      </button>

      <div ref={menuRef} className="relative flex-shrink-0">
        <button
          onClick={(event) => {
            event.stopPropagation();
            setOpenMenu((prev) => !prev);
          }}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-purple-900/30 transition"
          aria-label="Section menu"
        >
          ⋮
        </button>

        {openMenu && (
          <div
            onClick={(event) => event.stopPropagation()}
            className="absolute right-0 top-9 z-50 w-32 overflow-hidden rounded-xl border border-purple-900/30 bg-[#15152f] shadow-xl"
          >
            <button
              onClick={() => {
                setOpenMenu(false);
                onEdit(section);
              }}
              className="w-full px-4 py-2 text-left text-sm text-purple-300 hover:bg-purple-900/30"
            >
              Edit
            </button>

            <button
              onClick={() => {
                setOpenMenu(false);
                onDelete(section.id);
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
