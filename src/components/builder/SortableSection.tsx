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

// Line icons drawn per section type (and per label for the typed custom sections).
// The stored `icon` field on a section is left untouched; the UI only reads type/label.
const sectionIconPaths: Record<string, string> = {
  hero: "M4 5h16v6H4z M4 15h10 M4 19h7",
  about: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M5 20a7 7 0 0 1 14 0",
  experience: "M4 8h16v11H4z M9 8V5h6v3 M4 13h16",
  projects: "M3 6h6l2 2h10v11H3z",
  skills: "M4 6h9 M17 6h3 M15 4v4 M4 12h3 M11 12h9 M9 10v4 M4 18h11 M19 18h1 M17 16v4",
  education: "M2 9l10-5 10 5-10 5z M6 11v5c3 2 9 2 12 0v-5",
  certifications: "M12 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10z M9 13l-1 7 4-2 4 2-1-7",
  specialization: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M12 12h.01",
  languages: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M3 12h18 M12 3c2.5 3 2.5 15 0 18 M12 3c-2.5 3-2.5 15 0 18",
  awards: "M8 4h8v5a4 4 0 0 1-8 0z M8 6H5a3 3 0 0 0 3 4 M16 6h3a3 3 0 0 1-3 4 M12 13v4 M8 20h8",
  organizations: "M4 20V6l8-3 8 3v14 M3 20h18 M9 9h.01 M15 9h.01 M9 13h.01 M15 13h.01 M10 20v-3h4v3",
  services: "M12 3l9 5-9 5-9-5z M3 13l9 5 9-5",
  gallery: "M4 5h16v14H4z M4 16l5-5 4 4 2-2 5 5 M15 9h.01",
  testimonials: "M5 5h14v10H9l-4 4z M9 9h6 M9 12h4",
  contact: "M4 6h16v12H4z M4 7l8 6 8-6",
  custom: "M5 6h14 M5 10h14 M5 14h9 M5 18h6",
};

const customLabelKeys: Record<string, string> = {
  education: "education",
  certification: "certifications",
  certifications: "certifications",
  "specialization area": "specialization",
  "specialization areas": "specialization",
  language: "languages",
  languages: "languages",
  award: "awards",
  awards: "awards",
  organization: "organizations",
  organizations: "organizations",
};

export function sectionIconKey(type: string, label?: string) {
  const base = type.split("-")[0];
  if (base === "custom") {
    return customLabelKeys[(label || "").trim().toLowerCase()] || "custom";
  }
  return sectionIconPaths[base] ? base : "custom";
}

export function SectionIcon({
  type,
  label,
  className = "h-4 w-4",
}: {
  type: string;
  label?: string;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      <path d={sectionIconPaths[sectionIconKey(type, label)]} />
    </svg>
  );
}

function GripIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 10 16" className="h-3.5 w-2.5" fill="currentColor">
      <circle cx="2.5" cy="3" r="1.2" />
      <circle cx="7.5" cy="3" r="1.2" />
      <circle cx="2.5" cy="8" r="1.2" />
      <circle cx="7.5" cy="8" r="1.2" />
      <circle cx="2.5" cy="13" r="1.2" />
      <circle cx="7.5" cy="13" r="1.2" />
    </svg>
  );
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
    opacity: isDragging ? 0.85 : 1,
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
      aria-current={isActive ? "true" : undefined}
      className={`group relative flex cursor-pointer items-center gap-2 border-b border-rule py-2 pl-1.5 pr-2 outline-none transition-colors duration-150 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink/15 ${
        isDragging
          ? "z-10 bg-white shadow-[0_4px_12px_rgba(20,20,20,0.08)]"
          : isActive
            ? "bg-white shadow-[inset_2px_0_0_var(--color-accent)]"
            : "hover:bg-white/70"
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        onClick={(event) => event.stopPropagation()}
        className="flex h-6 w-4 shrink-0 cursor-grab items-center justify-center rounded text-[#a3a39c] hover:text-ink-soft active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/15"
        aria-label={`Reorder ${section.label}`}
      >
        <GripIcon />
      </button>

      <span className={section.enabled ? "text-ink-soft" : "text-[#a3a39c]"}>
        <SectionIcon type={section.type} label={section.label} />
      </span>

      <span
        className={`flex-1 truncate text-sm ${
          section.enabled ? "text-ink" : "text-[#8a8a90]"
        } ${isActive ? "font-medium" : ""}`}
      >
        {section.label}
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={section.enabled}
        onClick={(event) => {
          event.stopPropagation();
          onToggle(section.id);
        }}
        className={`relative h-4 w-7 shrink-0 rounded-full transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 ${
          section.enabled ? "bg-accent" : "bg-[#cfcfc8]"
        }`}
        aria-label={`Show ${section.label}`}
      >
        <span
          className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-[left] duration-150 ${
            section.enabled ? "left-3.5" : "left-0.5"
          }`}
        />
      </button>

      <div ref={menuRef} className="relative shrink-0">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setOpenMenu((prev) => !prev);
          }}
          className="flex h-6 w-6 items-center justify-center rounded text-ink-soft hover:bg-paper-deep hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/15"
          aria-label={`More actions for ${section.label}`}
          aria-expanded={openMenu}
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor">
            <circle cx="8" cy="3" r="1.3" />
            <circle cx="8" cy="8" r="1.3" />
            <circle cx="8" cy="13" r="1.3" />
          </svg>
        </button>

        {openMenu && (
          <div
            onClick={(event) => event.stopPropagation()}
            className="absolute right-0 top-7 z-50 w-32 overflow-hidden rounded-md border border-rule bg-white py-1 shadow-[0_6px_16px_rgba(20,20,20,0.08)]"
          >
            <button
              type="button"
              onClick={() => {
                setOpenMenu(false);
                onEdit(section);
              }}
              className="w-full px-3 py-1.5 text-left text-sm text-ink hover:bg-paper"
            >
              Edit
            </button>

            <button
              type="button"
              onClick={() => {
                setOpenMenu(false);
                onDelete(section.id);
              }}
              className="w-full px-3 py-1.5 text-left text-sm text-red-700 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
