'use client';

import React from 'react';

export default function DashboardCustomEditor(props: any) {
  const { activeSection, normalizeCustomTitle, typedSectionMap, editForm, setEditForm, inputClass, labelClass, certSkillSearch, handleCertSkillSearch, addCertSkill, certSkillSuggestions, removeCertSkill, detectOgImage } = props;
        const sectionLabel = normalizeCustomTitle(activeSection.label);
        const subType = typedSectionMap[sectionLabel] || null;
        const isTypedSection = Boolean(subType);

        if (isTypedSection && subType) {
          const editorMap: Record<string, React.ReactElement> = {
            education: (
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Institution</label>
                  <input
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
                  <label className={labelClass}>Degree</label>
                  <input
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
                  <label className={labelClass}>Field</label>
                  <input
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Start</label>
                    <input
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
                      style={{ colorScheme: "dark" }}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>End</label>
                    <input
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
                      style={{ colorScheme: "dark" }}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>GPA</label>
                  <input
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
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Nama Sertifikat *</label>
                  <input
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
                  <label className={labelClass}>Organisasi Penerbit *</label>
                  <input
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Bulan Terbit</label>
                    <select
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
                    <label className={labelClass}>Tahun Terbit *</label>
                    <input
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
                      style={{ colorScheme: "dark" }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Bulan Expired</label>
                    <select
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
                    <label className={labelClass}>Tahun Expired</label>
                    <input
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
                      style={{ colorScheme: "dark" }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
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
                    className="w-4 h-4 rounded border-purple-500 bg-[#1a1a3a] text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="noExpiry" className="text-sm text-gray-300">
                    Tidak ada masa berlaku (seumur hidup)
                  </label>
                </div>
                <div className="border-t border-purple-900/20 pt-4">
                  <h4 className="text-sm font-semibold text-gray-300 mb-3">
                    Detail Tambahan
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Credential ID</label>
                      <input
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
                      <label className={labelClass}>Credential URL</label>
                      <div className="flex gap-2">
                        <input
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
                          onClick={detectOgImage}
                          className="px-3 py-2 rounded-lg text-xs font-medium text-white whitespace-nowrap"
                          style={{ backgroundColor: "var(--accent, #8b5cf6)" }}
                        >
                          Deteksi
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-purple-900/20 pt-4">
                  <h4 className="text-sm font-semibold text-gray-300 mb-3">
                    Skill Terkait
                  </h4>
                  <div className="relative">
                    <input
                      value={certSkillSearch}
                      onChange={(e) => handleCertSkillSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && certSkillSearch) {
                          addCertSkill(certSkillSearch);
                        }
                      }}
                      className={inputClass}
                      placeholder="Ketik untuk mencari... (Enter untuk tambah)"
                    />
                    {certSkillSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-[#1a1a3a] border border-purple-900/30 rounded-lg overflow-hidden">
                        {certSkillSuggestions.map((s: string) => (
                          <button
                            key={s}
                            onClick={() => addCertSkill(s)}
                            className="w-full text-left px-4 py-2 text-sm text-white hover:bg-purple-900/30 transition"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-[#1a1a3a] border border-purple-900/30 rounded-lg mt-2">
                    {(editForm.content?.skills || []).map((skill: string) => (
                      <span
                        key={skill}
                        className="flex items-center gap-1 px-3 py-1 bg-purple-600/30 text-purple-300 text-xs rounded-full"
                      >
                        {skill}
                        <button
                          onClick={() => removeCertSkill(skill)}
                          className="hover:text-red-400 ml-1"
                        >
                          *
                        </button>
                      </span>
                    ))}
                    {(!editForm.content?.skills ||
                      editForm.content.skills.length === 0) && (
                      <span className="text-gray-500 text-xs">
                        Belum ada skill ditambahkan
                      </span>
                    )}
                  </div>
                </div>
                <div className="border-t border-purple-900/20 pt-4">
                  <h4 className="text-sm font-semibold text-gray-300 mb-3">
                    Deskripsi
                  </h4>
                  <textarea
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
                    className={inputClass + " h-20 resize-none"}
                    placeholder="Deskripsi sertifikat..."
                  />
                </div>
                <div className="border-t border-purple-900/20 pt-4">
                  <h4 className="text-sm font-semibold text-gray-300 mb-3">
                    Gambar Sertifikat
                  </h4>
                  <div>
                    <label className={labelClass}>Image URL</label>
                    <input
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
                  <p className="text-xs text-gray-500 mt-1">
                    URL gambar thumbnail sertifikat
                  </p>
                </div>
              </div>
            ),
            specialization: (
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Specialization</label>
                  <textarea
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
                    className={inputClass + " h-24 resize-none"}
                    placeholder="e.g. Cardiology: heart disease specialist"
                  />
                </div>
              </div>
            ),
            language: (
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Language</label>
                  <input
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
                  <label className={labelClass}>Proficiency</label>
                  <select
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
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Title</label>
                  <input
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
                  <label className={labelClass}>Issuer</label>
                  <input
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
                  <label className={labelClass}>Date</label>
                  <input
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
                    style={{ colorScheme: "dark" }}
                  />
                </div>
              </div>
            ),
            organization: (
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Name</label>
                  <input
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
                  <label className={labelClass}>Role</label>
                  <input
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Start</label>
                    <input
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
                      style={{ colorScheme: "dark" }}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>End</label>
                    <input
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
                      style={{ colorScheme: "dark" }}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
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
                    className={inputClass + " h-20 resize-none"}
                  />
                </div>
              </div>
            ),
          };
          return editorMap[subType] || null;
        }

        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Section Title</label>
              <input
                value={editForm.title || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
                className={inputClass}
                placeholder="My Custom Section"
              />
            </div>
            <div>
              <label className={labelClass}>Type</label>
              <select
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
              <label className={labelClass}>Content</label>
              <textarea
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
                className={inputClass + " h-32 resize-none"}
                placeholder="Write anything here..."
              />
            </div>
          </div>
        );

}
