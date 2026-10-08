"use client";

import api, { getApiErrorMessage } from "@/lib/api";
import type { EditFormData, StringFieldKey } from "@/types";

const inputClass =
  "w-full rounded-md border border-rule bg-white px-3 py-2 text-sm text-ink placeholder:text-[#9a9aa0] outline-none transition-colors focus:border-ink focus:ring-2 focus:ring-ink/10";
const labelClass = "mb-1.5 block text-sm font-medium text-ink";
const dropClass =
  "flex flex-wrap items-center gap-3 rounded-md border border-dashed border-rule bg-paper px-3 py-3";
const uploadButtonClass =
  "inline-flex cursor-pointer items-center rounded-md border border-rule bg-white px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:border-ink-soft";

function UploadIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0 text-ink-soft"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 15V4m0 0l-4 4m4-4l4 4" />
      <path d="M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3" />
    </svg>
  );
}
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
        className={`${inputClass} h-28 resize-y`}
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

export function AboutEditor({
  value,
  onChange,
  photoPreview,
  onPhotoChange,
  setMessage,
}: {
  value: EditFormData;
  onChange: (value: EditFormData) => void;
  photoPreview: string;
  onPhotoChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setMessage: (message: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className={labelClass}>Profile photo</p>
        <div className={dropClass}>
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border border-rule bg-white">
            {photoPreview || value.photo_url ? (
              <img
                src={photoPreview || value.photo_url || undefined}
                alt="Preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-ink-soft">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                >
                  <circle cx="12" cy="9" r="3.5" />
                  <path d="M5 19c1.5-3 4-4.5 7-4.5s5.5 1.5 7 4.5" />
                </svg>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <label htmlFor="about-photo" className={uploadButtonClass}>
              Upload photo
            </label>
            <p className="mt-1 text-xs text-ink-soft">
              Square image works best.
            </p>
          </div>
          <input
            id="about-photo"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPhotoChange}
          />
        </div>
        <label htmlFor="ed-photo_url" className="sr-only">
          Photo URL
        </label>
        <input
          id="ed-photo_url"
          value={value.photo_url || ""}
          onChange={(event) =>
            onChange({ ...value, photo_url: event.target.value })
          }
          className={`${inputClass} mt-2`}
          placeholder="Or paste an image URL"
        />
      </div>
      {field("Name", "name", value, onChange, "Your name")}
      {field("Title", "title", value, onChange, "Full Stack Developer")}
      {field("Bio", "bio", value, onChange, "Tell about yourself...", true)}
      <div>
        <p className={labelClass}>CV / resume</p>
        <input
          id="about-cv"
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const formData = new FormData();
            formData.append("cv", file);
            try {
              const response = await api.post<{ cv_url: string }>(
                "/api/about/upload-cv",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } },
              );
              onChange({ ...value, cv_url: response.data.cv_url });
              setMessage("CV uploaded");
            } catch (error) {
              setMessage(getApiErrorMessage(error, "CV upload failed"));
            }
          }}
        />
        <div className={dropClass}>
          <UploadIcon />
          <label htmlFor="about-cv" className={uploadButtonClass}>
            Upload CV
          </label>
          <span className="text-xs text-ink-soft">PDF, DOC or DOCX</span>
          {value.cv_url && (
            <a
              href={value.cv_url}
              target="_blank"
              rel="noreferrer"
              className="ml-auto text-sm text-accent hover:text-accent-dark hover:underline"
            >
              Open current CV
            </a>
          )}
        </div>
        <label htmlFor="ed-cv_url" className="sr-only">
          CV URL
        </label>
        <input
          id="ed-cv_url"
          value={value.cv_url || ""}
          onChange={(event) =>
            onChange({ ...value, cv_url: event.target.value })
          }
          className={`${inputClass} mt-2`}
          placeholder="Or paste a CV URL"
        />
      </div>
    </div>
  );
}
export function ExperienceEditor({
  value,
  onChange,
}: {
  value: EditFormData;
  onChange: (value: EditFormData) => void;
}) {
  return (
    <div className="space-y-5">
      {field("Company", "company", value, onChange, "Company name")}
      {field("Position", "position", value, onChange, "Job title")}
      <div className="grid gap-x-3 gap-y-5 sm:grid-cols-2">
        <div>
          <label htmlFor="ed-start_date" className={labelClass}>
            Start date
          </label>
          <input
            id="ed-start_date"
            type="month"
            value={value.start_date?.slice(0, 7) || ""}
            onChange={(event) =>
              onChange({ ...value, start_date: event.target.value })
            }
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="ed-end_date" className={labelClass}>
            End date
          </label>
          <label className="mb-2 flex items-center gap-2 text-sm text-ink-soft">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-rule accent-[#1f45c9]"
              checked={value.still_working || false}
              onChange={(event) =>
                onChange({
                  ...value,
                  still_working: event.target.checked,
                  end_date: event.target.checked ? null : value.end_date,
                })
              }
            />
            Still working here
          </label>
          {!value.still_working && (
            <input
              id="ed-end_date"
              type="month"
              value={value.end_date?.slice(0, 7) || ""}
              onChange={(event) =>
                onChange({ ...value, end_date: event.target.value })
              }
              className={inputClass}
            />
          )}
        </div>
      </div>
      {field(
        "Description",
        "description",
        value,
        onChange,
        "What did you do?",
        true,
      )}
    </div>
  );
}
export function ProjectEditor({
  value,
  onChange,
}: {
  value: EditFormData;
  onChange: (value: EditFormData) => void;
}) {
  return (
    <div className="space-y-5">
      {field("Title", "title", value, onChange, "Project name")}
      {field(
        "Description",
        "description",
        value,
        onChange,
        "What is this project?",
        true,
      )}
      {field(
        "Tech Stack",
        "tech_stack",
        value,
        onChange,
        "React, Node.js, PostgreSQL",
      )}
      {field("Demo URL", "demo_url", value, onChange, "https://...")}
      {field(
        "GitHub URL",
        "github_url",
        value,
        onChange,
        "https://github.com/...",
      )}
      <div>
        <p className={labelClass}>Project image</p>
        <input
          id="project-img"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () =>
              onChange({
                ...value,
                image_url:
                  typeof reader.result === "string" ? reader.result : null,
              });
            reader.readAsDataURL(file);
          }}
        />
        <div className={dropClass}>
          {value.image_url ? (
            <img
              src={value.image_url}
              alt="Project image preview"
              className="h-10 w-14 shrink-0 rounded border border-rule object-cover"
            />
          ) : (
            <UploadIcon />
          )}
          <label htmlFor="project-img" className={uploadButtonClass}>
            Upload image
          </label>
          <span className="text-xs text-ink-soft">JPG or PNG</span>
        </div>
        <label htmlFor="ed-image_url" className="sr-only">
          Image URL
        </label>
        <input
          id="ed-image_url"
          value={value.image_url || ""}
          onChange={(event) =>
            onChange({ ...value, image_url: event.target.value })
          }
          className={`${inputClass} mt-2`}
          placeholder="Or paste an image URL"
        />
      </div>
    </div>
  );
}
