"use client";

import api from "@/lib/api";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-400";
const labelClass = "mb-1.5 block text-xs font-medium text-slate-400";

interface GalleryEditorProps {
  value: any;
  onChange: (value: any) => void;
  setMessage: (message: string) => void;
  onRefresh: () => Promise<void> | void;
}

export default function GalleryEditor({
  value,
  onChange,
  setMessage,
  onRefresh,
}: GalleryEditorProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Certificate Title</label>
        <input
          value={value.title || ""}
          onChange={(event) =>
            onChange({ ...value, title: event.target.value })
          }
          className={inputClass}
          placeholder="AWS Certified Solutions Architect"
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
          placeholder="Certificate description"
        />
      </div>
      <div>
        <label className={labelClass}>Issue Date</label>
        <input
          type="date"
          value={value.issued_date || ""}
          onChange={(event) =>
            onChange({ ...value, issued_date: event.target.value })
          }
          className={inputClass}
          style={{ colorScheme: "dark" }}
        />
      </div>
      <div>
        <label className={labelClass}>Certificate File</label>
        <input
          id="gallery-file"
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const formData = new FormData();
            formData.append("file", file);
            formData.append("title", value.title || "");
            formData.append("description", value.description || "");
            formData.append("issued_date", value.issued_date || "");
            try {
              setMessage("Uploading...");
              await api.post("/api/gallery", formData, {
                headers: { "Content-Type": "multipart/form-data" },
              });
              setMessage("Certificate saved");
              onChange({});
              await onRefresh();
            } catch (error: any) {
              setMessage(error.response?.data?.message || "Upload failed");
            }
          }}
        />
        <label
          htmlFor="gallery-file"
          className="inline-flex cursor-pointer rounded-xl bg-purple-500 px-4 py-2 text-sm font-medium text-white hover:bg-purple-400"
        >
          Upload file
        </label>
        <p className="mt-1 text-xs text-slate-500">
          JPG, PNG, or PDF up to 10 MB.
        </p>
      </div>
    </div>
  );
}
