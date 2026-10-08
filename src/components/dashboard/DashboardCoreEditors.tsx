"use client";

import type { EditFormData, StringFieldKey } from "@/types";
import NotifyEmailSettings from "@/components/dashboard/NotifyEmailSettings";

const inputClass =
  "w-full rounded-md border border-rule bg-white px-3 py-2 text-sm text-ink placeholder:text-[#9a9aa0] outline-none transition-colors focus:border-ink focus:ring-2 focus:ring-ink/10";
const labelClass = "mb-1.5 block text-sm font-medium text-ink";
const hintClass = "mt-1.5 text-xs text-ink-soft";
const field = (
  label: string,
  key: StringFieldKey<EditFormData>,
  value: EditFormData,
  onChange: (value: EditFormData) => void,
  placeholder: string,
  area = false,
) => (
  <div>
    <label htmlFor={`ed-${key}`} className={labelClass}>
      {label}
    </label>
    {area ? (
      <textarea
        id={`ed-${key}`}
        value={value[key] || ""}
        onChange={(event) => onChange({ ...value, [key]: event.target.value })}
        className={`${inputClass} h-24 resize-y`}
        placeholder={placeholder}
      />
    ) : (
      <input
        id={`ed-${key}`}
        value={value[key] || ""}
        onChange={(event) => onChange({ ...value, [key]: event.target.value })}
        className={inputClass}
        placeholder={placeholder}
      />
    )}
  </div>
);

export function HeroEditor({
  value,
  onChange,
}: {
  value: EditFormData;
  onChange: (value: EditFormData) => void;
}) {
  return (
    <div className="space-y-5">
      {field("Greeting (optional)", "greeting", value, onChange, "Hi, I'm")}
      {field("Headline", "headline", value, onChange, "John Doe")}
      {field(
        "Subheadline",
        "subheadline",
        value,
        onChange,
        "Building scalable products.",
        true,
      )}
      <div className="grid gap-x-3 gap-y-5 sm:grid-cols-2">
        {field("Primary CTA", "cta_text", value, onChange, "View Portfolio")}
        {field("Primary URL", "cta_url", value, onChange, "#projects")}
        {field(
          "Secondary CTA",
          "cta_secondary_text",
          value,
          onChange,
          "Download CV",
        )}
        {field(
          "Secondary URL",
          "cta_secondary_url",
          value,
          onChange,
          "#contact",
        )}
      </div>
      {field(
        "Background URL",
        "background_url",
        value,
        onChange,
        "https://...",
      )}
    </div>
  );
}
export function ContactEditor({
  value,
  onChange,
}: {
  value: EditFormData;
  onChange: (value: EditFormData) => void;
}) {
  return (
    <div className="space-y-5">
      {field("Email", "email", value, onChange, "your@email.com")}
      {field("Phone / WhatsApp", "phone", value, onChange, "+62...")}
      {field("Location", "location", value, onChange, "Jakarta, Indonesia")}
      {field(
        "LinkedIn URL",
        "linkedin_url",
        value,
        onChange,
        "https://linkedin.com/in/...",
      )}
      {field(
        "GitHub URL",
        "github_url",
        value,
        onChange,
        "https://github.com/...",
      )}
      <NotifyEmailSettings />
    </div>
  );
}
export function SkillsEditor({
  value,
  onChange,
  search,
  suggestions,
  onSearch,
  onAdd,
  onRemove,
}: {
  value: EditFormData;
  onChange: (value: EditFormData) => void;
  search: string;
  suggestions: string[];
  onSearch: (value: string) => void;
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
}) {
  const skills = (value.skills || "")
    .split(",")
    .map((item: string) => item.trim())
    .filter(Boolean);
  return (
    <div className="space-y-5">
      {field(
        "Category Title (optional)",
        "title",
        value,
        onChange,
        "Frontend, Backend, DevOps...",
      )}
      <div className="relative">
        <label htmlFor="ed-skill-search" className={labelClass}>
          Add skills
        </label>
        <input
          id="ed-skill-search"
          autoComplete="off"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && search) {
              event.preventDefault();
              onAdd(search);
            }
          }}
          className={inputClass}
          placeholder="e.g. TypeScript"
        />
        <p className={hintClass}>Type a skill and press Enter, or pick a suggestion.</p>
        {suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-rule bg-white shadow-sm">
            {suggestions.map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => onAdd(item)}
                className="block w-full px-3 py-2 text-left text-sm text-ink hover:bg-paper-deep focus-visible:bg-paper-deep focus-visible:outline-none"
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>
      <div>
        <p id="ed-skill-list" className={labelClass}>
          Added skills
        </p>
        <div
          aria-labelledby="ed-skill-list"
          className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-md border border-rule bg-paper px-2.5 py-2"
        >
          {skills.map((skill: string) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 rounded border border-rule bg-white py-0.5 pl-2 pr-1 text-xs text-ink"
            >
              {skill}
              <button
                type="button"
                aria-label={`Remove ${skill}`}
                onClick={() => onRemove(skill)}
                className="rounded px-0.5 text-ink-soft hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
              >
                ×
              </button>
            </span>
          ))}
          {skills.length === 0 && (
            <span className="text-xs text-ink-soft">No skills yet.</span>
          )}
        </div>
      </div>
    </div>
  );
}
