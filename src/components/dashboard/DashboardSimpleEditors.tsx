"use client";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-400";
const labelClass = "mb-1.5 block text-xs font-medium text-slate-400";

export function ServiceEditor({
  value,
  onChange,
}: {
  value: any;
  onChange: (value: any) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Title</label>
        <input
          value={value.title || ""}
          onChange={(event) =>
            onChange({ ...value, title: event.target.value })
          }
          className={inputClass}
          placeholder="Service name"
        />
      </div>
      <div>
        <label className={labelClass}>Description</label>
        <textarea
          value={value.description || ""}
          onChange={(event) =>
            onChange({ ...value, description: event.target.value })
          }
          className={`${inputClass} h-24 resize-none`}
          placeholder="What do you offer?"
        />
      </div>
      <div>
        <label className={labelClass}>Icon</label>
        <input
          value={value.icon || ""}
          onChange={(event) => onChange({ ...value, icon: event.target.value })}
          className={inputClass}
          placeholder="✦"
        />
      </div>
    </div>
  );
}

export function TestimonialEditor({
  value,
  onChange,
}: {
  value: any;
  onChange: (value: any) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Name</label>
        <input
          value={value.name || ""}
          onChange={(event) => onChange({ ...value, name: event.target.value })}
          className={inputClass}
          placeholder="Client name"
        />
      </div>
      <div>
        <label className={labelClass}>Position</label>
        <input
          value={value.position || ""}
          onChange={(event) =>
            onChange({ ...value, position: event.target.value })
          }
          className={inputClass}
          placeholder="CEO at Company"
        />
      </div>
      <div>
        <label className={labelClass}>Message</label>
        <textarea
          value={value.message || ""}
          onChange={(event) =>
            onChange({ ...value, message: event.target.value })
          }
          className={`${inputClass} h-24 resize-none`}
          placeholder="What they said..."
        />
      </div>
      <div>
        <label className={labelClass}>Photo URL</label>
        <input
          value={value.photo_url || ""}
          onChange={(event) =>
            onChange({ ...value, photo_url: event.target.value })
          }
          className={inputClass}
          placeholder="https://..."
        />
      </div>
    </div>
  );
}
