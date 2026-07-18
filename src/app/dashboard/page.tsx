"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import api, { setToken, initAuth } from "@/lib/api";
import {
  defaultSections,
  Section,
  availableSections,
  themes,
  getThemeById,
  normalizeThemeId,
} from "@/lib/sections";
import SortableSection from "@/components/builder/SortableSection";
import DeleteSectionModal from "@/components/builder/DeleteSectionModal";
import AnalyticsPanel from "@/components/dashboard/AnalyticsPanel";
import GitHubPanel from "@/components/dashboard/GitHubPanel";
import SuperadminPanel from "@/components/dashboard/SuperadminPanel";
import UsersPanel from "@/components/dashboard/UsersPanel";
import CVPanel from "@/components/dashboard/CVPanel";
import AdvisorWidget from "@/components/AdvisorWidget";

const SKILL_SUGGESTIONS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Vue.js",
  "Angular",
  "Node.js",
  "Express",
  "Python",
  "Django",
  "FastAPI",
  "Java",
  "Spring Boot",
  "Go",
  "Rust",
  "PHP",
  "Laravel",
  "Ruby on Rails",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "Docker",
  "Kubernetes",
  "AWS",
  "GCP",
  "Azure",
  "Linux",
  "Nginx",
  "Git",
  "CI/CD",
  "GraphQL",
  "REST API",
  "Tailwind CSS",
  "Figma",
  "Terraform",
  "Ansible",
  "Jenkins",
  "GitHub Actions",
];

function VisitorChart({ data }: { data: any[] }) {
  const chartData = data.map((d: any) => ({
    date: new Date(d.date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
    }),
    visitor: parseInt(d.count),
  }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart
        data={chartData}
        margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorVisitor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a3a" />
        <XAxis
          dataKey="date"
          tick={{ fill: "#6b7280", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#6b7280", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#0f0f2a",
            border: "1px solid #4c1d95",
            borderRadius: "8px",
            color: "#fff",
          }}
          labelStyle={{ color: "#a855f7", fontWeight: "bold" }}
          formatter={(value: any) => [value, "Visitor"]}
        />
        <Area
          type="monotone"
          dataKey="visitor"
          stroke="#a855f7"
          strokeWidth={2}
          fill="url(#colorVisitor)"
          dot={{ fill: "#a855f7", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

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
  const [user, setUser] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [editingSlug, setEditingSlug] = useState(false);
  const [slugInput, setSlugInput] = useState("");
  const [slugMsg, setSlugMsg] = useState("");
  const [editingDomain, setEditingDomain] = useState(false);
  const [domainInput, setDomainInput] = useState("");
  const [domainMsg, setDomainMsg] = useState("");
  const [activeMenu, setActiveMenu] = useState("builder"); // akan di-override setelah user load
  const [sections, setSections] = useState<Section[]>(defaultSections);
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(themes[0]);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    photo_url: "",
  });
  const [profileMsg, setProfileMsg] = useState("");
  const [profileError, setProfileError] = useState("");
  const [users, setUsers] = useState<any[]>([]);
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
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAllItems, setShowAllItems] = useState(false);
  const allowedSectionTypes = availableSections.map((section) => section.type);
  const [lang, setLang] = useState<"id" | "en">("id");
  const [toggleVersion, setToggleVersion] = useState(0);
  const [deleteSection, setDeleteSection] = useState<Section | null>(null);
  const [visits, setVisits] = useState<any>(null);
  const [githubUsername, setGithubUsername] = useState("");
  const [githubPreview, setGithubPreview] = useState<any>(null);
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubImporting, setGithubImporting] = useState(false);
  const [githubMsg, setGithubMsg] = useState("");
  const [githubOptions, setGithubOptions] = useState({
    bio: true,
    skills: true,
    projects: true,
  });
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [cvTemplate, setCvTemplate] = useState("professional");
  const [cvLoading, setCvLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [dateTo, setDateTo] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [adminStats, setAdminStats] = useState<any>(null);
  const [resources, setResources] = useState<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

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
    if (activeMenu === "superadmin") {
      fetchAdminStats();
      fetchResources();
    }
  }, [activeMenu, user]);

  useEffect(() => {
    if (!activeSection) return;
    fetchSectionData(activeSection.type);
  }, [activeSection]);

  const loadPreview = async (slug?: string) => {
    const targetSlug = slug || portfolio?.slug;
    if (!targetSlug) return;
    setPreviewLoading(true);
    try {
      const res = await api.get(`/api/public/${targetSlug}?preview=true`);
      setPreviewData(res.data);
    } catch (err) {
      console.error("Preview load failed", err);
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    if (portfolio?.slug) {
      loadPreview();
    }
  }, [portfolio?.slug]);

  const fetchVisits = async (from?: string, to?: string) => {
    try {
      const f = from || dateFrom;
      const t = to || dateTo;
      const res = await api.get(`/api/portfolios/visits?from=${f}&to=${t}`);
      setVisits(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAdminStats = async () => {
    try {
      const res = await api.get("/api/admin/stats");
      setAdminStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchResources = async () => {
    try {
      const res = await api.get("/api/admin/resources");
      setResources(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/api/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

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
            .catch(() => {});
        }
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

  const handleLogout = async () => {
    await api.post("/api/auth/logout");
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg("");
    setProfileError("");
    if (
      profileForm.password &&
      profileForm.password !== profileForm.confirmPassword
    ) {
      setProfileError("Passwords do not match");
      return;
    }
    try {
      const payload: any = {
        name: profileForm.name,
        email: profileForm.email,
        photo_url: profileForm.photo_url,
      };
      if (profileForm.password) payload.password = profileForm.password;
      const res = await api.put("/api/auth/profile", payload);
      const updatedUser = {
        ...user,
        name: res.data.name,
        email: res.data.email,
        photo_url: res.data.photo_url,
      };
      localStorage.setItem(
        "user",
        JSON.stringify({
          role: updatedUser.role,
          photo_url: updatedUser.photo_url,
          name: updatedUser.name,
        }),
      );
      setUser(updatedUser);
      setProfileForm((prev) => ({
        ...prev,
        name: res.data.name,
        email: res.data.email,
        photo_url: res.data.photo_url || "",
      }));
      setProfileMsg("Profile updated!");
    } catch (err: any) {
      setProfileError(err.response?.data?.message || "Update failed");
    }
  };

  const inputClass =
    "w-full bg-[#1a1a3a] border border-purple-900/30 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition text-sm";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1";
  const txt: Record<string, Record<"id" | "en", string>> = {
    sections: { id: "Bagian", en: "Sections" },
    add: { id: "+ Tambah", en: "+ Add" },
    drag: { id: "Seret  untuk urutan", en: "Drag  to reorder" },
    builder: { id: "Pembuat Portfolio", en: "Portfolio Builder" },
    preview: { id: "Pratinjau", en: "Preview" },
    refresh: { id: "Refresh", en: " Refresh" },
    publish: { id: " Publish", en: " Publish" },
    unpublish: { id: "Unpublish", en: "Unpublish" },
    viewLive: { id: " Lihat Live", en: " View Live" },
    profile: { id: "Edit Profil", en: "Edit Profile" },
    viewPortfolio: { id: " Lihat Portfolio", en: " View Portfolio" },
    logout: { id: " Keluar", en: " Logout" },
    users: { id: "Pengguna", en: "Users" },
    save: { id: "Simpan", en: "Save" },
    saving: { id: "Menyimpan...", en: "Saving..." },
    cancel: { id: "Batal", en: "Cancel" },
    noData: {
      id: "Belum ada data. Mulai isi section kamu!",
      en: "No data yet. Start filling in your sections!",
    },
    draft: { id: " Draft", en: " Draft" },
    live: { id: " Live", en: " Live" },
  };
  const t2 = (key: keyof typeof txt) => txt[key][lang];

  const renderPreview = () => {
    const templateName = portfolio?.template || "modern";
    if (!portfolio)
      return (
        <div className="flex flex-col items-center justify-center h-full text-center py-32">
          <div className="text-6xl mb-4"></div>
          <h3 className="text-xl font-bold text-white mb-2">
            Portfolio Builder
          </h3>
          <p className="text-gray-400 text-sm max-w-sm">
            Drag & drop sections to reorder, toggle to show/hide, click Edit to
            customize.
          </p>
        </div>
      );

    if (previewLoading)
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
        </div>
      );

    const data = previewData;
    const t = getThemeById(portfolio.theme);
    const ac = t.accent;
    const isLight = t.bg === "#ffffff";
    const textColor = isLight ? "#111" : "#fff";
    const subColor = isLight ? "#555" : "#aaa";
    const cardBg = isLight ? "#f5f5f5" : "rgba(255,255,255,0.05)";

    if (!data)
      return (
        <div className="flex flex-col items-center justify-center h-full text-center py-32">
          <div className="text-4xl mb-3"></div>
          <p className="text-gray-400 text-sm">
            No data yet. Start filling in your sections!
          </p>
        </div>
      );

    const {
      hero,
      about,
      experience,
      projects,
      services,
      skills,
      testimonials,
      contact,
      custom,
      gallery,
    } = data;
    const isEnabled = (type: string) => {
      const s = sections.find((s) => s.type.split("-")[0] === type);
      return s ? s.enabled : true;
    };

    return (
      <div
        className="h-full flex flex-col overflow-hidden"
        style={{ backgroundColor: t.bg }}
      >
        {/* Preview badge */}
        <div
          className="flex-shrink-0 flex items-center justify-between px-4 py-2 text-xs font-medium"
          style={{
            backgroundColor: `${ac}22`,
            borderBottom: `1px solid ${ac}33`,
            color: ac,
          }}
        >
          <span> Preview template: {templateName}</span>
          <div className="flex items-center gap-2">
            {/* Theme picker mini */}
            <div className="flex items-center gap-1">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme)}
                  title={theme.label}
                  className={`w-4 h-4 rounded-full border-2 transition-all ${selectedTheme.id === theme.id ? "border-white scale-125" : "border-transparent hover:border-gray-400"}`}
                  style={{ backgroundColor: theme.accent }}
                />
              ))}
            </div>
            <div className="w-px h-4 bg-white/10" />
            {/* Template picker di preview */}
            <div className="flex items-center gap-1">
              <select
                value={portfolio?.template || "modern"}
                disabled={portfolio?.is_published}
                onChange={async (e) => {
                  if (!portfolio || portfolio.is_published) return;

                  const newTemplate = e.target.value;

                  try {
                    const res = await api.put(
                      `/api/portfolios/${portfolio.id}`,
                      {
                        title: portfolio.title,
                        theme: portfolio.theme,
                        sections_order: portfolio.sections_order,
                        is_published: portfolio.is_published,
                        template: newTemplate,
                      },
                    );

                    setPortfolio(res.data);
                  } catch (err) {
                    console.error("Template update failed", err);
                  }
                }}
                className={`text-xs border rounded-lg px-2 py-1 transition outline-none ${
                  portfolio?.is_published
                    ? "bg-[#0f0f2a] border-white/10 text-gray-600 cursor-not-allowed"
                    : "bg-[#0f0f2a] border-purple-500/60 text-white cursor-pointer hover:border-purple-400"
                }`}
                style={{
                  colorScheme: "dark",
                  backgroundColor: "#0f0f2a",
                  color: portfolio?.is_published ? "#4b5563" : "#ffffff",
                }}
              >
                {[
                  ["modern", "Modern"],
                  ["creative", "Creative"],
                  ["minimal", "Minimal"],
                  ["bold", "Bold"],
                  ["classic", "Classic"],
                  ["neon", "Neon"],
                  ["glass", "Glass"],
                  ["nature", "Nature"],
                  ["vibrant", "Vibrant"],
                  ["retro", "Retro"],
                  ["immersive", "Immersive"],
                  ["playful", "Playful"],
                  ["developer", "Developer"],
                  ["swiss", "Swiss"],
                  ["white", "White"],
                  ["agency", "Agency"],
                  ["boldpersona", "BoldPersona"],
                  ["education-platform", "Education Platform"],
                  ["fintech-crypto", "Fintech Crypto"],
                  ["payment-gateway", "Payment Gateway"],
                  ["defi-yield", "DeFi Yield"],
                  ["creative-agency", "Creative Agency"],
                  ["gaming-platform", "Gaming Platform"],
                  ["nft-cyberpunk", "NFT Cyberpunk"],
                  ["developer-tools", "Developer Tools"],
                ].map(([value, label]) => (
                  <option
                    key={value}
                    value={value}
                    className="bg-[#0f0f2a] text-white"
                    style={{
                      backgroundColor: "#0f0f2a",
                      color: "#ffffff",
                    }}
                  >
                    {label}
                  </option>
                ))}
              </select>
              {portfolio?.is_published && (
                <span
                  className="text-xs text-gray-600"
                  title="Unpublish dulu untuk ganti template"
                >
                  "'
                </span>
              )}
            </div>
            <button
              onClick={() => loadPreview()}
              className="px-3 py-1 rounded-full text-xs font-medium transition hover:opacity-80"
              style={{ backgroundColor: `${ac}33`, color: ac }}
            >
              Refresh
            </button>
          </div>
        </div>

        {/* iframe preview */}
        {portfolio?.slug ? (
          <iframe
            key={`${portfolio.slug}-${portfolio.template}-${portfolio.theme}-${toggleVersion}`}
            src={`/portfolio/${portfolio.slug}?preview=true&hidden=${sections
              .filter((s) => !s.enabled)
              .map((s) => s.type.split("-")[0])
              .join(",")}`}
            className="flex-1 w-full border-0"
            style={{ display: "block", minHeight: 0 }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            No portfolio found
          </div>
        )}
      </div>
    );
  };

  const renderEditForm = () => {
    if (!activeSection) return null;
    const type = activeSection.type.split("-")[0];

    const fields: Record<string, React.ReactElement> = {
      about: (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Profile Photo</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-[#1a1a3a] border border-purple-900/30 flex items-center justify-center">
                {photoPreview || editForm.photo_url ? (
                  <img
                    src={photoPreview || editForm.photo_url}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">'</span>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="cursor-pointer inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition"
                >
                  "- Upload Photo
                </label>
                <p className="text-xs text-gray-500 mt-1">Or paste URL below</p>
              </div>
            </div>
            <input
              value={editForm.photo_url || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, photo_url: e.target.value })
              }
              className={inputClass + " mt-2"}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className={labelClass}>Name</label>
            <input
              value={editForm.name || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
              className={inputClass}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className={labelClass}>Title</label>
            <input
              value={editForm.title || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, title: e.target.value })
              }
              className={inputClass}
              placeholder="Full Stack Developer"
            />
          </div>
          <div>
            <label className={labelClass}>Bio</label>
            <textarea
              value={editForm.bio || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, bio: e.target.value })
              }
              className={inputClass + " h-32 resize-none"}
              placeholder="Tell about yourself..."
            />
          </div>
          <div>
            <label className={labelClass}>CV / Resume</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              id="cv-upload"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const fd = new FormData();
                fd.append("cv", file);
                try {
                  const res = await api.post("/api/about/upload-cv", fd, {
                    headers: { "Content-Type": "multipart/form-data" },
                  });
                  setEditForm((prev: any) => ({
                    ...prev,
                    cv_url: res.data.cv_url,
                  }));
                  setSaveMsg("... CV uploaded and saved");
                } catch (err: any) {
                  setSaveMsg(
                    " CV upload failed: " +
                      (err.response?.data?.message || err.message),
                  );
                }
              }}
            />
            <div className="flex flex-wrap items-center gap-3">
              <label
                htmlFor="cv-upload"
                className="cursor-pointer inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition"
              >
                " Upload CV
              </label>
              {editForm.cv_url && (
                <a
                  href={editForm.cv_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center px-3 py-2 border border-purple-900/30 text-gray-300 hover:text-white text-sm rounded-lg transition"
                >
                  Open current CV
                </a>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Upload di sini akan langsung menyimpan URL CV ke profil About.
            </p>
            <input
              value={editForm.cv_url || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, cv_url: e.target.value })
              }
              className={inputClass + " mt-2"}
              placeholder="Or paste CV URL..."
            />
          </div>
        </div>
      ),
      experience: (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Company</label>
            <input
              value={editForm.company || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, company: e.target.value })
              }
              className={inputClass}
              placeholder="Company name"
            />
          </div>
          <div>
            <label className={labelClass}>Position</label>
            <input
              value={editForm.position || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, position: e.target.value })
              }
              className={inputClass}
              placeholder="Job title"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Start Date</label>
              <input
                type="month"
                value={editForm.start_date?.slice(0, 7) || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, start_date: e.target.value })
                }
                className={inputClass}
                style={{ colorScheme: "dark" }}
              />
            </div>
            <div>
              <label className={labelClass}>End Date</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.still_working || false}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        still_working: e.target.checked,
                        end_date: e.target.checked ? null : editForm.end_date,
                      })
                    }
                    className="accent-purple-500"
                  />
                  <span className="text-sm text-gray-300">
                    Still working here
                  </span>
                </label>
                {!editForm.still_working && (
                  <input
                    type="month"
                    value={editForm.end_date?.slice(0, 7) || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, end_date: e.target.value })
                    }
                    className={inputClass}
                    style={{ colorScheme: "dark" }}
                  />
                )}
              </div>
            </div>
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={editForm.description || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
              className={inputClass + " h-28 resize-none"}
              placeholder="What did you do?"
            />
          </div>
        </div>
      ),
      projects: (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Title</label>
            <input
              value={editForm.title || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, title: e.target.value })
              }
              className={inputClass}
              placeholder="Project name"
            />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={editForm.description || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
              className={inputClass + " h-24 resize-none"}
              placeholder="What is this project?"
            />
          </div>
          <div>
            <label className={labelClass}>Tech Stack</label>
            <input
              value={editForm.tech_stack || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, tech_stack: e.target.value })
              }
              className={inputClass}
              placeholder="React, Node.js, PostgreSQL"
            />
          </div>
          <div>
            <label className={labelClass}>Demo URL</label>
            <input
              value={editForm.demo_url || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, demo_url: e.target.value })
              }
              className={inputClass}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className={labelClass}>GitHub URL</label>
            <input
              value={editForm.github_url || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, github_url: e.target.value })
              }
              className={inputClass}
              placeholder="https://github.com/..."
            />
          </div>
          <div>
            <label className={labelClass}>Project Image</label>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="project-img"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () =>
                    setEditForm({ ...editForm, image_url: reader.result });
                  reader.readAsDataURL(file);
                }
              }}
            />
            <label
              htmlFor="project-img"
              className="cursor-pointer inline-block px-4 py-2 bg-[#1a1a3a] border border-purple-900/30 text-gray-300 text-sm rounded-lg hover:border-purple-500 transition"
            >
              - Upload Image
            </label>
            <input
              value={editForm.image_url || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, image_url: e.target.value })
              }
              className={inputClass + " mt-2"}
              placeholder="Or paste image URL..."
            />
          </div>
        </div>
      ),
      services: (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Title</label>
            <input
              value={editForm.title || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, title: e.target.value })
              }
              className={inputClass}
              placeholder="Service name"
            />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={editForm.description || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
              className={inputClass + " h-24 resize-none"}
              placeholder="What do you offer?"
            />
          </div>
          <div>
            <label className={labelClass}>Icon (emoji)</label>
            <input
              value={editForm.icon || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, icon: e.target.value })
              }
              className={inputClass}
              placeholder="'"
            />
          </div>
        </div>
      ),
      testimonials: (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Name</label>
            <input
              value={editForm.name || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
              className={inputClass}
              placeholder="Client name"
            />
          </div>
          <div>
            <label className={labelClass}>Position</label>
            <input
              value={editForm.position || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, position: e.target.value })
              }
              className={inputClass}
              placeholder="CEO at Company"
            />
          </div>
          <div>
            <label className={labelClass}>Message</label>
            <textarea
              value={editForm.message || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, message: e.target.value })
              }
              className={inputClass + " h-24 resize-none"}
              placeholder="What they said..."
            />
          </div>
          <div>
            <label className={labelClass}>Photo URL</label>
            <input
              value={editForm.photo_url || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, photo_url: e.target.value })
              }
              className={inputClass}
              placeholder="https://..."
            />
          </div>
        </div>
      ),
      hero: (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Greeting (optional)</label>
            <input
              value={editForm.greeting || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, greeting: e.target.value })
              }
              className={inputClass}
              placeholder="Hi, I'm"
            />
          </div>
          <div>
            <label className={labelClass}>Headline</label>
            <input
              value={editForm.headline || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, headline: e.target.value })
              }
              className={inputClass}
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className={labelClass}>Subheadline</label>
            <textarea
              value={editForm.subheadline || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, subheadline: e.target.value })
              }
              className={inputClass + " h-20 resize-none"}
              placeholder="Building scalable cloud infrastructure and backend systems."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>CTA Primary Text</label>
              <input
                value={editForm.cta_text || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, cta_text: e.target.value })
                }
                className={inputClass}
                placeholder="View Portfolio"
              />
            </div>
            <div>
              <label className={labelClass}>CTA Primary URL</label>
              <input
                value={editForm.cta_url || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, cta_url: e.target.value })
                }
                className={inputClass}
                placeholder="#projects"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>CTA Secondary Text</label>
              <input
                value={editForm.cta_secondary_text || ""}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    cta_secondary_text: e.target.value,
                  })
                }
                className={inputClass}
                placeholder="Download CV"
              />
            </div>
            <div>
              <label className={labelClass}>CTA Secondary URL</label>
              <input
                value={editForm.cta_secondary_url || ""}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    cta_secondary_url: e.target.value,
                  })
                }
                className={inputClass}
                placeholder="Resume URL or #contact"
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Background URL</label>
            <input
              value={editForm.background_url || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, background_url: e.target.value })
              }
              className={inputClass}
              placeholder="https://..."
            />
          </div>
        </div>
      ),
      contact: (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Email</label>
            <input
              value={editForm.email || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, email: e.target.value })
              }
              className={inputClass}
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className={labelClass}>Phone / WhatsApp</label>
            <input
              value={editForm.phone || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, phone: e.target.value })
              }
              className={inputClass}
              placeholder="+62..."
            />
          </div>
          <div>
            <label className={labelClass}>Location</label>
            <input
              value={editForm.location || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, location: e.target.value })
              }
              className={inputClass}
              placeholder="Jakarta, Indonesia"
            />
          </div>
          <div>
            <label className={labelClass}>LinkedIn URL</label>
            <input
              value={editForm.linkedin_url || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, linkedin_url: e.target.value })
              }
              className={inputClass}
              placeholder="https://linkedin.com/in/..."
            />
          </div>
          <div>
            <label className={labelClass}>GitHub URL</label>
            <input
              value={editForm.github_url || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, github_url: e.target.value })
              }
              className={inputClass}
              placeholder="https://github.com/..."
            />
          </div>
        </div>
      ),
      skills: (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Category Title (optional)</label>
            <input
              value={editForm.title || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, title: e.target.value })
              }
              className={inputClass}
              placeholder="Frontend, Backend, DevOps..."
            />
          </div>
          <div className="relative">
            <label className={labelClass}>Search & Add Skills</label>
            <input
              value={skillSearch}
              onChange={(e) => handleSkillSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && skillSearch) {
                  addSkill(skillSearch);
                }
              }}
              className={inputClass}
              placeholder="Type to search... (Enter to add)"
            />
            {skillSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-[#1a1a3a] border border-purple-900/30 rounded-lg overflow-hidden">
                {skillSuggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => addSkill(s)}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-purple-900/30 transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className={labelClass}>Added Skills</label>
            <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-[#1a1a3a] border border-purple-900/30 rounded-lg">
              {(editForm.skills || "")
                .split(",")
                .map((s: string) => s.trim())
                .filter(Boolean)
                .map((skill: string) => (
                  <span
                    key={skill}
                    className="flex items-center gap-1 px-3 py-1 bg-purple-600/30 text-purple-300 text-xs rounded-full"
                  >
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="hover:text-red-400 ml-1"
                    >
                      *
                    </button>
                  </span>
                ))}
              {!editForm.skills && (
                <span className="text-gray-500 text-xs">
                  No skills added yet
                </span>
              )}
            </div>
          </div>
        </div>
      ),
      gallery: (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Certificate Title</label>
            <input
              value={editForm.title || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, title: e.target.value })
              }
              className={inputClass}
              placeholder="AWS Certified Solutions Architect"
            />
          </div>
          <div>
            <label className={labelClass}>Keterangan</label>
            <textarea
              value={editForm.description || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
              className={inputClass + " h-24 resize-none"}
              placeholder="Deskripsi sertifikat..."
            />
          </div>
          <div>
            <label className={labelClass}>Tanggal Terbit</label>
            <input
              type="date"
              value={editForm.issued_date || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, issued_date: e.target.value })
              }
              className={inputClass}
              style={{ colorScheme: "dark" }}
            />
          </div>
          <div>
            <label className={labelClass}>
              Upload File / Gambar Sertifikat
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              id="gallery-file"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const fd = new FormData();
                fd.append("file", file);
                fd.append("title", editForm.title || "");
                fd.append("description", editForm.description || "");
                fd.append("issued_date", editForm.issued_date || "");
                try {
                  setSaveMsg(" Mengupload...");
                  await api.post("/api/gallery", fd, {
                    headers: { "Content-Type": "multipart/form-data" },
                  });
                  setSaveMsg("... Sertifikat tersimpan!");
                  setEditForm({});
                  await fetchSectionData("gallery");
                  await loadPreview();
                } catch (err: any) {
                  setSaveMsg(
                    " Upload gagal: " +
                      (err.response?.data?.message || err.message),
                  );
                }
              }}
            />
            <label
              htmlFor="gallery-file"
              className="cursor-pointer inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition"
            >
              " Upload File
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Format: JPG, PNG, PDF (maks 10MB)
            </p>
          </div>
        </div>
      ),
      custom: (() => {
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
                        {certSkillSuggestions.map((s) => (
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
      })(),
    };

    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{activeSection.icon}</span>
            <h2 className="text-xl font-bold text-white">
              {activeSection.label}
            </h2>
          </div>
          <button
            onClick={() => setActiveSection(null)}
            className="text-gray-400 hover:text-white text-xl"
          >
            *
          </button>
        </div>
        <AnimatePresence>
          {saveMsg && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`mb-4 p-3 rounded-lg border text-sm ${
                saveStatus === "success"
                  ? "bg-green-900/30 border-green-500/30 text-green-400"
                  : "bg-red-900/30 border-red-500/30 text-red-400"
              }`}
            >
              {saveMsg}
            </motion.div>
          )}
        </AnimatePresence>
        {fields[type] || (
          <p className="text-gray-400">No editor for this section yet.</p>
        )}
        {(() => {
          // Filter listData for custom sections by matching active section label ' item.title
          const isCustom = activeSection.type.split("-")[0] === "custom";
          const sectionTitle = normalizeCustomTitle(activeSection.label);
          const displayData = isCustom
            ? listData.filter(
                (item: any) =>
                  normalizeCustomTitle(item.title) === sectionTitle ||
                  item.type === typedSectionMap[sectionTitle],
              )
            : listData;
          if (displayData.length === 0) return null;
          const visibleItems = showAllItems
            ? displayData
            : displayData.slice(0, 3);
          return (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">
                Data Tersimpan ({displayData.length})
              </h3>
              <div className="space-y-2">
                {visibleItems.map((item: any) => {
                  const content =
                    typeof item.content === "string"
                      ? JSON.parse(item.content)
                      : item.content || {};
                  const displayLabel =
                    content.institution ||
                    content.name ||
                    content.language ||
                    content.area ||
                    content.title ||
                    content.body ||
                    "Item";
                  const displayDesc =
                    content.degree ||
                    content.issuer ||
                    content.proficiency ||
                    content.description ||
                    content.start_date?.slice(0, 7) ||
                    "";
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-[#1a1a3a] border border-purple-900/30 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {displayLabel}
                        </p>
                        {displayDesc && (
                          <p className="text-gray-500 text-xs truncate">
                            {displayDesc}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditForm({
                              ...item,
                              content:
                                typeof item.content === "string"
                                  ? JSON.parse(item.content)
                                  : item.content,
                            });
                          }}
                          className="text-purple-400 hover:text-purple-300 text-sm flex-shrink-0"
                        ></button>
                        <button
                          onClick={async () => {
                            if (!confirm("Hapus item ini?")) return;
                            const apiType = activeSection?.type.split("-")[0];
                            try {
                              await api.delete(`/api/${apiType}/${item.id}`);
                              setListData((prev) =>
                                prev.filter((i: any) => i.id !== item.id),
                              );
                              await loadPreview();
                            } catch {
                              setSaveMsg(" Gagal hapus");
                            }
                          }}
                          className="text-red-400 hover:text-red-300 text-sm flex-shrink-0"
                        >
                          {" "}
                          - '
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {displayData.length > 3 && (
                <button
                  onClick={() => setShowAllItems(!showAllItems)}
                  className="mt-3 text-sm text-purple-400 hover:text-purple-300 transition"
                >
                  {showAllItems
                    ? "Tampilkan Lebih Sedikit"
                    : `Lihat Lainnya (${displayData.length - 3})`}
                </button>
              )}
            </div>
          );
        })()}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setActiveSection(null)}
            className="flex-1 border border-purple-900/30 text-gray-400 hover:text-white py-2.5 rounded-lg transition text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2.5 rounded-lg transition text-sm font-medium"
          >
            {saving ? t2("saving") : t2("save")}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex">
      {showAddSection && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4"
          onClick={() => setShowAddSection(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-purple-900/40 bg-[#0f0f2a] p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {lang === "id" ? "Tambah Section" : "Add Section"}
                </h2>
                <p className="text-xs text-gray-500">
                  {lang === "id"
                    ? "Pilih section yang mau ditambahkan."
                    : "Choose a section to add."}
                </p>
              </div>
              <button
                onClick={() => setShowAddSection(false)}
                className="text-xl text-gray-400 hover:text-white"
              >
                {" "}
                -{" "}
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {availableSections.map((section) => {
                const alreadyExists =
                  section.type !== "custom" &&
                  sections.some((s) => s.type === section.type);
                return (
                  <button
                    key={section.type}
                    disabled={alreadyExists}
                    onClick={() =>
                      handleAddSection(
                        section.type,
                        section.label,
                        section.icon,
                      )
                    }
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition ${alreadyExists ? "cursor-not-allowed border-gray-800 bg-gray-900/40 text-gray-600" : "border-purple-900/30 bg-[#1a1a3a] text-white hover:border-purple-500 hover:bg-purple-900/30"}`}
                  >
                    <span className="flex items-center gap-3">
                      <span>{section.icon}</span>
                      <span className="text-sm font-medium">
                        {section.label}
                      </span>
                    </span>
                    <span className="text-xs text-gray-500">
                      {alreadyExists
                        ? lang === "id"
                          ? "Sudah ada"
                          : "Added"
                        : "+"}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}

      {showProfile && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4"
          onClick={() => {
            setShowProfile(false);
            setProfileMsg("");
            setProfileError("");
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-purple-900/40 bg-[#0f0f2a] p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {lang === "id" ? "Edit Profil" : "Edit Profile"}
              </h2>
              <button
                onClick={() => {
                  setShowProfile(false);
                  setProfileMsg("");
                  setProfileError("");
                }}
                className="text-xl text-gray-400 hover:text-white"
              >
                {" "}
                -{" "}
              </button>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {profileError && (
                <div className="bg-red-900/40 border border-red-700 text-red-300 text-xs rounded-lg px-3 py-2">
                  {profileError}
                </div>
              )}
              {profileMsg && (
                <div className="bg-green-900/40 border border-green-700 text-green-300 text-xs rounded-lg px-3 py-2">
                  {profileMsg}
                </div>
              )}
              <div>
                <label className={labelClass}>
                  {lang === "id" ? "Nama" : "Name"}
                </label>
                <input
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, name: e.target.value })
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
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, email: e.target.value })
                  }
                  className={inputClass}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className={labelClass}>
                  {lang === "id" ? "Password Baru" : "New Password"}
                </label>
                <input
                  type="password"
                  value={profileForm.password}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, password: e.target.value })
                  }
                  className={inputClass}
                  placeholder="Leave empty to keep current"
                />
              </div>
              <div>
                <label className={labelClass}>
                  {lang === "id" ? "Konfirmasi Password" : "Confirm Password"}
                </label>
                <input
                  type="password"
                  value={profileForm.confirmPassword}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className={inputClass}
                  placeholder="Confirm new password"
                />
              </div>
              <div>
                <label className={labelClass}>
                  {lang === "id" ? "Foto Profil" : "Profile Photo"}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="profile-photo-upload"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const fd = new FormData();
                    fd.append("file", file);
                    try {
                      const res = await api.post(
                        "/api/users/upload-photo",
                        fd,
                        { headers: { "Content-Type": "multipart/form-data" } },
                      );
                      setProfileForm((prev) => ({
                        ...prev,
                        photo_url: res.data.photo_url,
                      }));
                      setProfileError("");
                    } catch (err: any) {
                      setProfileError(
                        " Photo upload failed: " +
                          (err.response?.data?.message || err.message),
                      );
                    }
                  }}
                />
                <label
                  htmlFor="profile-photo-upload"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition"
                >
                  "- {lang === "id" ? "Upload Foto" : "Upload Photo"}
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  {lang === "id" ? "Atau masukkan URL:" : "Or paste URL below:"}
                </p>
                <input
                  value={profileForm.photo_url}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      photo_url: e.target.value,
                    })
                  }
                  className={inputClass + " mt-2"}
                  placeholder="https://..."
                />
                {profileForm.photo_url && (
                  <img
                    src={profileForm.photo_url}
                    alt=""
                    className="w-16 h-16 rounded-full object-cover mt-2 mx-auto"
                  />
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
                >
                  {lang === "id" ? "Simpan" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfile(false);
                    setProfileMsg("");
                    setProfileError("");
                  }}
                  className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors"
                >
                  {lang === "id" ? "Batal" : "Cancel"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      {/* Sidebar kiri */}
      <div
        className={`${sidebarOpen ? "w-56" : "w-14"} transition-all duration-300 bg-[#0f0f2a] border-r border-purple-900/30 flex flex-col flex-shrink-0`}
      >
        <div className="p-3 border-b border-purple-900/30 flex items-center justify-between">
          {sidebarOpen && (
            <div>
              <h1 className="text-sm font-bold text-white">
                {lang === "id" ? "Pembuat Portfolio" : "Portfolio Builder"}
              </h1>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-purple-900/20 flex-shrink-0"
          >
            {sidebarOpen ? " - " : "-"}
          </button>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {[
            ...(user?.role !== "superadmin"
              ? [
                  { key: "builder", label: "Builder", icon: "" },
                  { key: "advisor", label: "AI Advisor", icon: "" },
                  {
                    key: "analytics",
                    label: lang === "id" ? "Statistik" : "Analytics",
                    icon: "",
                  },
                  { key: "github", label: "GitHub Import", icon: "" },
                  { key: "cv", label: "CV Generator", icon: "" },
                ]
              : []),
            ...(user?.role === "superadmin"
              ? [
                  { key: "superadmin", label: "Server", icon: "-" },
                  { key: "users", label: t2("users"), icon: "U" },
                ]
              : []),
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveMenu(item.key)}
              className={`w-full text-left px-2 py-2.5 rounded-lg transition text-sm font-medium flex items-center gap-2 ${activeMenu === item.key ? "bg-purple-600 text-white" : "text-gray-400 hover:bg-purple-900/20 hover:text-white"}`}
            >
              <span>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header " portfolio status */}
        <div className="flex-shrink-0 h-12 bg-[#0d0d20] border-b border-purple-900/20 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">
              {user?.role === "superadmin"
                ? "PortfolioKit Admin"
                : "Portfolio:"}
            </span>
            {activeMenu !== "superadmin" && activeMenu !== "users" && (
              <span className="text-sm font-medium text-white">
                {portfolio?.title || '"'}
              </span>
            )}
            {portfolio &&
              activeMenu !== "superadmin" &&
              activeMenu !== "users" && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${portfolio.is_published ? "bg-green-600/30 text-green-300" : "bg-gray-600/30 text-gray-400"}`}
                >
                  {portfolio.is_published ? t2("live") : t2("draft")}
                </span>
              )}
            {portfolio &&
              activeMenu !== "superadmin" &&
              activeMenu !== "users" &&
              !editingSlug && (
                <button
                  onClick={() => {
                    setSlugInput(portfolio.slug);
                    setEditingSlug(true);
                    setSlugMsg("");
                  }}
                  className="text-xs text-gray-500 hover:text-purple-400 transition"
                  title="Edit URL slug"
                >
                  /{portfolio.slug}
                </button>
              )}
            {editingSlug && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">/</span>
                <input
                  value={slugInput}
                  onChange={(e) =>
                    setSlugInput(
                      e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                    )
                  }
                  className="text-xs bg-gray-800 border border-purple-500 rounded px-2 py-0.5 text-white w-32 outline-none"
                  placeholder="custom-slug"
                  autoFocus
                  onKeyDown={async (e) => {
                    if (e.key === "Enter") {
                      try {
                        const res = await api.patch(
                          `/api/portfolios/${portfolio.id}`,
                          { slug: slugInput },
                        );
                        setPortfolio({ ...portfolio, slug: res.data.slug });
                        setEditingSlug(false);
                        setSlugMsg("");
                      } catch (err: any) {
                        setSlugMsg(err.response?.data?.message || "Error");
                      }
                    }
                    if (e.key === "Escape") setEditingSlug(false);
                  }}
                />
                <button
                  onClick={async () => {
                    try {
                      const res = await api.patch(
                        `/api/portfolios/${portfolio.id}`,
                        { slug: slugInput },
                      );
                      setPortfolio({ ...portfolio, slug: res.data.slug });
                      setEditingSlug(false);
                      setSlugMsg("");
                    } catch (err: any) {
                      setSlugMsg(err.response?.data?.message || "Error");
                    }
                  }}
                  className="text-xs text-green-400 hover:text-green-300"
                >
                  "
                </button>
                <button
                  onClick={() => setEditingSlug(false)}
                  className="text-xs text-gray-500 hover:text-gray-300"
                >
                  *
                </button>
                {slugMsg && (
                  <span className="text-xs text-red-400">{slugMsg}</span>
                )}
              </div>
            )}
            {/* Custom Domain */}
            {activeMenu !== "superadmin" &&
              activeMenu !== "users" &&
              portfolio &&
              !editingDomain && (
                <button
                  onClick={() => {
                    setDomainInput(portfolio.custom_domain || "");
                    setEditingDomain(true);
                    setDomainMsg("");
                  }}
                  className="text-xs text-gray-500 hover:text-purple-400 transition ml-1"
                  title="Set custom domain"
                >
                  {portfolio.custom_domain
                    ? ` ${portfolio.custom_domain}`
                    : "+ domain"}
                </button>
              )}
            {editingDomain && (
              <div className="flex items-center gap-1 ml-1">
                <span className="text-xs text-gray-500"></span>
                <input
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value.toLowerCase())}
                  className="text-xs bg-gray-800 border border-purple-500 rounded px-2 py-0.5 text-white w-40 outline-none"
                  placeholder="yourdomain.com"
                  autoFocus
                  onKeyDown={async (e) => {
                    if (e.key === "Enter") {
                      try {
                        await api.patch(`/api/portfolios/${portfolio.id}`, {
                          custom_domain: domainInput,
                        });
                        setPortfolio({
                          ...portfolio,
                          custom_domain: domainInput || null,
                        });
                        setEditingDomain(false);
                        setDomainMsg("");
                      } catch (err: any) {
                        setDomainMsg(err.response?.data?.message || "Error");
                      }
                    }
                    if (e.key === "Escape") setEditingDomain(false);
                  }}
                />
                <button
                  onClick={async () => {
                    try {
                      await api.patch(`/api/portfolios/${portfolio.id}`, {
                        custom_domain: domainInput,
                      });
                      setPortfolio({
                        ...portfolio,
                        custom_domain: domainInput || null,
                      });
                      setEditingDomain(false);
                      setDomainMsg("");
                    } catch (err: any) {
                      setDomainMsg(err.response?.data?.message || "Error");
                    }
                  }}
                  className="text-xs text-green-400 hover:text-green-300"
                >
                  "
                </button>
                <button
                  onClick={() => setEditingDomain(false)}
                  className="text-xs text-gray-500 hover:text-gray-300"
                >
                  *
                </button>
                {domainMsg && (
                  <span className="text-xs text-red-400">{domainMsg}</span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {portfolio &&
              activeMenu !== "superadmin" &&
              activeMenu !== "users" && (
                <button
                  onClick={handleTogglePublish}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${portfolio.is_published ? "bg-red-600/20 text-red-300 hover:bg-red-600/30" : "bg-green-600/20 text-green-300 hover:bg-green-600/30"}`}
                >
                  {portfolio.is_published ? t2("unpublish") : t2("publish")}
                </button>
              )}
            {portfolio?.is_published && (
              <a
                href={`/portfolio/${portfolio.slug}`}
                target="_blank"
                className="text-xs px-3 py-1.5 rounded-lg font-medium bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 transition"
              >
                View Live
              </a>
            )}
            {/* Lang toggle */}
            <button
              onClick={() => {
                const next = lang === "id" ? "en" : "id";
                setLang(next);
                localStorage.setItem("lang", next);
              }}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-purple-900/30 text-gray-400 hover:text-white hover:border-purple-500 transition font-medium"
            >
              {lang.toUpperCase()}
            </button>

            <div className="w-px h-6 bg-purple-900/40 mx-1" />
            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-purple-900/20 transition"
              >
                {user?.photo_url ? (
                  <img
                    src={user.photo_url}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                )}
                <span className="text-sm text-gray-300">
                  {user?.name?.split(" ")[0]}
                </span>
                <span className="text-gray-500 text-xs">
                  {showUserMenu ? "-" : "-"}
                </span>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-[#0f0f2a] border border-purple-900/30 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-purple-900/20">
                    <p className="text-white text-sm font-medium">
                      {user?.name}
                    </p>
                    <p className="text-gray-500 text-xs">{user?.email}</p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${user?.role === "superadmin" ? "bg-yellow-600/30 text-yellow-300" : "bg-purple-600/30 text-purple-300"}`}
                    >
                      {user?.role}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfile(true);
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-purple-900/20 transition flex items-center gap-2"
                  >
                    {lang === "id" ? "Edit Profil" : "Edit Profile"}
                  </button>
                  <div className="border-t border-purple-900/20">
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-900/20 transition flex items-center gap-2"
                    >
                      {lang === "id" ? "Keluar" : "Logout"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content area */}
        {activeMenu === "builder" && (
          <div className="flex-1 flex overflow-hidden">
            {/* Sections panel */}
            <div className="w-64 flex-shrink-0 bg-[#0d0d20] border-r border-purple-900/20 flex flex-col">
              <div className="px-3 py-2 border-b border-purple-900/20 flex items-center justify-between">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {lang === "id" ? "Bagian" : "Sections"}
                </h3>
                <button
                  onClick={() => setShowAddSection(true)}
                  className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded-lg transition"
                >
                  {t2("add")}
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                <DndContext
                  id="dashboard-dnd"
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={sections.map((s) => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {sections.map((section) => (
                        <SortableSection
                          key={section.id}
                          section={section}
                          onToggle={handleToggle}
                          onEdit={setActiveSection}
                          onDelete={handleDelete}
                          isActive={activeSection?.id === section.id}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
              <div className="px-3 py-2 border-t border-purple-900/20">
                <p className="text-xs text-gray-600 text-center">
                  {lang === "id" ? "Seret  untuk urutan" : "Drag  to reorder"}
                </p>
              </div>
            </div>

            {/* Edit panel " slide in dari kiri kalau ada activeSection */}
            {activeSection && (
              <div className="w-80 flex-shrink-0 bg-[#0a0a1a] border-r border-purple-900/20 overflow-y-auto p-5">
                {renderEditForm()}
              </div>
            )}

            {/* Preview panel */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {renderPreview()}
            </div>
          </div>
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
        {activeMenu === "superadmin" && (
          <SuperadminPanel
            adminStats={adminStats}
            resources={resources}
            fetchAdminStats={fetchAdminStats}
            fetchResources={fetchResources}
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
