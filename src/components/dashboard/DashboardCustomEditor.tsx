'use client';

import React from 'react';
import type { Section } from '@/lib/sections';
import type { EditFormData } from '@/types';

interface DashboardCustomEditorProps {
  activeSection: Section;
  normalizeCustomTitle: (value?: string) => string;
  typedSectionMap: Record<string, string>;
  editForm: EditFormData;
  setEditForm: (form: EditFormData) => void;
  inputClass: string;
  labelClass: string;
  certSkillSearch: string;
  handleCertSkillSearch: (value: string) => void;
  addCertSkill: (skill: string) => void;
  certSkillSuggestions: string[];
  removeCertSkill: (skill: string) => void;
  detectOgImage: () => void;
}

// The parent still passes inputClass/labelClass (kept in the props contract), but the
// editor uses the dashboard's own light form styles so it matches the other editors.
const inputClass =
  "w-full rounded-md border border-rule bg-white px-3 py-2 text-sm text-ink placeholder:text-[#9a9aa0] outline-none transition-colors focus:border-ink focus:ring-2 focus:ring-ink/10";
const labelClass = "mb-1.5 block text-sm font-medium text-ink";
const hintClass = "mt-1.5 text-xs text-ink-soft";
const groupClass = "border-t border-rule pt-5";
const groupTitleClass = "mb-3 text-xs font-medium uppercase tracking-wide text-ink-soft";

export default function DashboardCustomEditor(props: DashboardCustomEditorProps) {
  const { activeSection, normalizeCustomTitle, typedSectionMap, editForm, setEditForm, certSkillSearch, handleCertSkillSearch, addCertSkill, certSkillSuggestions, removeCertSkill, detectOgImage } = props;
        const sectionLabel = normalizeCustomTitle(activeSection.label);
        const subType = typedSectionMap[sectionLabel] || null;
        const isTypedSection = Boolean(subType);

        if (isTypedSection && subType) {
          const editorMap: Record<string, React.ReactElement> = {
            education: (
              <div className="space-y-5">
                <div>
                  <label htmlFor="cx-institution" className={labelClass}>Institution</label>
                  <input
                    id="cx-institution"
                    value={editForm.content?.institution || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        content: {
                          ...(editForm.content || {}),
                          institution: e.target.value,
                        },
                      })
                    }
                    className={inputClass}
                    placeholder="University name"
                  />
                </div>
                <div>
                  <label htmlFor="cx-degree" className={labelClass}>Degree</label>
                  <input
                    id="cx-degree"
                    value={editForm.content?.degree || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        content: {
                          ...(editForm.content || {}),
                          degree: e.target.value,
                        },
                      })
                    }
                    className={inputClass}
                    placeholder="Bachelor's"
                  />
                </div>
                <div>
                  <label htmlFor="cx-field" className={labelClass}>Field</label>
                  <input
                    id="cx-field"
                    value={editForm.content?.field || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        content: {
                          ...(editForm.content || {}),
                          field: e.target.value,
                        },
                      })
                    }
                    className={inputClass}
                    placeholder="Computer Science"
                  />
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-5">
                  <div>
                    <label htmlFor="cx-start_date" className={labelClass}>Start</label>
                    <input
                      id="cx-start_date"
                      value={editForm.content?.start_date?.slice(0, 7) || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          content: {
                            ...(editForm.content || {}),
                            start_date: e.target.value,
                          },
                        })
                      }
                      className={inputClass}
                      placeholder="2020"
                      style={{ colorScheme: "light" }}
                    />
                  </div>
                  <div>
                    <label htmlFor="cx-end_date" className={labelClass}>End</label>
                    <input
                      id="cx-end_date"
                      value={editForm.content?.end_date?.slice(0, 7) || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          content: {
                            ...(editForm.content || {}),
                            end_date: e.target.value,
                          },
                        })
                      }
                      className={inputClass}
                      placeholder="2024"
                      style={{ colorScheme: "light" }}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="cx-gpa" className={labelClass}>GPA</label>
                  <input
                    id="cx-gpa"
                    value={editForm.content?.gpa || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        content: {
                          ...(editForm.content || {}),
                          gpa: e.target.value,
                        },
                      })
                    }
                    className={inputClass}
                    placeholder="3.8"
                  />
                </div>
              </div>
            ),
            certification: (
              <div className="space-y-5">
                <div>
                  <label htmlFor="cx-name" className={labelClass}>Nama Sertifikat *</label>
                  <input
                    id="cx-name"
                    value={editForm.content?.name || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        content: {
                          ...(editForm.content || {}),
                          name: e.target.value,
                        },
                      })
                    }
                    className={inputClass}
                    placeholder="AWS Certified Solutions Architect"
                  />
                </div>
                <div>
                  <label htmlFor="cx-issuer" className={labelClass}>Organisasi Penerbit *</label>
                  <input
                    id="cx-issuer"
                    value={editForm.content?.issuer || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        content: {
                          ...(editForm.content || {}),
                          issuer: e.target.value,
                        },
                      })
                    }
                    className={inputClass}
                    placeholder="Amazon Web Services"
                  />
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-5">
                  <div>
                    <label htmlFor="cx-issueMonth" className={labelClass}>Bulan Terbit</label>
                    <select
                      id="cx-issueMonth"
                      value={editForm.content?.issueMonth || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          content: {
                            ...(editForm.content || {}),
                            issueMonth: e.target.value,
                          },
                        })
                      }
                      className={inputClass}
                    >
                      <option value="">Bulan</option>
                      <option value="01">Januari</option>
                      <option value="02">Februari</option>
                      <option value="03">Maret</option>
                      <option value="04">April</option>
                      <option value="05">Mei</option>
                      <option value="06">Juni</option>
                      <option value="07">Juli</option>
                      <option value="08">Agustus</option>
                      <option value="09">September</option>
                      <option value="10">Oktober</option>
                      <option value="11">November</option>
                      <option value="12">Desember</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="cx-issueYear" className={labelClass}>Tahun Terbit *</label>
                    <input
                      id="cx-issueYear"
                      value={editForm.content?.issueYear || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          content: {
                            ...(editForm.content || {}),
                            issueYear: e.target.value,
                          },
                        })
                      }
                      className={inputClass}
                      placeholder="2024"
                      style={{ colorScheme: "light" }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-5">
                  <div>
                    <label htmlFor="cx-expiryMonth" className={labelClass}>Bulan Expired</label>
                    <select
                      id="cx-expiryMonth"
                      value={editForm.content?.expiryMonth || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          content: {
                            ...(editForm.content || {}),
                            expiryMonth: e.target.value,
                          },
                        })
                      }
                      className={inputClass}
                    >
                      <option value="">Bulan</option>
                      <option value="01">Januari</option>
                      <option value="02">Februari</option>
                      <option value="03">Maret</option>
                      <option value="04">April</option>
                      <option value="05">Mei</option>
                      <option value="06">Juni</option>
                      <option value="07">Juli</option>
                      <option value="08">Agustus</option>
                      <option value="09">September</option>
                      <option value="10">Oktober</option>
                      <option value="11">November</option>
                      <option value="12">Desember</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="cx-expiryYear" className={labelClass}>Tahun Expired</label>
                    <input
                      id="cx-expiryYear"
                      value={editForm.content?.expiryYear || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          content: {
                            ...(editForm.content || {}),
                            expiryYear: e.target.value,
                          },
                        })
                      }
                      className={inputClass}
                      placeholder="2027"
                      style={{ colorScheme: "light" }}
                    />
                  </div>
                </div>
                <div className="-mt-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="noExpiry"
                    checked={editForm.content?.noExpiry || false}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        content: {
                          ...(editForm.content || {}),
                          noExpiry: e.target.checked,
                          expiryMonth: "",
                          expiryYear: "",
                        },
                      })
                    }
                    className="h-4 w-4 rounded border-rule accent-[#1f45c9]"
                  />
                  <label htmlFor="noExpiry" className="text-sm text-ink-soft">
                    Tidak ada masa berlaku (seumur hidup)
                  </label>
                </div>
                <div className={groupClass}>
                  <h4 className={groupTitleClass}>Detail tambahan</h4>
                  <div className="grid gap-x-3 gap-y-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="cx-credentialId" className={labelClass}>Credential ID</label>
                      <input
                        id="cx-credentialId"
                        value={editForm.content?.credentialId || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            content: {
                              ...(editForm.content || {}),
                              credentialId: e.target.value,
                            },
                          })
                        }
                        className={inputClass}
                        placeholder="ABC123XYZ"
                      />
                    </div>
                    <div>
                      <label htmlFor="cx-credentialUrl" className={labelClass}>Credential URL</label>
                      <div className="flex gap-2">
                        <input
                          id="cx-credentialUrl"
                          value={
                            editForm.content?.credentialUrl ||
                            editForm.content?.credential_url ||
                            ""
                          }
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              content: {
                                ...(editForm.content || {}),
                                credentialUrl: e.target.value,
                              },
                            })
                          }
                          className={inputClass}
                          placeholder="https://credential.example.com/verify/..."
                        />
                        <button
                          type="button"
                          onClick={detectOgImage}
                          className="shrink-0 whitespace-nowrap rounded-md border border-rule bg-white px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-ink-soft"
                        >
                          Deteksi
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={groupClass}>
                  <label htmlFor="cx-cert-skill-search" className={labelClass}>
                    Skill terkait
                  </label>
                  <div className="relative">
                    <input
                      id="cx-cert-skill-search"
                      autoComplete="off"
                      value={certSkillSearch}
                      onChange={(e) => handleCertSkillSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && certSkillSearch) {
                          addCertSkill(certSkillSearch);
                        }
                      }}
                      className={inputClass}
                      placeholder="Mis. TypeScript"
                    />
                    <p className={hintClass}>Ketik lalu tekan Enter, atau pilih dari saran.</p>
                    {certSkillSuggestions.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-rule bg-white shadow-sm">
                        {certSkillSuggestions.map((s: string) => (
                          <button
                            type="button"
                            key={s}
                            onClick={() => addCertSkill(s)}
                            className="block w-full px-3 py-2 text-left text-sm text-ink hover:bg-paper-deep focus-visible:bg-paper-deep focus-visible:outline-none"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex min-h-11 flex-wrap items-center gap-1.5 rounded-md border border-rule bg-paper px-2.5 py-2">
                    {(editForm.content?.skills || []).map((skill: string) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 rounded border border-rule bg-white py-0.5 pl-2 pr-1 text-xs text-ink"
                      >
                        {skill}
                        <button
                          type="button"
                          aria-label={`Hapus ${skill}`}
                          onClick={() => removeCertSkill(skill)}
                          className="rounded px-0.5 text-ink-soft hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {(!editForm.content?.skills ||
                      editForm.content.skills.length === 0) && (
                      <span className="text-xs text-ink-soft">
                        Belum ada skill.
                      </span>
                    )}
                  </div>
                </div>
                <div className={groupClass}>
                  <label htmlFor="cx-cert-description" className={labelClass}>
                    Deskripsi
                  </label>
                  <textarea
                    id="cx-cert-description"
                    value={editForm.content?.description || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        content: {
                          ...(editForm.content || {}),
                          description: e.target.value,
                        },
                      })
                    }
                    className={inputClass + " h-24 resize-y"}
                    placeholder="Deskripsi sertifikat..."
                  />
                </div>
                <div className={groupClass}>
                  <h4 className={groupTitleClass}>Gambar sertifikat</h4>
                  <div>
                    <label htmlFor="cx-imageUrl" className={labelClass}>Image URL</label>
                    <input
                      id="cx-imageUrl"
                      value={editForm.content?.imageUrl || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          content: {
                            ...(editForm.content || {}),
                            imageUrl: e.target.value,
                          },
                        })
                      }
                      className={inputClass}
                      placeholder="https://example.com/certificate.jpg"
                    />
                  </div>
                  <p className={hintClass}>
                    URL gambar thumbnail sertifikat.
                  </p>
                </div>
              </div>
            ),
            specialization: (
              <div className="space-y-5">
                <div>
                  <label htmlFor="cx-body" className={labelClass}>Specialization</label>
                  <textarea
                    id="cx-body"
                    value={editForm.content?.body || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        content: {
                          ...(editForm.content || {}),
                          body: e.target.value,
                        },
                      })
                    }
                    className={inputClass + " h-28 resize-y"}
                    placeholder="e.g. Cardiology: heart disease specialist"
                  />
                </div>
              </div>
            ),
            language: (
              <div className="space-y-5">
                <div>
                  <label htmlFor="cx-language" className={labelClass}>Language</label>
                  <input
                    id="cx-language"
                    value={editForm.content?.language || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        content: {
                          ...(editForm.content || {}),
                          language: e.target.value,
                        },
                      })
                    }
                    className={inputClass}
                    placeholder="English"
                  />
                </div>
                <div>
                  <label htmlFor="cx-proficiency" className={labelClass}>Proficiency</label>
                  <select
                    id="cx-proficiency"
                    value={editForm.content?.proficiency || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        content: {
                          ...(editForm.content || {}),
                          proficiency: e.target.value,
                        },
                      })
                    }
                    className={inputClass}
                  >
                    <option value="">Select level</option>
                    <option value="Native">Native</option>
                    <option value="Fluent">Fluent</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Basic">Basic</option>
                  </select>
                </div>
              </div>
            ),
            award: (
              <div className="space-y-5">
                <div>
                  <label htmlFor="cx-title" className={labelClass}>Title</label>
                  <input
                    id="cx-title"
                    value={editForm.content?.title || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        content: {
                          ...(editForm.content || {}),
                          title: e.target.value,
                        },
                      })
                    }
                    className={inputClass}
                    placeholder="Award name"
                  />
                </div>
                <div>
                  <label htmlFor="cx-issuer" className={labelClass}>Issuer</label>
                  <input
                    id="cx-issuer"
                    value={editForm.content?.issuer || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        content: {
                          ...(editForm.content || {}),
                          issuer: e.target.value,
                        },
                      })
                    }
                    className={inputClass}
                    placeholder="Organization"
                  />
                </div>
                <div>
                  <label htmlFor="cx-date" className={labelClass}>Date</label>
                  <input
                    id="cx-date"
                    value={editForm.content?.date || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        content: {
                          ...(editForm.content || {}),
                          date: e.target.value,
                        },
                      })
                    }
                    className={inputClass}
                    style={{ colorScheme: "light" }}
                  />
                </div>
              </div>
            ),
            organization: (
              <div className="space-y-5">
                <div>
                  <label htmlFor="cx-name" className={labelClass}>Name</label>
                  <input
                    id="cx-name"
                    value={editForm.content?.name || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        content: {
                          ...(editForm.content || {}),
                          name: e.target.value,
                        },
                      })
                    }
                    className={inputClass}
                    placeholder="Organization name"
                  />
                </div>
                <div>
                  <label htmlFor="cx-role" className={labelClass}>Role</label>
                  <input
                    id="cx-role"
                    value={editForm.content?.role || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        content: {
                          ...(editForm.content || {}),
                          role: e.target.value,
                        },
                      })
                    }
                    className={inputClass}
                    placeholder="Member"
                  />
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-5">
                  <div>
                    <label htmlFor="cx-start_date" className={labelClass}>Start</label>
                    <input
                      id="cx-start_date"
                      value={editForm.content?.start_date?.slice(0, 7) || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          content: {
                            ...(editForm.content || {}),
                            start_date: e.target.value,
                          },
                        })
                      }
                      className={inputClass}
                      style={{ colorScheme: "light" }}
                    />
                  </div>
                  <div>
                    <label htmlFor="cx-end_date" className={labelClass}>End</label>
                    <input
                      id="cx-end_date"
                      value={editForm.content?.end_date?.slice(0, 7) || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          content: {
                            ...(editForm.content || {}),
                            end_date: e.target.value,
                          },
                        })
                      }
                      className={inputClass}
                      style={{ colorScheme: "light" }}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="cx-description" className={labelClass}>Description</label>
                  <textarea
                    id="cx-description"
                    value={editForm.content?.description || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        content: {
                          ...(editForm.content || {}),
                          description: e.target.value,
                        },
                      })
                    }
                    className={inputClass + " h-24 resize-y"}
                  />
                </div>
              </div>
            ),
          };
          return editorMap[subType] || null;
        }

        return (
          <div className="space-y-5">
            <div>
              <label htmlFor="cx-section-title" className={labelClass}>Section title</label>
              <input
                id="cx-section-title"
                value={editForm.title || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
                className={inputClass}
                placeholder="My Custom Section"
              />
            </div>
            <div>
              <label htmlFor="cx-section-type" className={labelClass}>Type</label>
              <select
                id="cx-section-type"
                value={editForm.type || "text"}
                onChange={(e) =>
                  setEditForm({ ...editForm, type: e.target.value })
                }
                className={inputClass}
              >
                <option value="text">Text</option>
                <option value="list">List</option>
                <option value="html">HTML</option>
              </select>
            </div>
            <div>
              <label htmlFor="cx-section-content" className={labelClass}>Content</label>
              <textarea
                id="cx-section-content"
                value={
                  typeof editForm.content === "string"
                    ? editForm.content
                    : editForm.content?.body || ""
                }
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    content: { body: e.target.value },
                  })
                }
                className={inputClass + " h-36 resize-y"}
                placeholder="Write anything here..."
              />
            </div>
          </div>
        );

}
