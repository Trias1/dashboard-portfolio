"use client";
import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import api, { getApiErrorMessage, initAuth } from "@/lib/api";
import {
  defaultSections,
  Section,
  SectionType,
  availableSections,
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
import InboxPanel from "@/components/dashboard/InboxPanel";
import { AI_ENABLED } from "@/lib/features";
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
import { SKILL_SUGGESTIONS } from "@/lib/dashboard-data";
import { uploadImage, UploadError } from "@/lib/upload-client";
import { buildGenericContent, genericType, uniqueLabel } from "@/lib/custom-content";
import DashboardAccountMenu from "@/components/dashboard/DashboardAccountMenu";
import DashboardPortfolioControls from "@/components/dashboard/DashboardPortfolioControls";
import { useDashboardProfileActions } from "@/hooks/useDashboardProfileActions";
import { useDashboardAnalytics } from "@/hooks/useDashboardAnalytics";
import { useDashboardGitHubImport } from "@/hooks/useDashboardGitHubImport";
import type {
  CustomSectionContent,
  DashboardPortfolio,
  DashboardUser,
  EditFormData,
  ProfileFormData,
  StoredSectionItem,
  ThemeOption,
} from "@/types";

// The user cached in localStorage is only readable on the client; the server snapshot is
// always null so hydration matches, and React re-renders with the stored value right after.
const subscribeNoop = () => () => {};
const readStoredUserRaw = () => {
  try {
    return localStorage.getItem("user");
  } catch {
    return null;
  }
};
const readServerStoredUserRaw = () => null;

function parseStoredUser(raw: string | null): DashboardUser | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function parseSectionsOrder(value: unknown): Section[] {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Id for a section the user adds (outside the component: it is only called from the add handler). */
const newSectionId = (type: string) => `${type}-${Date.now()}`;

/** Optional sections: only shown when the user adds them (see pruneUnusedOptional). */
const OPT_IN_SECTION_TYPES: string[] = ["services", "gallery", "testimonials"];

/** Sections that hold a list of rows (the editor either adds a row or edits one). */
const LIST_SECTION_TYPES = ["experience", "projects", "services", "testimonials", "skills", "gallery"];

function parseJsonSafe<T = unknown>(value: unknown, fallback: T): T {
  if (typeof value !== "string") return (value ?? fallback) as T;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

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

export default function DashboardPage() {
  const router = useRouter();
  const { users, adminStats, vercelLogs, vercelLogsLoading, vercelLogsError, fetchUsers, fetchAdminStats, fetchVercelLogs } = useDashboardAdmin();
  const { portfolio, setPortfolio, sections, setSections, activeSection, setActiveSection, selectedTheme, setSelectedTheme, previewData, previewLoading, loadPreview } = useDashboardPortfolio();
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [activeMenu, setActiveMenu] = useState("builder"); // overridden once the user loads
  // null = responsive default (collapsed below `md`, expanded on desktop) until the user toggles it.
  const [sidebarOpen, setSidebarOpen] = useState<boolean | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    photo_url: "",
  });
  const [profileMsg, setProfileMsg] = useState("");
  const [profileError, setProfileError] = useState("");
  // Prefill from the user cached in localStorage once it becomes readable on the client
  // (adjusting state during render instead of in an effect).
  const storedUserRaw = useSyncExternalStore(subscribeNoop, readStoredUserRaw, readServerStoredUserRaw);
  const [storedUserApplied, setStoredUserApplied] = useState(false);
  if (!storedUserApplied && storedUserRaw !== null) {
    setStoredUserApplied(true);
    const u = parseStoredUser(storedUserRaw);
    if (u && !user && (u.role === "admin" || u.role === "superadmin")) {
      setUser(u);
      setProfileForm((prev) => ({
        ...prev,
        name: u.name || "",
        photo_url: u.photo_url || "",
      }));
      if (u.role === "superadmin") setActiveMenu("superadmin");
    }
  }
  const { logout: handleLogout, updateProfile: handleUpdateProfile } = useDashboardProfileActions({ user, profileForm, setUser, setProfileForm, setProfileMsg, setProfileError, router });
  const { visits, setVisits, dateFrom, setDateFrom, dateTo, setDateTo, fetchVisits, visitsLoading, visitsError } = useDashboardAnalytics();
  const { githubUsername, setGithubUsername, githubPreview, setGithubPreview, githubLoading, setGithubLoading, githubImporting, setGithubImporting, githubMsg, setGithubMsg, githubOptions, setGithubOptions, selectedProjects, setSelectedProjects } = useDashboardGitHubImport();

  const [editForm, setEditForm] = useState<EditFormData>({});
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"success" | "error" | "">("");
  // Messages from editors (uploads, deletes): an error unless they say otherwise, so a success isn't shown in red.
  const editorMessage = (message: string, status: "success" | "error" | "" = "error") => { setSaveMsg(message); setSaveStatus(status); };
  // Unsaved edits in the open editor; cleared when its data loads or is saved.
  const [dirty, setDirty] = useState(false);
  const editField: React.Dispatch<React.SetStateAction<EditFormData>> = (value) => { setEditForm(value); setDirty(true); };
  const confirmDiscard = () => !dirty || window.confirm("You have unsaved changes. Discard them?");
  // Leaving an editor drops its unsaved state, including a picked but unsaved About photo.
  const resetEditor = () => { setDirty(false); setPhotoFile(null); setPhotoPreview(""); setSaveMsg(""); setSaveStatus(""); };

  // Services, Gallery and Testimonials used to start in every portfolio's list, switched off. Entries that are
  // still off and whose section has no content are dropped, so older portfolios match new ones; anything
  // switched on or with content stays.
  const pruneUnusedOptional = async (portfolioId: number, loaded: Section[]) => {
    const candidates = loaded.filter((s) => OPT_IN_SECTION_TYPES.includes(s.type) && s.enabled === false);
    if (!candidates.length) return;
    const unused = new Set<string>();
    for (const section of candidates) {
      try {
        const res = await api.get<unknown[]>(`/api/${section.type}`);
        if (Array.isArray(res.data) && res.data.length === 0) unused.add(section.id);
      } catch { /* unknown: keep it */ }
    }
    if (!unused.size) return;
    const cleaned = loaded.filter((s) => !unused.has(s.id));
    try {
      await api.put(`/api/portfolios/${portfolioId}`, { sections_order: cleaned });
      setSections((current) => current.filter((s) => !unused.has(s.id)));
      setPortfolio((current) => (current ? { ...current, sections_order: cleaned } : current));
    } catch { /* leave the list as it is */ }
  };

  // A layout save (order, visibility) that failed, shown as a banner instead of being swallowed.
  const [layoutError, setLayoutError] = useState("");
  // False until the saved layout arrives, so the builder doesn't flash the default list first
  const [layoutLoaded, setLayoutLoaded] = useState(false);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const [saveMsg, setSaveMsg] = useState("");
  const [skillSearch, setSkillSearch] = useState("");
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const [certSkillSearch, setCertSkillSearch] = useState("");
  const [certSkillSuggestions, setCertSkillSuggestions] = useState<string[]>(
    [],
  );
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [listData, setListData] = useState<StoredSectionItem[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAllItems, setShowAllItems] = useState(false);
  const allowedSectionTypes = availableSections.map((section) => section.type);
  const [toggleVersion, setToggleVersion] = useState(0);
  const [deleteSection, setDeleteSection] = useState<Section | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const userId = user?.id;
  useEffect(() => {
    if (!userId) return;
    const beat = () => {
      if (document.hidden) return;
      api.post('/api/auth/heartbeat').catch(() => undefined);
    };
    beat();
    const timer = window.setInterval(beat, 120000);
    return () => window.clearInterval(timer);
  }, [userId]);
  useEffect(() => {
    // Stored-user prefill of user/profileForm/activeMenu happens during render (see above).
    const u = parseStoredUser(readStoredUserRaw());
    if (u && u.role !== "admin" && u.role !== "superadmin") {
      router.push("/");
      return;
    }
    // Init auth: restore the token from the httpOnly cookie first
    initAuth().then((ok) => {
      if (!ok) {
        router.push("/login");
        return;
      }
      // Fetch fresh user data from the API
      api
        .get<DashboardUser>("/api/auth/me", { headers: { "Cache-Control": "no-cache" } })
        .then((res) => {
          if (res.data.role !== "admin" && res.data.role !== "superadmin") {
            router.push("/");
            return;
          }
          if (res.data.role === "superadmin") setActiveMenu("superadmin");
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
        .catch(() => {
          if (!u) router.replace("/login");
        });

      api
        .get<DashboardPortfolio[]>("/api/portfolios/my")
        .then((res) => {
          const portfolios = res.data;
          if (portfolios.length > 0) {
            const p = portfolios[0];
            setPortfolio(p);
            if (p.theme) setSelectedTheme(getThemeById(p.theme));
            // Load sections from the DB
            const parsedSectionsOrder = parseSectionsOrder(p.sections_order);
            if (parsedSectionsOrder.length > 0) {
              const dbSections = parsedSectionsOrder.filter((s) =>
                allowedSectionTypes.includes(s.type),
              );
              // The saved list is the layout: its order is the user's order, and sections they deleted are
              // gone. (Rebuilding it in default order lost the order and brought deleted sections back.)
              // Defaults only fill in fields an old saved entry might lack (icon, deletable).
              const loaded = dbSections.map((saved) => {
                const def = defaultSections.find((d) =>
                  saved.type === "custom" ? d.type === "custom" && d.label === saved.label : d.type === saved.type,
                );
                return def ? { ...def, ...saved } : saved;
              });
              setSections(loaded);
              pruneUnusedOptional(p.id, loaded);
            }
          }
        })
        .catch((err) => console.error("Failed to fetch portfolio", err))
        .finally(() => setLayoutLoaded(true));
    });
    try {
      // Sections & theme are loaded from the DB (per user). Drop the legacy
      // unscoped caches so another account's layout never leaks in.
      localStorage.removeItem("portfolio-sections");
      localStorage.removeItem("portfolio-theme");
    } catch {}

  }, []);

  // Unread contact-form messages, for the badge on the Inbox menu item.
  const [inboxUnread, setInboxUnread] = useState(0);
  const userIdForInbox = user?.id;
  const userRoleForInbox = user?.role;
  useEffect(() => {
    if (!userIdForInbox || userRoleForInbox === "superadmin") return;
    let alive = true;
    api.get<{ is_read: boolean }[]>("/api/contact/messages")
      .then((res) => { if (alive) setInboxUnread(res.data.filter((m) => !m.is_read).length); })
      .catch(() => {});
    return () => { alive = false; };
  }, [userIdForInbox, userRoleForInbox]);

  useEffect(() => {
    if (!user) return;
    if (activeMenu === "users") fetchUsers();
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

  // `isCurrent` lets the caller drop a reply that arrives after the user left the section: a slow reply would
  // otherwise put that section's row (and its id) into the form, and Save would overwrite it.
  const fetchSectionData = useCallback(async (type: string, selectedId?: number, isCurrent: () => boolean = () => true) => {
    setDirty(false);
    try {
      const apiType = type.split("-")[0];
      const endpoint =
        apiType === "contact" ? "/api/contact" : `/api/${apiType}`;
      const res = await api.get<StoredSectionItem[] | EditFormData>(endpoint);
      if (!isCurrent()) return;
      if (Array.isArray(res.data)) {
        if (apiType === "custom" && activeSection) {
          const sectionTitle = normalizeCustomTitle(activeSection.label);
          const subType = typedSectionMap[sectionTitle] || "text";
          const matched = res.data.filter(
            (i) =>
              normalizeCustomTitle(i.title) === sectionTitle ||
              (subType !== "text" && i.type === subType),
          );
          setListData(matched);
          const item = selectedId
            ? matched.find((i) => i.id === selectedId) || matched[0]
            : undefined;
          if (item) {
            const content = parseJsonSafe<CustomSectionContent>(item.content, {});
            setEditForm({ ...item, content });
          } else {
            setEditForm({ title: sectionTitle, type: subType, content: {} });
          }
        } else {
          setListData(res.data);
          setEditForm({});
        }
      } else {
        setListData([]);
        setEditForm(res.data || {});
      }
    } catch (err) {
      console.error(err);
    }
  }, [activeSection, setDirty]);

  useEffect(() => {
    if (!activeSection) return;
    // State updates in fetchSectionData happen after the awaited request, not synchronously.
    // Switching section ends this effect, so a reply for the section just left is ignored
    let alive = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSectionData(activeSection.type, undefined, () => alive);
    return () => { alive = false; };
  }, [activeSection, fetchSectionData]);

  // Single source of initial preview loading: fires when the portfolio slug is known/changes.
  useEffect(() => {
    if (portfolio?.slug) {
      loadPreview(portfolio.slug);
    }
  }, [portfolio?.slug]);

  // Layout saves run one after another, so an older save can never finish last and win.
  const layoutQueue = useRef<Promise<unknown>>(Promise.resolve());
  const saveLayout = (order: Section[]) => {
    if (!portfolio) return Promise.resolve();
    // Keep the local copy current too: theme/template saves used to send a stale sections_order.
    setPortfolio((current) => (current ? { ...current, sections_order: order } : current));
    const save = () =>
      api
        .put(`/api/portfolios/${portfolio.id}`, { sections_order: order })
        .then(() => setLayoutError(""))
        .catch(() => setLayoutError("Your section changes couldn't be saved. Check your connection and try again."));
    const next = layoutQueue.current.then(save, save);
    layoutQueue.current = next;
    return next;
  };

  // Save first, then refresh the preview, so it never shows the layout from before the change.
  const applyLayout = (updated: Section[]) => {
    setSections(updated);
    if (portfolio) saveLayout(updated).then(() => setToggleVersion((version) => version + 1));
    else setToggleVersion((version) => version + 1);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((i) => i.id === active.id);
    const newIndex = sections.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    applyLayout(arrayMove(sections, oldIndex, newIndex));
  };

  const handleToggle = (id: string) => {
    applyLayout(sections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  };

  const handleDelete = (id: string) => {
    const section = sections.find((s) => s.id === id);
    if (section) setDeleteSection(section);
  };

  // Services is opt-in (not in the default list): when the Advisor saves services, put the section on the page.
  // Done here, on the dashboard's own state, so a later layout save can't drop it again.
  const showServicesSection = () => {
    const existing = sections.find((s) => s.type === "services");
    if (existing?.enabled) return;
    const def = availableSections.find((s) => s.type === "services");
    applyLayout(existing
      ? sections.map((s) => (s.id === existing.id ? { ...s, enabled: true } : s))
      : [...sections, { ...(def ?? { type: "services" as SectionType, label: "Services", icon: "SV", deletable: true }), id: newSectionId("services"), enabled: true }]);
  };

  const handleHideSection = (sectionOrId: string | Section) => {
    const id = typeof sectionOrId === "string" ? sectionOrId : sectionOrId.id;
    applyLayout(sections.map((s) => (s.id === id ? { ...s, enabled: false } : s)));
    if (activeSection?.id === id) setActiveSection(null);
  };

  const handleDeleteSectionData = async (section: Section) => {
    const type = section.type.split("-")[0];
    const res = await api.delete(`/api/portfolio/sections/${section.id}`, {
      data: {
        portfolioId: portfolio?.id,
        sectionId: section.id,
        label: section.label,
        sectionType: type,
        deleteData: true,
      },
    });
    if (!res.data?.message) throw new Error("Could not delete the section");
    // The route already removed it from sections_order; mirror that locally.
    const updated = sections.filter((s) => s.id !== section.id);
    setSections(updated);
    setPortfolio((current) => (current ? { ...current, sections_order: updated } : current));
    if (activeSection?.id === section.id) setActiveSection(null);
    if (portfolio?.slug) loadPreview(portfolio.slug);
  };

  const handleAddSection = async (type: SectionType, requestedLabel: string, icon: string) => {
    // Opening the new section replaces the editor: don't drop unsaved edits without asking.
    if (!confirmDiscard()) return;
    resetEditor();
    const id = newSectionId(type);
    // Custom sections are matched to their rows by name, so a second "Custom Section" would share the
    // first one's content: give free-form ones a free name ("Custom Section 2").
    const label = type === "custom" && !typedSectionMap[normalizeCustomTitle(requestedLabel)]
      ? uniqueLabel(requestedLabel, sections.filter((s) => s.type === "custom").map((s) => s.label))
      : requestedLabel;
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
    setShowAddSection(false);

    if (portfolio) {
      await saveLayout(updated);
      await loadPreview(portfolio.slug);
    }

    if (type === "custom") {
      const subType = typedSectionMap[label] || "text";
      setEditForm({ title: label, type: subType, content: {} });
    }
  };

  const handleThemeChange = async (theme: ThemeOption) => {
    setSelectedTheme(theme);
    if (portfolio) {
      try {
        // Only the theme: the section layout is saved on its own (saveLayout)
        await api.put(`/api/portfolios/${portfolio.id}`, { theme: normalizeThemeId(theme.id) });
        setPortfolio((current) => (current ? { ...current, theme: normalizeThemeId(theme.id) } : current));
      } catch {
        setLayoutError("The theme couldn't be saved. Try again.");
      }
    }
  };

  const handleTogglePublish = async () => {
    if (!portfolio) return;
    try {
      const res = await api.patch<DashboardPortfolio>(`/api/portfolios/${portfolio.id}`, {
        publish: !portfolio.is_published,
      });
      setPortfolio((current) => (current ? { ...current, ...res.data } : res.data));
    } catch {
      setLayoutError(portfolio.is_published ? "Couldn't unpublish. Try again." : "Couldn't publish. Try again.");
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setDirty(true);
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
      editField({ ...editForm, skills: [...skillList, skill].join(", ") });
    }
    setSkillSearch("");
    setSkillSuggestions([]);
  };

  const removeSkill = (skill: string) => {
    const skillList = (editForm.skills || "")
      .split(",")
      .map((s: string) => s.trim())
      .filter((s: string) => s !== skill);
    editField({ ...editForm, skills: skillList.join(", ") });
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
      editField({
        ...editForm,
        content: { ...(editForm.content || {}), skills: [...current, skill] },
      });
    }
    setCertSkillSearch("");
    setCertSkillSuggestions([]);
  };

  const removeCertSkill = (skill: string) => {
    const current: string[] = editForm.content?.skills || [];
    editField({
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
      const { data } = await api.post<{ image?: string }>("/api/og-image", { url: credUrl });
      if (data?.image) {
        const image = data.image;
        // Functional update: the form may have changed while the lookup ran
        editField((current) => ({ ...current, content: { ...(current.content || {}), imageUrl: image } }));
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
        // Store the photo and save its URL; the about route only accepts web links, not base64 data
        formData.photo_url = await uploadImage(photoFile, "photos");
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
          } else {
            await api.post("/api/custom", payload);
          }
        } else {
          // Free-form section: the row is titled with the section name (that is how rows are matched to
          // their section) and stores only the field its type uses.
          const contentType = genericType(formData.type);
          const payload = {
            title: sectionTitle,
            type: contentType,
            content: buildGenericContent(contentType, formData.content),
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
          if (formData.id) {
            await api.put(`/api/${type}/${formData.id}`, formData);
          } else {
            await api.post(`/api/${type}`, formData);
          }
        } else if (type === "contact") {
          await api.put("/api/contact", formData);
        } else {
          await api.put(`/api/${type}`, formData);
        }
      }

      // Success
      setSaveMsg("Saved!");
      setSaveStatus("success");
      setDirty(false);

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
    } catch (err) {
      console.error(err);

      // Errors stay until the next save or section change, so there is time to read them
      setSaveMsg(err instanceof UploadError ? err.message : getApiErrorMessage(err, "Save failed"));
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-md border border-rule bg-white px-3 py-2 text-sm text-ink placeholder:text-[#9a9aa0] outline-none transition-colors focus:border-ink focus:ring-2 focus:ring-ink/10";
  const labelClass = "mb-1.5 block text-sm font-medium text-ink";

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
      about: <AboutEditor value={editForm} onChange={editField} photoPreview={photoPreview} onPhotoChange={handlePhotoChange} setMessage={editorMessage} />,
      experience: <ExperienceEditor value={editForm} onChange={editField} />,
      projects: <ProjectEditor value={editForm} onChange={editField} setMessage={editorMessage} />,
      services: <ServiceEditor value={editForm} onChange={editField} />,
      testimonials: <TestimonialEditor value={editForm} onChange={editField} />,
      hero: <HeroEditor value={editForm} onChange={editField} />,
      contact: <ContactEditor value={editForm} onChange={editField} />,
      skills: <SkillsEditor value={editForm} onChange={editField} search={skillSearch} suggestions={skillSuggestions} onSearch={handleSkillSearch} onAdd={addSkill} onRemove={removeSkill} />,
      gallery: <GalleryEditor value={editForm} onChange={editField} setMessage={editorMessage} onRefresh={async () => { await fetchSectionData("gallery"); await loadPreview(); }} />,
      custom: <DashboardCustomEditor activeSection={activeSection} normalizeCustomTitle={normalizeCustomTitle} typedSectionMap={typedSectionMap} editForm={editForm} setEditForm={editField} inputClass={inputClass} labelClass={labelClass} certSkillSearch={certSkillSearch} handleCertSkillSearch={handleCertSkillSearch} addCertSkill={addCertSkill} certSkillSuggestions={certSkillSuggestions} removeCertSkill={removeCertSkill} detectOgImage={detectOgImage} />,
    };
    return <DashboardEditorPanel activeSection={activeSection} field={fields[type]} saveMsg={saveMsg} saveStatus={saveStatus} listData={listData} showAllItems={showAllItems} saving={saving} saveLabel={LIST_SECTION_TYPES.includes(type) || type === "custom" ? (editForm.id ? "Save changes" : "Add item") : "Save"} savingLabel="Saving..." normalizeCustomTitle={normalizeCustomTitle} typedSectionMap={typedSectionMap} onClose={() => { if (!confirmDiscard()) return; resetEditor(); setActiveSection(null); }} onSave={handleSave} onEditStored={(item) => { if (!confirmDiscard()) return; resetEditor(); setEditForm({ ...item, content: parseJsonSafe<CustomSectionContent>(item.content, {}) }); }} onDeleteStored={async (item) => { if (!confirm("Delete this item?")) return; try { await api.delete(`/api/${activeSection.type.split("-")[0]}/${item.id}`); setListData((previous) => previous.filter((entry) => entry.id !== item.id)); if (editForm.id === item.id) await fetchSectionData(activeSection.type); await loadPreview(); } catch { editorMessage("Failed to delete"); } }} onToggleItems={() => setShowAllItems(!showAllItems)} />;
  };

  return (
    <div className="flex min-h-screen bg-paper font-sans text-ink">
      <DashboardAddSectionModal
        open={showAddSection}
        sections={sections}
        onClose={() => setShowAddSection(false)}
        onAdd={handleAddSection}
      />
      <DashboardProfileModal
        open={showProfile}
        profileForm={profileForm}
        profileMsg={profileMsg}
        profileError={profileError}
        setProfileForm={setProfileForm}
        setProfileError={setProfileError}
        accountEmail={user?.email || ""}
        onSubmit={handleUpdateProfile}
        onClose={() => {
          setShowProfile(false);
          setProfileMsg("");
          setProfileError("");
        }}
      />
      <DashboardSidebar
        role={user?.role}
        activeMenu={activeMenu}
        sidebarOpen={sidebarOpen}
        setActiveMenu={setActiveMenu}
        setSidebarOpen={setSidebarOpen}
        usersLabel="Users"
        badges={{ inbox: inboxUnread }}
      />
      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Dashboard header */}
        <DashboardHeader>
          <DashboardPortfolioControls
            portfolio={portfolio}
            activeMenu={activeMenu}
            onTogglePublish={handleTogglePublish}
            setPortfolio={setPortfolio}
            account={<DashboardAccountMenu user={user} open={showUserMenu} onToggle={() => setShowUserMenu(!showUserMenu)} onProfile={() => { setShowProfile(true); setShowUserMenu(false); }} onLogout={() => { handleLogout(); setShowUserMenu(false); }} />}
          />
        </DashboardHeader>
        {layoutError && (
          <div role="alert" className="mx-4 mt-3 flex items-start justify-between gap-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 md:mx-8">
            <span>{layoutError}</span>
            <button type="button" onClick={() => setLayoutError("")} className="shrink-0 font-medium underline-offset-4 hover:underline">Dismiss</button>
          </div>
        )}
        {/* Content area */}
        {activeMenu === "builder" && (
          <DashboardBuilder
            loading={!layoutLoaded}
            sections={sections}
            activeSection={activeSection}
            sensors={sensors}
            setShowAddSection={setShowAddSection}
            setActiveSection={(section) => { if (section?.id !== activeSection?.id && !confirmDiscard()) return; resetEditor(); setActiveSection(section); }}
            onDragEnd={handleDragEnd}
            onToggle={handleToggle}
            onDelete={handleDelete}
            editor={renderEditForm()}
            preview={renderPreview()}
          />
        )}
        {AI_ENABLED && activeMenu === "advisor" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <AdvisorWidget
              userId={user?.id}
              servicesInLayout={sections.some((s) => s.type === "services" && s.enabled)}
              onServicesSaved={showServicesSection}
            />
          </div>
        )}

        {activeMenu === "inbox" && <InboxPanel onUnreadChange={setInboxUnread} />}

        {activeMenu === "analytics" && (
          <AnalyticsPanel
            visits={visits}
            setVisits={setVisits}
            dateFrom={dateFrom}
            dateTo={dateTo}
            setDateFrom={setDateFrom}
            setDateTo={setDateTo}
            initialLoading={visitsLoading}
            initialError={visitsError}
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
                  { type: SectionType; label: string; icon: string }
                > = {
                  bio: { type: "about", label: "About", icon: "A" },
                  skills: { type: "skills", label: "Skills", icon: "SK" },
                  projects: { type: "projects", label: "Projects", icon: "P" },
                };
                const updated = [...prev];
                imported.forEach((s: string) => {
                  const info = sectionMap[s];
                  if (info) {
                    const exists = updated.find(
                      (sec) => sec.type === info.type,
                    );
                    if (!exists) {
                      updated.push({
                        id: `${info.type}-${Date.now()}`,
                        type: info.type,
                        label: info.label,
                        icon: info.icon,
                        enabled: true,
                        deletable: true,
                      });
                    }
                  }
                });
                if (portfolio) {
                  saveLayout(updated);
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



