"use client";

import api, { getApiErrorMessage } from "@/lib/api";
import type { EditFormData } from "@/types";

const inputClass =
  "w-full rounded-md border border-rule bg-white px-3 py-2 text-sm text-ink placeholder:text-[#9a9aa0] outline-none transition-colors focus:border-ink focus:ring-2 focus:ring-ink/10";
const labelClass = "mb-1.5 block text-sm font-medium text-ink";

interface GalleryEditorProps {
  value: EditFormData;
  onChange: (value: EditFormData) => void;
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
    <div className="space-y-5">
      <div>
        <label htmlFor="ed-gallery-title" className={labelClass}>
          Certificate title
        </label>
        <input
          id="ed-gallery-title"
          value={value.title || ""}
          onChange={(event) =>
            onChange({ ...value, title: event.target.value })
          }
          className={inputClass}
          placeholder="AWS Certified Solutions Architect"
        />
      </div>
      <div>
        <label htmlFor="ed-gallery-description" className={labelClass}>
          Description
        </label>
        <textarea
          id="ed-gallery-description"
          value={value.description || ""}
          onChange={(event) =>
            onChange({ ...value, description: event.target.value })
          }
          className={`${inputClass} h-28 resize-y`}
          placeholder="Certificate description"
        />
      </div>
      <div>
        <label htmlFor="ed-gallery-date" className={labelClass}>
          Issue date
        </label>
        <input
          id="ed-gallery-date"
          type="date"
          value={value.issued_date || ""}
          onChange={(event) =>
            onChange({ ...value, issued_date: event.target.value })
          }
          className={`${inputClass} sm:max-w-[14rem]`}
          style={{ colorScheme: "light" }}
        />
      </div>
      <div>
        <p className={labelClass}>Certificate file</p>
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
              // PDFs get a picture of their first page so the certificate shows on the portfolio, not just a link.
              if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) {
                setMessage("Making a preview of the PDF...");
                const { pdfFirstPageToImage } = await import("@/lib/pdf-thumbnail");
                const preview = await pdfFirstPageToImage(file);
                if (preview) formData.append("preview", preview, preview.type === "image/webp" ? "preview.webp" : "preview.png");
              }
              setMessage("Uploading...");
              await api.post("/api/gallery", formData, {
                headers: { "Content-Type": "multipart/form-data" },
              });
              setMessage("Certificate saved");
              onChange({});
              await onRefresh();
            } catch (error) {
              setMessage(getApiErrorMessage(error, "Upload failed"));
            }
          }}
        />
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-dashed border-rule bg-paper px-3 py-3">
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
          <label
            htmlFor="gallery-file"
            className="inline-flex cursor-pointer items-center rounded-md border border-rule bg-white px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:border-ink-soft"
          >
            Upload file
          </label>
          <span className="text-xs text-ink-soft">
            JPG, PNG, or PDF up to 10 MB.
          </span>
        </div>
        <p className="mt-1.5 text-xs text-ink-soft">
          Fill in the title first; the file is saved as soon as you pick it.
        </p>
      </div>
    </div>
  );
}
