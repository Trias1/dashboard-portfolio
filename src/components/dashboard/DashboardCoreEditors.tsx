"use client";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-400";
const labelClass = "mb-1.5 block text-xs font-medium text-slate-400";
const field = (
  label: string,
  key: string,
  value: any,
  onChange: (value: any) => void,
  placeholder: string,
  area = false,
) => (
  <div>
    <label className={labelClass}>{label}</label>
    {area ? (
      <textarea
        value={value[key] || ""}
        onChange={(event) => onChange({ ...value, [key]: event.target.value })}
        className={`${inputClass} h-20 resize-none`}
        placeholder={placeholder}
      />
    ) : (
      <input
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
  value: any;
  onChange: (value: any) => void;
}) {
  return (
    <div className="space-y-4">
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
      <div className="grid gap-3 sm:grid-cols-2">
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
  value: any;
  onChange: (value: any) => void;
}) {
  return (
    <div className="space-y-4">
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
  value: any;
  onChange: (value: any) => void;
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
    <div className="space-y-4">
      {field(
        "Category Title (optional)",
        "title",
        value,
        onChange,
        "Frontend, Backend, DevOps...",
      )}
      <div className="relative">
        <label className={labelClass}>Search & Add Skills</label>
        <input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && search) {
              event.preventDefault();
              onAdd(search);
            }
          }}
          className={inputClass}
          placeholder="Type and press Enter"
        />
        {suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-white/10 bg-slate-900">
            {suggestions.map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => onAdd(item)}
                className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10"
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>
      <div>
        <label className={labelClass}>Added Skills</label>
        <div className="flex min-h-12 flex-wrap gap-2 rounded-xl border border-white/10 bg-slate-950/70 p-3">
          {skills.map((skill: string) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 rounded-full bg-purple-500/15 px-3 py-1 text-xs text-purple-300"
            >
              {skill}
              <button
                type="button"
                aria-label={`Remove ${skill}`}
                onClick={() => onRemove(skill)}
                className="text-slate-500 hover:text-red-300"
              >
                ×
              </button>
            </span>
          ))}
          {skills.length === 0 && (
            <span className="text-xs text-slate-600">No skills added yet</span>
          )}
        </div>
      </div>
    </div>
  );
}
