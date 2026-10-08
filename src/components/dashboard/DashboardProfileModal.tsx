"use client";

import { motion } from "framer-motion";
import api, { getApiErrorMessage } from "@/lib/api";
import type { ProfileFormData } from "@/types";

type ProfileForm = ProfileFormData;

interface DashboardProfileModalProps {
  open: boolean;
  profileForm: ProfileForm;
  profileMsg: string;
  profileError: string;
  setProfileForm: (
    value: ProfileForm | ((previous: ProfileForm) => ProfileForm),
  ) => void;
  setProfileError: (message: string) => void;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
}

const inputClass =
  "w-full rounded-md border border-rule bg-white px-3 py-2 text-sm text-ink placeholder:text-[#9a9aa0] outline-none transition-colors focus:border-ink focus:ring-2 focus:ring-ink/10";
const labelClass = "mb-1.5 block text-sm font-medium text-ink";

export default function DashboardProfileModal({
  open,
  profileForm,
  profileMsg,
  profileError,
  setProfileForm,
  setProfileError,
  onClose,
  onSubmit,
}: DashboardProfileModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/30 px-4"
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-rule bg-white p-5 text-ink shadow-[0_12px_32px_rgba(20,20,20,0.12)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-rule pb-4">
          <div>
            <h2 id="profile-modal-title" className="font-display text-lg font-semibold tracking-tight">
              Account profile
            </h2>
            <p className="mt-0.5 text-xs text-ink-soft">
              Name, email, password and photo.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close profile modal"
            onClick={onClose}
            className="-mr-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-soft hover:bg-paper hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/15"
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="h-3.5 w-3.5">
              <path d="M4 4l8 8 M12 4l-8 8" />
            </svg>
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          {profileError && (
            <div role="alert" className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
              {profileError}
            </div>
          )}
          {profileMsg && (
            <div role="status" className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {profileMsg}
            </div>
          )}
          <div>
            <label htmlFor="profile-name" className={labelClass}>
              Name
            </label>
            <input
              id="profile-name"
              value={profileForm.name}
              onChange={(event) =>
                setProfileForm({ ...profileForm, name: event.target.value })
              }
              className={inputClass}
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="profile-email" className={labelClass}>Email</label>
            <input
              id="profile-email"
              type="email"
              value={profileForm.email}
              onChange={(event) =>
                setProfileForm({ ...profileForm, email: event.target.value })
              }
              className={inputClass}
              placeholder="email@example.com"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="profile-password" className={labelClass}>
                New password
              </label>
              <input
                id="profile-password"
                autoComplete="new-password"
                type="password"
                value={profileForm.password}
                onChange={(event) =>
                  setProfileForm({
                    ...profileForm,
                    password: event.target.value,
                  })
                }
                className={inputClass}
                placeholder="Optional"
              />
            </div>
            <div>
              <label htmlFor="profile-confirm" className={labelClass}>
                Repeat password
              </label>
              <input
                id="profile-confirm"
                autoComplete="new-password"
                type="password"
                value={profileForm.confirmPassword}
                onChange={(event) =>
                  setProfileForm({
                    ...profileForm,
                    confirmPassword: event.target.value,
                  })
                }
                className={inputClass}
                placeholder="Repeat password"
              />
            </div>
          </div>
          <div>
            <label htmlFor="profile-current-password" className={labelClass}>
              Current password
            </label>
            <input
              id="profile-current-password"
              type="password"
              autoComplete="current-password"
              value={profileForm.currentPassword || ""}
              onChange={(event) =>
                setProfileForm({
                  ...profileForm,
                  currentPassword: event.target.value,
                })
              }
              className={inputClass}
              placeholder="Required to change email/password"
            />
          </div>
          <div>
            <p className={labelClass}>
              Profile photo
            </p>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-rule bg-paper-deep">
                {profileForm.photo_url ? (
                  <img
                    src={profileForm.photo_url}
                    alt="Profile preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-ink-soft">
                    ?
                  </div>
                )}
              </div>
              <label
                htmlFor="profile-photo-upload"
                className="cursor-pointer rounded-md border border-rule bg-white px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:border-ink-soft"
              >
                Upload photo
              </label>
              <input
                id="profile-photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const formData = new FormData();
                  formData.append("file", file);
                  try {
                    const response = await api.post<{ photo_url: string }>(
                      "/api/users/upload-photo",
                      formData,
                      { headers: { "Content-Type": "multipart/form-data" } },
                    );
                    setProfileForm((previous) => ({
                      ...previous,
                      photo_url: response.data.photo_url,
                    }));
                    setProfileError("");
                  } catch (error) {
                    setProfileError(
                      getApiErrorMessage(error, "Photo upload failed"),
                    );
                  }
                }}
              />
            </div>
            <label htmlFor="profile-photo-url" className="sr-only">
              Photo URL
            </label>
            <input
              id="profile-photo-url"
              value={profileForm.photo_url}
              onChange={(event) =>
                setProfileForm({
                  ...profileForm,
                  photo_url: event.target.value,
                })
              }
              className={`${inputClass} mt-3`}
              placeholder="https://..."
            />
          </div>
          <div className="flex justify-end gap-2 border-t border-rule pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-rule bg-white px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:border-ink-soft"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-ink px-3.5 py-2 text-sm font-medium text-paper transition-colors hover:bg-black"
            >
              Save
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
