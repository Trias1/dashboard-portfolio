"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import api, { initAuth } from "@/lib/api";
import {
  defaultSections,
  Section,
  availableSections,
  themes,
  getThemeById,
  normalizeThemeId,
} from "@/lib/sections";
import DeleteSectionModal from "@/components/builder/DeleteSectionModal";
import AnalyticsPanel from "@/components/dashboard/AnalyticsPanel";
import GitHubPanel from "@/components/dashboard/GitHubPanel";
import SuperadminPanel from "@/components/dashboard/SuperadminPanel";
import AdminOverviewPanel from "@/components/dashboard/AdminOverviewPanel";
import UsersPanel from "@/components/dashboard/UsersPanel";
import CVPanel from "@/components/dashboard/CVPanel";
import AdvisorWidget from "@/components/AdvisorWidget";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useDashboardAdmin } from "@/hooks/useDashboardAdmin";
import { useDashboardPortfolio } from "@/hooks/useDashboardPortfolio";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardProfileModal from "@/components/dashboard/DashboardProfileModal";
import DashboardAddSectionModal from "@/components/dashboard/DashboardAddSectionModal";
import DashboardPreview from "@/components/dashboard/DashboardPreview";
import DashboardBuilder from "@/components/dashboard/DashboardBuilder";
import { ServiceEditor, TestimonialEditor } from "@/components/dashboard/DashboardSimpleEditors";
import { HeroEditor, ContactEditor, SkillsEditor } from "@/components/dashboard/DashboardCoreEditors";
import GalleryEditor from "@/components/dashboard/GalleryEditor";
import DashboardCustomEditor from "@/components/dashboard/DashboardCustomEditor";
import { AboutEditor, ExperienceEditor, ProjectEditor } from "@/components/dashboard/DashboardContentEditors";
import DashboardEditorPanel from "@/components/dashboard/DashboardEditorPanel";
import { dashboardText, SKILL_SUGGESTIONS } from "@/lib/dashboard-data";
import DashboardAccountMenu from "@/components/dashboard/DashboardAccountMenu";
import DashboardPortfolioControls from "@/components/dashboard/DashboardPortfolioControls";
import { useDashboardProfileActions } from "@/hooks/useDashboardProfileActions";
import { useDashboardAnalytics } from "@/hooks/useDashboardAnalytics";
import { useDashboardGitHubImport } from "@/hooks/useDashboardGitHubImport";

function parseSectionsOrder(value: any): Section[] {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const { users, adminStats, vercelLogs, vercelLogsLoading, vercelLogsError, fetchUsers, fetchAdminStats, fetchVercelLogs } = useDashboardAdmin();
  const { portfolio, setPortfolio, sections, setSections, activeSection, setActiveSection, selectedTheme, setSelectedTheme, previewData, previewLoading, loadPreview } = useDashboardPortfolio();
  const [user, setUser] = useState<any>(null);
  const [activeMenu, setActiveMenu] = useState("builder"); // akan di-override setelah user load
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    photo_url: "",
  });
  const [profileMsg, setProfileMsg] = useState("");
  const [profileError, setProfileError] = useState("");
  const { logout: handleLogout, updateProfile: handleUpdateProfile } = useDashboardProfileActions({ user, profileForm, setUser, setProfileForm, setProfileMsg, setProfileError, router });
  const { visits, setVisits, dateFrom, setDateFrom, dateTo, setDateTo, fetchVisits } = useDashboardAnalytics();
  const { githubUsername, setGithubUsername, githubPreview, setGithubPreview, githubLoading, setGithubLoading, githubImporting, setGithubImporting, githubMsg, setGithubMsg, githubOptions, setGithubOptions, selectedProjects, setSelectedProjects } = useDashboardGitHubImport();

  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"success" | "error" | "">("");
  const [saveMsg, setSaveMsg] = useState("");
  const [skillSearch, setSkillSearch] = useState("");
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const [certSkillSearch, setCertSkillSearch] = useState("");
  const [certSkillSuggestions, setCertSkillSuggestions] = useState<string[]>(
    [],
  );
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [listData, setListData] = useState<any[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAllItems, setShowAllItems] = useState(false);
  const allowedSectionTypes = availableSections.map((section) => section.type);
  const [lang, setLang] = useState<"id" | "en">("id");
  const [toggleVersion, setToggleVersion] = useState(0);
  const [deleteSection, setDeleteSection] = useState<Section | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    if (!user) return;
    const beat = () => api.post('/api/auth/heartbeat').catch(() => undefined);
    beat();
    const timer = window.setInterval(beat, 120000);
    return () => window.clearInterval(timer);
  }, [user]);
  useEffect(() => {
    const stored = localStorage.getItem("user"); // role only
    if (!stored) {
      router.push("/login");
      return;
    }
    const u = JSON.parse(stored);
    if (u.role !== "admin" && u.role !== "superadmin") {
      router.push("/");
      return;
    }
    setUser(u);
    setProfileForm((prev) => ({
      ...prev,
      name: u.name || "",
      photo_url: u.photo_url || "",
    }));
    if (u.role === "superadmin") setActiveMenu("superadmin");
    // Init auth " restore token dari httpOnly cookie dulu
    initAuth().then((ok) => {
      if (!ok) {
        router.push("/login");
        return;
      }
      // Fetch fresh user data dari API
      api
        .get("/api/auth/me", { headers: { "Cache-Control": "no-cache" } })
        .then((res) => {
          setUser(res.data);
          localStorage.setItem(
            "user",
            JSON.stringify({
              role: res.data.role,
              photo_url: res.data.photo_url,
              name: res.data.name,
            }),
          );
          setProfileForm({
            name: res.data.name || "",
            email: res.data.email || "",
            password: "",
            confirmPassword: "",
            photo_url: res.data.photo_url || "",
          });
        })
        .catch(() => {});

      api
        .get("/api/portfolios/my")
        .then((res) => {
          const portfolios = res.data;
          if (portfolios.length > 0) {
            const p = portfolios[0];
            setPortfolio(p);
            loadPreview(p.slug);
            // Load sections dari DB
            const parsedSectionsOrder = parseSectionsOrder(p.sections_order);
            if (parsedSectionsOrder.length > 0) {
              const dbSections = parsedSectionsOrder.filter((s: any) =>
                allowedSectionTypes.includes(s.type),
              );
              const merged = defaultSections.map((def) => {
                const saved = dbSections.find((s: any) =>
                  s.type === "custom"
                    ? s.label === def.label
                    : s.type === def.type,
                );
                return saved ? { ...def, ...saved } : def;
              });
              const customDefaultLabels = new Set(
                defaultSections
                  .filter((d) => d.type === "custom")
                  .map((d) => d.label),
              );
              const extras = dbSections.filter((s: any) => {
                if (s.type === "custom") return !customDefaultLabels.has(s.label);
                return !defaultSections.find((d) => d.type === s.type);
              });
              setSections([...merged, ...extras]);
            }
          }
        })
        .catch((err) => console.error("Failed to fetch portfolio", err));
    });
    const savedLang = localStorage.getItem("lang") as "id" | "en";
    if (savedLang) setLang(savedLang);
    const savedSections = localStorage.getItem("portfolio-sections");
    const savedTheme = localStorage.getItem("portfolio-theme");
    if (savedSections) {
      const parsed = JSON.parse(savedSections).filter((s: any) =>
        allowedSectionTypes.includes(s.type),
      );
      const merged = defaultSections.map((def) => {
        const saved = parsed.find((s: any) =>
          s.type === "custom" ? s.label === def.label : s.type === def.type,
        );
        return saved ? { ...def, ...saved } : def;
      });
      const customDefaultLabels = new Set(
        defaultSections.filter((d) => d.type === "custom").map((d) => d.label),
      );
      const extras = parsed.filter((s: any) => {
        if (s.type === "custom") return !customDefaultLabels.has(s.label);
        return !defaultSections.find((d) => d.type === s.type);
      });
      setSections([...merged, ...extras]);
    }
    if (savedTheme) {
      try {
        setSelectedTheme(getThemeById(JSON.parse(savedTheme)?.id));
      } catch {
        setSelectedTheme(themes[0]);
      }
    }

  }, []);

  useEffect(() => {
    if (!user) return;
    if (activeMenu === "users") fetchUsers();
    if (activeMenu === "builder") loadPreview();
    if (activeMenu === "analytics") fetchVisits();
    if (activeMenu === "github") {
      setGithubPreview(null);
      setGithubMsg("");
    }
    if (activeMenu === "overview" || activeMenu === "superadmin") {
      fetchAdminStats();
      fetchVercelLogs();
    }
  }, [activeMenu, user]);

  useEffect(() => {
    if (!activeSection) return;
    fetchSectionData(activeSection.type);
  }, [activeSection]);

  useEffect(() => {
    if (portfolio?.slug) {
      loadPreview();
    }
  }, [portfolio?.slug]);

  const typedSectionMap: Record<string, string> = {
    Education: "education",
    Certifications: "certification",
    Languages: "language",
    "Specialization Areas": "specialization",
    Awards: "award",
    Organizations: "organization",
  };

  const customTitleAliases: Record<string, string> = {
    Certification: "Certifications",
    "Specialization Area": "Specialization Areas",
  };

  const normalizeCustomTitle = (title?: string) => {
    const trimmed = (title || "").trim();
    return customTitleAliases[trimmed] || trimmed;
  };

  const fetchSectionData = async (type: string, selectedId?: number) => {
    try {
      const apiType = type.split("-")[0];
      const endpoint =
        apiType === "contact" ? "/api/contact" : `/api/${apiType}`;
      const res = await api.get(endpoint);
      if (Array.isArray(res.data)) {
        if (apiType === "custom" && activeSection) {
          const sectionTitle = normalizeCustomTitle(activeSection.label);
          const subType = typedSectionMap[sectionTitle] || "text";
          const matched = res.data.filter(
            (i: any) =>
              normalizeCustomTitle(i.title) === sectionTitle ||
              (subType !== "text" && i.type === subType),
          );
          setListData(matched);
          if (selectedId) {
            const item =
              matched.find((i: any) => i.id === selectedId) || matched[0];
            const content =
              typeof item.content === "string"
                ? JSON.parse(item.content)
                : item.content;
            setEditForm({ ...item, content });
            console.log(
              `... [${sectionTitle}] editForm loaded from row #${item.id}`,
            );
          } else {
            setEditForm({ title: sectionTitle, type: subType, content: {} });
            console.log(`* [${sectionTitle}] Ready for new item`);
          }
          console.log(
            `" [${apiType}] Fetched ${res.data.length} items from DB`,
          );
          console.log(
            `" [${sectionTitle}] Filtered: ${matched.length} of ${res.data.length} custom items`,
          );
        } else {
          setListData(res.data);
          setEditForm({});
          console.log(
            `" [${apiType}] Fetched ${res.data.length} items from DB`,
          );
        }
      } else {
        setListData([]);
        setEditForm(res.data || {});
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over?.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        localStorage.setItem("portfolio-sections", JSON.stringify(newOrder));
        if (portfolio) {
          api
            .put(`/api/portfolios/${portfolio.id}`, {
              title: portfolio.title,
              theme: portfolio.theme,
              is_published: portfolio.is_published,
              template: portfolio.template,
              sections_order: newOrder,
            })
            .then(() => setToggleVersion((version) => version + 1))
            .catch(() => {});
        }
        if (!portfolio) setToggleVersion((version) => version + 1);
        return newOrder;
      });
    }
  };

  const handleToggle = async (id: string) => {
    setSections((prev) => {
      const updated = prev.map((s) =>
        s.id === id ? { ...s, enabled: !s.enabled } : s,
      );
      localStorage.setItem("portfolio-sections", JSON.stringify(updated));
      // Simpan ke DB
      if (portfolio) {
        api
          .put(`/api/portfolios/${portfolio.id}`, {
            title: portfolio.title,
            theme: portfolio.theme,
            is_published: portfolio.is_published,
            template: portfolio.template,
            sections_order: updated,
          })
          .catch((err) => console.error("Failed to save sections", err));
      }
      return updated;
    });
    setToggleVersion((v) => v + 1);
  };

  const handleDelete = (id: string) => {
    const section = sections.find((s) => s.id === id);
    if (section) setDeleteSection(section);
  };

  const handleHideSection = (sectionOrId: string | Section) => {
    const id = typeof sectionOrId === "string" ? sectionOrId : sectionOrId.id;
    setSections((prev) => {
      const updated = prev.map((s) =>
        s.id === id ? { ...s, enabled: false } : s,
      );
      localStorage.setItem("portfolio-sections", JSON.stringify(updated));
      if (portfolio) {
        api
          .put(`/api/portfolios/${portfolio.id}`, {
            title: portfolio.title,
            theme: portfolio.theme,
            is_published: portfolio.is_published,
            template: portfolio.template,
            sections_order: updated,
          })
          .catch(() => {});
      }
      return updated;
    });
    if (activeSection?.id === id) setActiveSection(null);
  };

  const handleDeleteSectionData = async (section: Section) => {
    const type = section.type.split("-")[0];
    console.log(
      "[DELETE] Calling API:",
      `/api/portfolio/sections/${section.id}`,
      {
        portfolioId: portfolio?.id,
        label: type === "custom" ? section.label : undefined,
      },
    );
    const res = await api.delete(`/api/portfolio/sections/${section.id}`, {
      data: {
        portfolioId: portfolio?.id,
        sectionId: section.id,
        label: section.label,
        sectionType: type,
        deleteData: true,
      },
    });
    console.log("[DELETE] Response:", res.status, res.data);
    if (!res.data?.message) throw new Error("Gagal menghapus section");
    setSections((prev) => {
      const updated = prev.filter((s) => s.id !== section.id);
      localStorage.setItem("portfolio-sections", JSON.stringify(updated));
      return updated;
    });
    if (activeSection?.id === section.id) setActiveSection(null);
    if (portfolio?.slug) loadPreview(portfolio.slug);
  };

  const handleAddSection = async (type: any, label: string, icon: string) => {
    const id = `${type}-${Date.now()}`;
    const newSection: Section = {
      id,
      type,
      label,
      icon,
      enabled: true,
      deletable: true,
    };

    const updated = [...sections, newSection];
    setSections(updated);
    setActiveSection(newSection);
    localStorage.setItem("portfolio-sections", JSON.stringify(updated));
    setShowAddSection(false);

    if (portfolio) {
      try {
        const res = await api.put(`/api/portfolios/${portfolio.id}`, {
          title: portfolio.title,
          theme: portfolio.theme,
          is_published: portfolio.is_published,
          template: portfolio.template,
          sections_order: updated,
        });
        setPortfolio(res.data || { ...portfolio, sections_order: updated });
        await loadPreview(portfolio.slug);
      } catch (err) {
        console.error("Failed to save added section", err);
      }
    }

    if (type === "custom") {
      const subType = typedSectionMap[label] || "text";
      setEditForm({ title: label, type: subType, content: {} });
    }
  };

  const handleThemeChange = async (theme: any) => {
    setSelectedTheme(theme);
    localStorage.setItem("portfolio-theme", JSON.stringify(theme));
    if (portfolio) {
      try {
        await api.put(`/api/portfolios/${portfolio.id}`, {
          title: portfolio.title,
          theme: normalizeThemeId(theme.id),
          sections_order: portfolio.sections_order,
          is_published: portfolio.is_published,
        });
        setPortfolio({ ...portfolio, theme: normalizeThemeId(theme.id) });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleTogglePublish = async () => {
    if (!portfolio) return;
    try {
      const res = await api.patch(`/api/portfolios/${portfolio.id}`, {
        publish: !portfolio.is_published,
      });
      setPortfolio(res.data);
      setPortfolio({ ...portfolio, ...res.data });
    } catch (err) {
      console.error(err);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSkillSearch = (val: string) => {
    setSkillSearch(val);
    if (val.length > 0) {
      const filtered = SKILL_SUGGESTIONS.filter((s) =>
        s.toLowerCase().includes(val.toLowerCase()),
      );
      setSkillSuggestions(filtered.slice(0, 6));
    } else {
      setSkillSuggestions([]);
    }
  };

  const addSkill = (skill: string) => {
    const current = editForm.skills || "";
    const skillList = current
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean);
    if (!skillList.includes(skill)) {
      setEditForm({ ...editForm, skills: [...skillList, skill].join(", ") });
    }
    setSkillSearch("");
    setSkillSuggestions([]);
  };

  const removeSkill = (skill: string) => {
    const skillList = (editForm.skills || "")
      .split(",")
      .map((s: string) => s.trim())
      .filter((s: string) => s !== skill);
    setEditForm({ ...editForm, skills: skillList.join(", ") });
  };

  const handleCertSkillSearch = (val: string) => {
    setCertSkillSearch(val);
    if (val.length > 0) {
      const filtered = SKILL_SUGGESTIONS.filter((s) =>
        s.toLowerCase().includes(val.toLowerCase()),
      );
      setCertSkillSuggestions(filtered.slice(0, 6));
    } else {
      setCertSkillSuggestions([]);
    }
  };

  const addCertSkill = (skill: string) => {
    const current: string[] = editForm.content?.skills || [];
    if (!current.includes(skill)) {
      setEditForm({
        ...editForm,
        content: { ...(editForm.content || {}), skills: [...current, skill] },
      });
    }
    setCertSkillSearch("");
    setCertSkillSuggestions([]);
  };

  const removeCertSkill = (skill: string) => {
    const current: string[] = editForm.content?.skills || [];
    setEditForm({
      ...editForm,
      content: {
        ...(editForm.content || {}),
        skills: current.filter((s: string) => s !== skill),
      },
    });
  };

  const detectOgImage = async () => {
    const credUrl =
      editForm.content?.credentialUrl || editForm.content?.credential_url;
    if (!credUrl) return;
    try {
      const { data } = await api.post("/api/og-image", { url: credUrl });
      if (data?.image) {
        setEditForm({
          ...editForm,
          content: { ...(editForm.content || {}), imageUrl: data.image },
        });
      }
    } catch {}
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg("");
    setSaveStatus("");

    try {
      const type = activeSection?.type.split("-")[0];
      if (!type) return;

      const formData = { ...editForm };

      if (type === "experience") {
        if (formData.start_date && formData.start_date.length === 7)
          formData.start_date += "-01";

        if (formData.end_date && formData.end_date.length === 7)
          formData.end_date += "-01";
      }

      if (photoFile && type === "about") {
        const reader = new FileReader();
        reader.readAsDataURL(photoFile);

        await new Promise((resolve) => {
          reader.onload = resolve;
        });

        formData.photo_url = reader.result;
      }

      if (type === "custom") {
        const sectionTitle = normalizeCustomTitle(activeSection?.label);
        const isTyped = typedSectionMap[sectionTitle];

        if (isTyped) {
          const payload = {
            title: sectionTitle,
            type: isTyped,
            content: formData.content || {},
          };

          if (formData.id) {
            await api.put(`/api/custom/${formData.id}`, payload);
            console.log(`Updated ${sectionTitle} item #${formData.id}`);
          } else {
            await api.post("/api/custom", payload);
            console.log(`Inserted new ${sectionTitle} item`);
          }
        } else {
          const payload = {
            title: formData.title,
            type: formData.type || "text",
            content: {
              body: formData.content?.body || "",
            },
          };

          if (formData.id) {
            await api.put(`/api/custom/${formData.id}`, payload);
          } else {
            await api.post("/api/custom", payload);
          }
        }
      } else {
        const listTypes = [
          "experience",
          "projects",
          "services",
          "testimonials",
          "skills",
          "gallery",
        ];

        if (listTypes.includes(type)) {
          await api.post(`/api/${type}`, formData);
        } else if (type === "contact") {
          await api.put("/api/contact", formData);
        } else {
          await api.put(`/api/${type}`, formData);
        }
      }

      // Success
      setSaveMsg("Saved!");
      setSaveStatus("success");

      setPhotoFile(null);
      setPhotoPreview("");

      if (activeSection) {
        await fetchSectionData(activeSection.type, formData.id);
      }

      await loadPreview();
      setToggleVersion((v) => v + 1);

      setTimeout(() => {
        setSaveMsg("");
        setSaveStatus("");
      }, 3000);
    } catch (err: any) {
      console.error(err);

      setSaveMsg(err.response?.data?.message || "Save failed");
      setSaveStatus("error");

      setTimeout(() => {
        setSaveMsg("");
        setSaveStatus("");
      }, 3000);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full bg-[#1a1a3a] border border-purple-900/30 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition text-sm";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1";
  const t2 = (key: keyof typeof dashboardText) => dashboardText[key][lang];

  const renderPreview = () => (
    <DashboardPreview
      portfolio={portfolio}
      previewData={previewData}
      previewLoading={previewLoading}
      sections={sections}
      selectedTheme={selectedTheme}
      toggleVersion={toggleVersion}
      setPortfolio={setPortfolio}
      onThemeChange={handleThemeChange}
      onRefresh={() => loadPreview()}
    />
  );
  const renderEditForm = () => {
    if (!activeSection) return null;
    const type = activeSection.type.split("-")[0];
    const fields: Record<string, React.ReactElement> = {
      about: <AboutEditor value={editForm} onChange={setEditForm} photoPreview={photoPreview} onPhotoChange={handlePhotoChange} setMessage={setSaveMsg} />,
      experience: <ExperienceEditor value={editForm} onChange={setEditForm} />,
      projects: <ProjectEditor value={editForm} onChange={setEditForm} />,
      services: <ServiceEditor value={editForm} onChange={setEditForm} />,
      testimonials: <TestimonialEditor value={editForm} onChange={setEditForm} />,
      hero: <HeroEditor value={editForm} onChange={setEditForm} />,
      contact: <ContactEditor value={editForm} onChange={setEditForm} />,
      skills: <SkillsEditor value={editForm} onChange={setEditForm} search={skillSearch} suggestions={skillSuggestions} onSearch={handleSkillSearch} onAdd={addSkill} onRemove={removeSkill} />,
      gallery: <GalleryEditor value={editForm} onChange={setEditForm} setMessage={setSaveMsg} onRefresh={async () => { await fetchSectionData("gallery"); await loadPreview(); }} />,
      custom: <DashboardCustomEditor activeSection={activeSection} normalizeCustomTitle={normalizeCustomTitle} typedSectionMap={typedSectionMap} editForm={editForm} setEditForm={setEditForm} inputClass={inputClass} labelClass={labelClass} certSkillSearch={certSkillSearch} handleCertSkillSearch={handleCertSkillSearch} addCertSkill={addCertSkill} certSkillSuggestions={certSkillSuggestions} removeCertSkill={removeCertSkill} detectOgImage={detectOgImage} />,
    };
    return <DashboardEditorPanel activeSection={activeSection} field={fields[type]} saveMsg={saveMsg} saveStatus={saveStatus} listData={listData} showAllItems={showAllItems} saving={saving} saveLabel={t2("save")} savingLabel={t2("saving")} normalizeCustomTitle={normalizeCustomTitle} typedSectionMap={typedSectionMap} onClose={() => setActiveSection(null)} onSave={handleSave} onEditStored={(item) => setEditForm({ ...item, content: typeof item.content === "string" ? JSON.parse(item.content) : item.content })} onDeleteStored={async (item) => { if (!confirm("Delete this item?")) return; try { await api.delete(`/api/${activeSection.type.split("-")[0]}/${item.id}`); setListData((previous) => previous.filter((entry: any) => entry.id !== item.id)); await loadPreview(); } catch { setSaveMsg("Failed to delete"); } }} onToggleItems={() => setShowAllItems(!showAllItems)} />;
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex">
      <DashboardAddSectionModal
        open={showAddSection}
        lang={lang}
        sections={sections}
        onClose={() => setShowAddSection(false)}
        onAdd={handleAddSection}
      />
      <DashboardProfileModal
        open={showProfile}
        lang={lang}
        profileForm={profileForm}
        profileMsg={profileMsg}
        profileError={profileError}
        setProfileForm={setProfileForm}
        setProfileError={setProfileError}
        onSubmit={handleUpdateProfile}
        onClose={() => {
          setShowProfile(false);
          setProfileMsg("");
          setProfileError("");
        }}
      />
      <DashboardSidebar
        role={user?.role}
        lang={lang}
        activeMenu={activeMenu}
        sidebarOpen={sidebarOpen}
        setActiveMenu={setActiveMenu}
        setSidebarOpen={setSidebarOpen}
        usersLabel={t2("users")}
      />
      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Dashboard header */}
        <DashboardHeader>
          <DashboardPortfolioControls
            portfolio={portfolio}
            activeMenu={activeMenu}
            lang={lang}
            onLangChange={(next) => { setLang(next); localStorage.setItem("lang", next); }}
            onTogglePublish={handleTogglePublish}
            setPortfolio={setPortfolio}
            account={<DashboardAccountMenu user={user} lang={lang} open={showUserMenu} onToggle={() => setShowUserMenu(!showUserMenu)} onProfile={() => { setShowProfile(true); setShowUserMenu(false); }} onLogout={() => { handleLogout(); setShowUserMenu(false); }} />}
          />
        </DashboardHeader>
        {/* Content area */}
        {activeMenu === "builder" && (
          <DashboardBuilder
            lang={lang}
            sections={sections}
            activeSection={activeSection}
            sensors={sensors}
            setShowAddSection={setShowAddSection}
            setActiveSection={setActiveSection}
            onDragEnd={handleDragEnd}
            onToggle={handleToggle}
            onDelete={handleDelete}
            editor={renderEditForm()}
            preview={renderPreview()}
          />
        )}
        {activeMenu === "advisor" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <AdvisorWidget />
          </div>
        )}

        {activeMenu === "analytics" && (
          <AnalyticsPanel
            visits={visits}
            setVisits={setVisits}
            dateFrom={dateFrom}
            dateTo={dateTo}
            setDateFrom={setDateFrom}
            setDateTo={setDateTo}
          />
        )}

        {activeMenu === "github" && (
          <GitHubPanel
            githubUsername={githubUsername}
            setGithubUsername={setGithubUsername}
            githubPreview={githubPreview}
            setGithubPreview={setGithubPreview}
            githubLoading={githubLoading}
            setGithubLoading={setGithubLoading}
            githubImporting={githubImporting}
            setGithubImporting={setGithubImporting}
            githubMsg={githubMsg}
            setGithubMsg={setGithubMsg}
            githubOptions={githubOptions}
            setGithubOptions={setGithubOptions}
            selectedProjects={selectedProjects}
            setSelectedProjects={setSelectedProjects}
            loadPreview={loadPreview}
            onImport={(imported) => {
              setSections((prev) => {
                const sectionMap: Record<
                  string,
                  { type: string; label: string; icon: string }
                > = {
                  bio: { type: "about", label: "About", icon: "A" },
                  skills: { type: "skills", label: "Skills", icon: "SK" },
                  projects: { type: "projects", label: "Projects", icon: "P" },
                };
                let updated = [...prev];
                imported.forEach((s: string) => {
                  const info = sectionMap[s];
                  if (info) {
                    const exists = updated.find(
                      (sec) => sec.type === info.type,
                    );
                    if (!exists) {
                      updated.push({
                        id: `${info.type}-${Date.now()}`,
                        type: info.type as any,
                        label: info.label,
                        icon: info.icon,
                        enabled: true,
                        deletable: true,
                      });
                    }
                  }
                });
                localStorage.setItem(
                  "portfolio-sections",
                  JSON.stringify(updated),
                );
                if (portfolio) {
                  api
                    .put(`/api/portfolios/${portfolio.id}`, {
                      title: portfolio.title,
                      theme: portfolio.theme,
                      is_published: portfolio.is_published,
                      template: portfolio.template,
                      sections_order: updated,
                    })
                    .catch(() => {});
                }
                return updated;
              });
            }}
          />
        )}

        {activeMenu === "cv" && (
          <CVPanel
            portfolio={portfolio}
            setSections={setSections}
            loadPreview={loadPreview}
          />
        )}
        {activeMenu === "overview" && <AdminOverviewPanel stats={adminStats} onRefresh={fetchAdminStats} />}
          {activeMenu === "superadmin" && (
          <SuperadminPanel
            adminStats={adminStats}
            vercelLogs={vercelLogs}
            vercelLogsLoading={vercelLogsLoading}
            vercelLogsError={vercelLogsError}
            fetchAdminStats={fetchAdminStats}
            fetchVercelLogs={fetchVercelLogs}
          />
        )}
        {activeMenu === "users" && (
          <UsersPanel users={users} fetchUsers={fetchUsers} />
        )}

        {/* Delete Section Modal */}
        <DeleteSectionModal
          isOpen={deleteSection !== null}
          section={deleteSection}
          onClose={() => setDeleteSection(null)}
          onHide={handleHideSection}
          onDelete={handleDeleteSectionData}
        />
      </div>
    </div>
  );
}



