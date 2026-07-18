"use client";

import { motion } from "framer-motion";
import api from "@/lib/api";

interface ProfileForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  photo_url: string;
}

interface DashboardProfileModalProps {
  open: boolean;
  lang: "id" | "en";
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
  "w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none transition focus:border-purple-400";
const labelClass = "mb-1.5 block text-xs font-medium text-slate-400";

export default function DashboardProfileModal({
  open,
  lang,
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-2xl shadow-purple-950/40"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-purple-300">
              Account
            </p>
            <h2 className="text-lg font-semibold text-white">
              {lang === "id" ? "Edit Profil" : "Edit Profile"}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close profile modal"
            onClick={onClose}
            className="h-9 w-9 rounded-xl border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            ×
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          {profileError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {profileError}
            </div>
          )}
          {profileMsg && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
              {profileMsg}
            </div>
          )}
          <div>
            <label className={labelClass}>
              {lang === "id" ? "Nama" : "Name"}
            </label>
            <input
              value={profileForm.name}
              onChange={(event) =>
                setProfileForm({ ...profileForm, name: event.target.value })
              }
              className={inputClass}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
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
              <label className={labelClass}>
                {lang === "id" ? "Password Baru" : "New Password"}
              </label>
              <input
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
              <label className={labelClass}>
                {lang === "id" ? "Konfirmasi" : "Confirm"}
              </label>
              <input
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
            <label className={labelClass}>
              {lang === "id" ? "Foto Profil" : "Profile Photo"}
            </label>
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-950">
                {profileForm.photo_url ? (
                  <img
                    src={profileForm.photo_url}
                    alt="Profile preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-600">
                    ?
                  </div>
                )}
              </div>
              <label
                htmlFor="profile-photo-upload"
                className="cursor-pointer rounded-xl bg-purple-500 px-4 py-2 text-sm font-medium text-white hover:bg-purple-400"
              >
                {lang === "id" ? "Upload Foto" : "Upload Photo"}
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
                    const response = await api.post(
                      "/api/users/upload-photo",
                      formData,
                      { headers: { "Content-Type": "multipart/form-data" } },
                    );
                    setProfileForm((previous) => ({
                      ...previous,
                      photo_url: response.data.photo_url,
                    }));
                    setProfileError("");
                  } catch (error: any) {
                    setProfileError(
                      error.response?.data?.message || "Photo upload failed",
                    );
                  }
                }}
              />
            </div>
            <input
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
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 rounded-xl bg-purple-500 py-2.5 text-sm font-semibold text-white hover:bg-purple-400"
            >
              {lang === "id" ? "Simpan" : "Save"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/10"
            >
              {lang === "id" ? "Batal" : "Cancel"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
