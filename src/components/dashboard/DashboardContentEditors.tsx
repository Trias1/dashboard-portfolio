"use client";

import api from "@/lib/api";

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
        className={`${inputClass} h-24 resize-none`}
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

export function AboutEditor({
  value,
  onChange,
  photoPreview,
  onPhotoChange,
  setMessage,
}: {
  value: any;
  onChange: (value: any) => void;
  photoPreview: string;
  onPhotoChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setMessage: (message: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Profile Photo</label>
        <div className="flex items-center gap-3">
          <div className="h-16 w-16 overflow-hidden rounded-2xl border border-white/10 bg-slate-950">
            {photoPreview || value.photo_url ? (
              <img
                src={photoPreview || value.photo_url}
                alt="Preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-600">
                ?
              </div>
            )}
          </div>
          <label
            htmlFor="about-photo"
            className="cursor-pointer rounded-xl bg-purple-500 px-4 py-2 text-sm text-white hover:bg-purple-400"
          >
            Upload photo
          </label>
          <input
            id="about-photo"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPhotoChange}
          />
        </div>
        <input
          value={value.photo_url || ""}
          onChange={(event) =>
            onChange({ ...value, photo_url: event.target.value })
          }
          className={`${inputClass} mt-3`}
          placeholder="https://..."
        />
      </div>
      {field("Name", "name", value, onChange, "Your name")}
      {field("Title", "title", value, onChange, "Full Stack Developer")}
      {field("Bio", "bio", value, onChange, "Tell about yourself...", true)}
      <div>
        <label className={labelClass}>CV / Resume</label>
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
              const response = await api.post(
                "/api/about/upload-cv",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } },
              );
              onChange({ ...value, cv_url: response.data.cv_url });
              setMessage("CV uploaded");
            } catch (error: any) {
              setMessage(error.response?.data?.message || "CV upload failed");
            }
          }}
        />
        <div className="flex items-center gap-3">
          <label
            htmlFor="about-cv"
            className="cursor-pointer rounded-xl bg-purple-500 px-4 py-2 text-sm text-white hover:bg-purple-400"
          >
            Upload CV
          </label>
          {value.cv_url && (
            <a
              href={value.cv_url}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-purple-300 hover:text-white"
            >
              Open current CV
            </a>
          )}
        </div>
        <input
          value={value.cv_url || ""}
          onChange={(event) =>
            onChange({ ...value, cv_url: event.target.value })
          }
          className={`${inputClass} mt-3`}
          placeholder="Or paste CV URL..."
        />
      </div>
    </div>
  );
}
export function ExperienceEditor({
  value,
  onChange,
}: {
  value: any;
  onChange: (value: any) => void;
}) {
  return (
    <div className="space-y-4">
      {field("Company", "company", value, onChange, "Company name")}
      {field("Position", "position", value, onChange, "Job title")}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Start Date</label>
          <input
            type="month"
            value={value.start_date?.slice(0, 7) || ""}
            onChange={(event) =>
              onChange({ ...value, start_date: event.target.value })
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>End Date</label>
          <label className="mb-2 flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
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
  value: any;
  onChange: (value: any) => void;
}) {
  return (
    <div className="space-y-4">
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
        <label className={labelClass}>Project Image</label>
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
              onChange({ ...value, image_url: reader.result });
            reader.readAsDataURL(file);
          }}
        />
        <label
          htmlFor="project-img"
          className="cursor-pointer rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/10"
        >
          Upload image
        </label>
        <input
          value={value.image_url || ""}
          onChange={(event) =>
            onChange({ ...value, image_url: event.target.value })
          }
          className={`${inputClass} mt-3`}
          placeholder="Or paste image URL..."
        />
      </div>
    </div>
  );
}
