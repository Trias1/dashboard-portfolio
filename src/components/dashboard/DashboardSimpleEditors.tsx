"use client";

import type { EditFormData } from "@/types";

const inputClass =
  "w-full rounded-md border border-rule bg-white px-3 py-2 text-sm text-ink placeholder:text-[#9a9aa0] outline-none transition-colors focus:border-ink focus:ring-2 focus:ring-ink/10";
const labelClass = "mb-1.5 block text-sm font-medium text-ink";
const hintClass = "mt-1.5 text-xs text-ink-soft";

export function ServiceEditor({
  value,
  onChange,
}: {
  value: EditFormData;
  onChange: (value: EditFormData) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="ed-service-title" className={labelClass}>
          Title
        </label>
        <input
          id="ed-service-title"
          value={value.title || ""}
          onChange={(event) =>
            onChange({ ...value, title: event.target.value })
          }
          className={inputClass}
          placeholder="Service name"
        />
      </div>
      <div>
        <label htmlFor="ed-service-description" className={labelClass}>
          Description
        </label>
        <textarea
          id="ed-service-description"
          value={value.description || ""}
          onChange={(event) =>
            onChange({ ...value, description: event.target.value })
          }
          className={`${inputClass} h-28 resize-y`}
          placeholder="What do you offer?"
        />
      </div>
      <div>
        <label htmlFor="ed-service-icon" className={labelClass}>
          Icon
        </label>
        <input
          id="ed-service-icon"
          value={value.icon || ""}
          onChange={(event) => onChange({ ...value, icon: event.target.value })}
          className={`${inputClass} max-w-[8rem]`}
          placeholder="—"
        />
        <p className={hintClass}>Optional. A single character or short mark.</p>
      </div>
    </div>
  );
}

export function TestimonialEditor({
  value,
  onChange,
}: {
  value: EditFormData;
  onChange: (value: EditFormData) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-x-3 gap-y-5 sm:grid-cols-2">
        <div>
          <label htmlFor="ed-testimonial-name" className={labelClass}>
            Name
          </label>
          <input
            id="ed-testimonial-name"
            value={value.name || ""}
            onChange={(event) =>
              onChange({ ...value, name: event.target.value })
            }
            className={inputClass}
            placeholder="Client name"
          />
        </div>
        <div>
          <label htmlFor="ed-testimonial-position" className={labelClass}>
            Position
          </label>
          <input
            id="ed-testimonial-position"
            value={value.position || ""}
            onChange={(event) =>
              onChange({ ...value, position: event.target.value })
            }
            className={inputClass}
            placeholder="CEO at Company"
          />
        </div>
      </div>
      <div>
        <label htmlFor="ed-testimonial-message" className={labelClass}>
          Message
        </label>
        <textarea
          id="ed-testimonial-message"
          value={value.message || ""}
          onChange={(event) =>
            onChange({ ...value, message: event.target.value })
          }
          className={`${inputClass} h-28 resize-y`}
          placeholder="What they said"
        />
      </div>
      <div>
        <label htmlFor="ed-testimonial-photo" className={labelClass}>
          Photo URL
        </label>
        <input
          id="ed-testimonial-photo"
          value={value.photo_url || ""}
          onChange={(event) =>
            onChange({ ...value, photo_url: event.target.value })
          }
          className={inputClass}
          placeholder="https://..."
        />
        <p className={hintClass}>Optional. A square photo of the person.</p>
      </div>
    </div>
  );
}
