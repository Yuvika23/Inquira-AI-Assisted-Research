"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiCall } from "@/lib/api";
import Sidebar, { SidebarTab } from "@/components/Sidebar";
import ProjectCard, { Project } from "@/components/ProjectCard";
import { 
    Plus, 
    Search, 
    SlidersHorizontal, 
    LayoutDashboard,
    Menu,
    X,
    BarChart3, 
    TrendingUp, 
    Sparkles, 
    FolderKanban, 
    FileText, 
    Globe, 
    CheckCircle,
    User,
    FileSpreadsheet,
    Cpu,
    Briefcase,
    BookOpen,
    Loader2,
    Calendar,
    ChevronRight,
    Star,
    Compass,
    Settings as SettingsIcon,
    AlertCircle,
    ArrowLeft,
    Send,
    FileCode,
    CheckSquare,
    Presentation as PresIcon,
    History as HistoryIcon,
    FileUp,
    Bookmark,
    Trash2,
    Edit3,
    Video,
    HardDrive,
    ArrowUpDown,
    Filter,
    Layers,
    ExternalLink,
    HelpCircle,
    Check,
    BookmarkPlus,
    Download,
    ChevronDown,
    ChevronUp,
    Share2,
    MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import pptxgen from "pptxgenjs";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    AreaChart,
    Area,
    CartesianGrid
} from "recharts";

// TanStack Table Imports
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    ColumnDef,
    flexRender,
    SortingState,
    VisibilityState
} from "@tanstack/react-table";

const getSourceTypeIcon = (type: string) => {
    switch (type) {
        case "Website URL":
            return Globe;
        case "PDF Upload":
            return FileText;
        case "Research Paper":
            return BookOpen;
        case "YouTube Transcript":
            return Video;
        case "Google Drive":
            return HardDrive;
        case "Manual Notes":
            return Edit3;
        default:
            return Bookmark;
    }
};

interface Stats {
    total_projects: number;
    reports_generated: number;
    sources_collected: number;
    executive_briefs_created: number;
}

interface SourceItem {
    id: number;
    title: string;
    author: string | null;
    organization: string | null;
    publication_date: string | null;
    source_type: string;
    source_url: string | null;
    credibility_score: number;
    status: string;
    tags: string | null;
    content: string | null;
    is_favorite: boolean;
    project_id: number;
    created_at: string;
    
    // Structured research analysis fields
    analysis_summary: string | null;
    analysis_findings: string | null; 
    analysis_stats: string | null;    
    analysis_insights: string | null; 
    analysis_quotes: string | null;   
    analysis_keywords: string | null;
    analysis_confidence: number | null;
    verified_facts: string | null;    
    ai_interpretation: string | null; 
    assumptions: string | null;       
    open_questions: string | null;    
}

// Full Evidence Database structure mirroring backend schema
interface EvidenceItem {
    id: number;
    claim: string;
    supporting_evidence: string | null;
    source: string | null;
    publication_date: string | null;
    evidence_type: string;
    confidence_level: string;
    business_impact: string | null;
    recommendation: string | null;
    risk: string | null;
    priority: string;
    project_id: number;
    created_at: string;
}

interface TaskItem {
    id: number;
    text: string;
    completed: boolean;
}

interface ChatMessage {
    sender: "user" | "ai";
    text: string;
}

interface HistoryLog {
    id: number;
    action: string;
    date: string;
}

export default function DashboardPage() {
    const { user, updateProfile, isLoading: authLoading } = useAuth();
    
    // UI Layout states
    const [activeTab, setActiveTab] = useState<SidebarTab>("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    // Data states
    const [projects, setProjects] = useState<Project[]>([]);
    const [stats, setStats] = useState<Stats>({
        total_projects: 0,
        reports_generated: 0,
        sources_collected: 0,
        executive_briefs_created: 0
    });
    const [loading, setLoading] = useState(true);

    // Filters for project view
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [industryFilter, setIndustryFilter] = useState("All");

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newProject, setNewProject] = useState({
        name: "",
        description: "",
        industry: "Technology",
        progress: 0,
        status: "Active",
        business_question: "",
        objectives: "",
        keywords: "",
        research_timeline: ""
    });

    const [showRenameModal, setShowRenameModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [renameName, setRenameName] = useState("");
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    // Re-bind Settings Profile states
    const [profileName, setProfileName] = useState("");
    const [profilePassword, setProfilePassword] = useState("");
    const [profileAvatar, setProfileAvatar] = useState("");
    const [profileLoading, setProfileLoading] = useState(false);
    // -------------------------------------------------------------
    // ACTIVE WORKSPACE VIEW STATES (Notion + NotebookLM Mode)
    // -------------------------------------------------------------
    const [activeProject, setActiveProject] = useState<Project | null>(null);
    const [workspaceTab, setWorkspaceTab] = useState<"overview" | "sources" | "evidence" | "brief" | "plan" | "presentation" | "history">("overview");
    const [workspaceSaving, setWorkspaceSaving] = useState(false);
    const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
    const [showGoogleSlidesModal, setShowGoogleSlidesModal] = useState(false);
    const [notesExpanded, setNotesExpanded] = useState(true);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showShortcutsModal, setShowShortcutsModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showCommentsPanel, setShowCommentsPanel] = useState(false);
    const [searchQueryGlobal, setSearchQueryGlobal] = useState("");
    const [autosaveStatus, setAutosaveStatus] = useState<"saved" | "saving" | null>(null);
    const [commentsList, setCommentsList] = useState<{ id: number; author: string; text: string; date: string }[]>([
        { id: 1, author: "Inquira Assistant", text: "Welcome to your active workspace commentary desk! Add notes to share references with collaborators.", date: "Just now" }
    ]);
    const [commentInput, setCommentInput] = useState("");
    // Editable overview fields
    const [editFields, setEditFields] = useState({
        name: "",
        business_question: "",
        industry: "",
        objectives: "",
        keywords: "",
        status: "",
        research_timeline: ""
    });

    // NotebookLM Workspace Data States (bound to database)
    const [sources, setSources] = useState<SourceItem[]>([]);
    const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
    const [tasks, setTasks] = useState<TaskItem[]>([]);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>([]);

    // Chat controls
    const [chatInput, setChatInput] = useState("");
    const [chatLoading, setChatLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Source Library filters, sorting, and category grouping
    const [sourceSearch, setSourceSearch] = useState("");
    const [sourceTypeFilter, setSourceTypeFilter] = useState("All");
    const [sourceSort, setSourceSort] = useState("date-desc");
    const [sourceGroupByCat, setSourceGroupByCat] = useState(false);

    // Add Source Dialog wizard state
    const [showAddSourceModal, setShowAddSourceModal] = useState(false);
    const [sourceFormType, setSourceFormType] = useState<"url" | "pdf" | "paper" | "youtube" | "gdrive" | "notes">("url");
    
    // Add Source input fields
    const [sourceIn, setSourceIn] = useState({
        title: "",
        author: "",
        organization: "",
        publication_date: "",
        source_url: "",
        credibility_score: 80,
        tags: "",
        content: ""
    });

    // Google Drive files picker mock database
    const mockGDriveFiles = [
        { title: "ESG Compliance Report.pdf", author: "Dr. Linda Gray", org: "EcoGrid Solutions", date: "2026-06-25", score: 92, tags: "compliance, operations", content: "This document assesses grid compatibility parameters for storage arrays in Western regions. Findings point to an output efficiency rating of 94.2% and verify regulatory conformity protocols. We assume that solar energy availability holds next summer, but don't know the exact EU tariff updates yet." },
        { title: "User Persona Research.docx", author: "Markus Vance", org: "Inquira Research", date: "2026-07-02", score: 88, tags: "demographics, UX", content: "UX surveys gathered feedback from 400 platform practitioners. Major observations prove that responsive layouts with glassmorphic cards and interactive sidebar tabs boost average user retention metrics by 22%. It remains unclear whether mobile viewport adoption will match desktop metrics." },
        { title: "Tech Sector Churn.xlsx", author: "SaaS Analytics", org: "SaaS Capital", date: "2026-07-03", score: 85, tags: "finance, churn", content: "Spreadsheet tracks churn details in the SaaS sector. Compounded retention curves are increasing by 4.2x in unified document workspace portals that support direct source integrations. We forecast operational latency will decrease by 30% after database migration structures complete." }
    ];

    // Structured AI Insights Drawer state
    const [selectedInsightSource, setSelectedInsightSource] = useState<SourceItem | null>(null);
    const [insightsDrawerTab, setInsightsDrawerTab] = useState<"findings" | "splits">("findings");

    // -------------------------------------------------------------
    // INTERACTIVE EVIDENCE DATABASE STATES (TanStack Table & Airtable)
    // -------------------------------------------------------------
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
        risk: false,
        recommendation: false,
        business_impact: false
    });
    const [globalFilter, setGlobalFilter] = useState("");
    const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
    
    // Custom filter selections
    const [evidenceTypeFilter, setEvidenceTypeFilter] = useState("All");
    const [evidencePriorityFilter, setEvidencePriorityFilter] = useState("All");
    const [evidenceConfidenceFilter, setEvidenceConfidenceFilter] = useState("All");

    // Add Evidence dialog modal trigger & inputs
    const [showAddEvidenceModal, setShowAddEvidenceModal] = useState(false);
    const [newEvidence, setNewEvidence] = useState({
        claim: "",
        supporting_evidence: "",
        source: "",
        publication_date: "",
        evidence_type: "Metric",
        confidence_level: "High",
        business_impact: "",
        recommendation: "",
        risk: "",
        priority: "High"
    });

    // Saved reports page state
    const [savedReports, setSavedReports] = useState<Array<{ id: number; title: string; project: string; date: string; summary: string }>>([
        { 
            id: 1, 
            title: "SaaS Market Performance Audit", 
            project: "Inquira Competitor Audit", 
            date: "2026-07-06", 
            summary: "Analyzed top 10 market players in SaaS business intelligence. Key findings indicate a 35% growth in low-code AI pipeline builders and an increasing preference for local model deployment protocols to assure data safety compliance." 
        },
        { 
            id: 2, 
            title: "Clean Energy Integration Proposal", 
            project: "EcoGrid Solutions Due Diligence", 
            date: "2026-06-28", 
            summary: "Detailed review of eco-grid battery solutions. Assessed Lithium-Iron-Phosphate cell pricing trends, utility-scale grid compatibility, and regulatory hurdles in the EU and Western US markets." 
        }
    ]);
    const [selectedReport, setSelectedReport] = useState<typeof savedReports[0] | null>(null);

    // Pre-built templates
    const templates = [
        { name: "SaaS Competitor Analysis", industry: "Technology", icon: Cpu, desc: "Perform product teardowns, feature checks, pricing schemes, and SEO audits on top software competitors." },
        { name: "Market Entry Assessment", industry: "Finance", icon: Briefcase, desc: "Evaluate market sizes, barriers to entry, compound growth, and strategic corridors in a target country." },
        { name: "Eco-Friendly Operations Audit", industry: "Energy", icon: Globe, desc: "Formulate sustainability compliance indexes, scope-1 carbon levels, and grid storage recommendations." },
        { name: "Retail User Persona Study", industry: "Healthcare", icon: BookOpen, desc: "Analyze health consumer search terms, demographic channels, prescription churn rates, and feedback pipelines." }
    ];

    // Scroll chat helper
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);

    // Keyboard Shortcuts & Command Menu Event Listeners
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Open Command Menu: Ctrl + K
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setShowSearchModal(prev => !prev);
            }
            // Open Shortcuts Modal: ? (when not inside inputs)
            if (e.key === "?" && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
                e.preventDefault();
                setShowShortcutsModal(prev => !prev);
            }
            // Exit active elements: Escape
            if (e.key === "Escape") {
                setShowSearchModal(false);
                setShowShortcutsModal(false);
                setShowShareModal(false);
                setShowCommentsPanel(false);
            }
            // Tab Switches: 1-7
            if (activeProject && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
                const tabsMap: Record<string, typeof workspaceTab> = {
                    "1": "overview",
                    "2": "sources",
                    "3": "evidence",
                    "4": "brief",
                    "5": "plan",
                    "6": "presentation",
                    "7": "history"
                };
                if (tabsMap[e.key]) {
                    e.preventDefault();
                    setWorkspaceTab(tabsMap[e.key]);
                    showToast(`Switched to ${tabsMap[e.key]} workspace view`, "success");
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [activeProject, showSearchModal, showShortcutsModal, workspaceTab]);

    useEffect(() => {
        if (user) {
            setProfileName(user.full_name);
            setProfileAvatar(user.avatar_url || "");
        }
    }, [user]);

    // Fetch initial database entities
    const fetchData = async () => {
        setLoading(true);
        try {
            const projectsData = await apiCall("/projects/");
            setProjects(projectsData);
            
            const statsData = await apiCall("/projects/stats");
            setStats(statsData);
        } catch (err: any) {
            showToast(err.message || "Failed to load workspace data", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user, activeTab]);

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Trigger workspace view & Fetch sources & evidence from database
    const openWorkspace = (project: Project) => {
        setActiveProject(project);
        setWorkspaceTab("overview");
        setSelectedInsightSource(null); 
        setExpandedRows({}); // Reset expanded rows
        
        // Load project edit fields
        setEditFields({
            name: project.name,
            business_question: project.business_question || "",
            industry: project.industry || "Technology",
            objectives: project.objectives || "",
            keywords: project.keywords || "",
            status: project.status || "Active",
            research_timeline: project.research_timeline || ""
        });

        setTasks([
            { id: 1, text: "Define main core research objectives", completed: true },
            { id: 2, text: "Upload dynamic sector documents to NotebookLM Sources list", completed: true },
            { id: 3, text: "Clip evidence findings to the active pasteboard", completed: false },
            { id: 4, text: "Compile AI-assisted Executive Brief summary", completed: false },
            { id: 5, text: "Structure Action Plan lists and present conclusions", completed: false }
        ]);

        setChatMessages([
            { sender: "ai", text: `Welcome to your Inquira Research Workspace! I've loaded your project sources. You can ask me questions about them, and I'll generate responses cited from your documents.` }
        ]);

        setHistoryLogs([
            { id: 1, action: "Project Workspace initialized", date: "2026-07-08 17:15" }
        ]);

        // Load project sources from API. If empty, seed defaults
        apiCall(`/projects/${project.id}/sources`).then(data => {
            if (data && data.length > 0) {
                setSources(data);
            } else {
                const initialMocks = [
                    { title: "Industry Analysis Report.pdf", author: "Dr. Karen Vance", organization: "TechPulse Research", publication_date: "2026-07-08", source_type: "PDF Upload", source_url: "", credibility_score: 95, status: "Indexed", tags: "trends, engagement", content: "Executive findings indicate that 72% of modern web platforms are implementing responsive glassmorphism styles to increase average session length. Core infrastructure centers on FastAPI schemas for high-speed endpoints and auto-saved SQLite database structures for development cycles. We assume grid compatibility parameters hold, but don't know latency constraints yet." },
                    { title: "Financial Forecasts.xlsx", author: "Markus Vance", organization: "SaaS Capital", publication_date: "2026-07-05", source_type: "Google Drive", source_url: "", credibility_score: 90, status: "Indexed", tags: "finance, projections", content: "Revenue projection sheets point to a 4.2x compound increase in sector-wide AI workspaces. Capital allocations are migrating from legacy enterprise dashboards to unified research grids featuring NotebookLM document chats. We expect a major mobile expansion, but remain unsure of exact EU regulatory requirements." },
                    { title: "https://notion.so/ai-briefcase", author: "Product Guild", organization: "Notion Team", publication_date: "2026-07-02", source_type: "Website URL", source_url: "https://notion.so/ai-briefcase", credibility_score: 85, status: "Indexed", tags: "guidelines, operations", content: "Resource document detailing standard guidelines on collaborative business research. Suggests structuring workspaces around sequential stages: Research Topic, Sources, Evidence, Briefs, Action Plans, and Stakeholder Presentations. We suggest first-movers adopt high-fidelity widgets to boost engagement." }
                ];
                Promise.all(initialMocks.map(m => apiCall(`/projects/${project.id}/sources`, {
                    method: "POST",
                    body: JSON.stringify(m)
                }))).then(seeded => {
                    setSources(seeded);
                });
            }
        });

        // Load project evidence from API. If empty, seed default Airtable evidence points!
        apiCall(`/projects/${project.id}/evidence`).then(data => {
            if (data && data.length > 0) {
                setEvidence(data);
            } else {
                const initialEv = [
                    { claim: "Responsive Glassmorphism Styles increase Engagement", supporting_evidence: "surveys point to up to 22% compound retention increase in user retention session indexes.", source: "Industry Analysis Report.pdf", publication_date: "2026-07-08", evidence_type: "Metric", confidence_level: "High", business_impact: "Improves overall session average times and keeps users focused on content grids.", recommendation: "Accelerate custom card layouts across dashboard widgets.", risk: "Minor render lag on legacy viewports.", priority: "High" },
                    { claim: "Sequential Research Workspace structures align user output", supporting_evidence: "structuring workspaces in sequence boosts report output ratios by 35% compared to multi-workspace clutter.", source: "https://notion.so/ai-briefcase", publication_date: "2026-07-02", evidence_type: "Trend", confidence_level: "Medium", business_impact: "Aligns stakeholder coordination paths and reduces data search times.", recommendation: "Establish 6-step progress timelines in all workspaces.", risk: "Initial operational latency on new user onboarding.", priority: "Medium" }
                ];
                Promise.all(initialEv.map(e => apiCall(`/projects/${project.id}/evidence`, {
                    method: "POST",
                    body: JSON.stringify(e)
                }))).then(seeded => {
                    setEvidence(seeded);
                    setHistoryLogs(prev => [
                        { id: prev.length + 1, action: "Loaded default evidence data points to Airtable board", date: "2026-07-08 17:21" },
                        ...prev
                    ]);
                });
            }
        });
    };

    // Save workspace Overview changes to database
    const handleSaveWorkspaceOverview = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!activeProject) return;
        setWorkspaceSaving(true);
        try {
            const updated = await apiCall(`/projects/${activeProject.id}`, {
                method: "PUT",
                body: JSON.stringify(editFields),
            });
            setActiveProject(updated);
            setProjects(projects.map(p => p.id === activeProject.id ? updated : p));
            showToast("Research Workspace overview updated!", "success");
            
            const logEntry = {
                id: historyLogs.length + 1,
                action: `Updated project fields: ${Object.keys(editFields).filter(k => (editFields as any)[k] !== (activeProject as any)[k]).join(", ") || "overview info"}`,
                date: new Date().toISOString().replace("T", " ").substring(0, 16)
            };
            setHistoryLogs([logEntry, ...historyLogs]);
        } catch (err: any) {
            showToast("Failed to save overview details", "error");
        } finally {
            setWorkspaceSaving(false);
        }
    };

    // Progress updates mapped to Workflow Steps
    const getWorkflowStep = (progress: number) => {
        if (progress < 20) return 0;
        if (progress < 40) return 1;
        if (progress < 60) return 2;
        if (progress < 80) return 3;
        if (progress < 100) return 4;
        return 5;
    };

    const workflowSteps = [
        { label: "Research Topic", minVal: 0 },
        { label: "Sources", minVal: 20 },
        { label: "Evidence", minVal: 40 },
        { label: "Brief", minVal: 60 },
        { label: "Action Plan", minVal: 80 },
        { label: "Presentation", minVal: 100 }
    ];

    const handleWorkflowClick = async (stepIdx: number) => {
        if (!activeProject) return;
        const targetVal = workflowSteps[stepIdx].minVal;
        try {
            const updated = await apiCall(`/projects/${activeProject.id}`, {
                method: "PUT",
                body: JSON.stringify({ progress: targetVal, status: targetVal === 100 ? "Completed" : activeProject.status }),
            });
            setActiveProject(updated);
            setProjects(projects.map(p => p.id === activeProject.id ? updated : p));
            showToast(`Workflow progress moved to ${workflowSteps[stepIdx].label}`, "success");
        } catch (err) {
            showToast("Failed to update progress value", "error");
        }
    };

    // Chat query handler
    const handleSendChat = () => {
        if (!chatInput.trim() || !activeProject) return;
        
        const userMsg: ChatMessage = { sender: "user", text: chatInput };
        setChatMessages(prev => [...prev, userMsg]);
        const query = chatInput;
        setChatInput("");
        setChatLoading(true);

        setTimeout(() => {
            const matchedSources = sources.filter(s => 
                (s.content && s.content.toLowerCase().includes(query.toLowerCase())) || 
                s.title.toLowerCase().includes(query.toLowerCase())
            );

            let aiText = "";
            if (matchedSources.length > 0) {
                const src = matchedSources[0];
                aiText = `Based on your source **${src.title}** (Confidence Score: ${src.analysis_confidence}%, Author: ${src.author || "Unknown"}), I found this citation:
                
> "${src.content ? src.content.substring(0, 180) : "No text details"}"

In the context of **${activeProject.name}** and the **${activeProject.industry}** industry parameters, this implies that you should accelerate your structural plans. Specifically, focus on deploying containerized local vector stores to optimize latency profiles.`;
            } else {
                aiText = `I couldn't find a direct keyword match in your active sources list for "${query}". 

However, looking at the general scope of **${activeProject.name}**, you should align your roadmap to standard deliverables. Let's make sure we verify objectives under the **Overview** tab and populate evidence indices before building the brief.`;
            }

            setChatMessages(prev => [...prev, { sender: "ai", text: aiText }]);
            setChatLoading(false);
        }, 1200);
    };

    // Add new source item database handler
    const handleAddSourceSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeProject) return;
        
        let typeStr = "Website URL";
        if (sourceFormType === "pdf") typeStr = "PDF Upload";
        else if (sourceFormType === "paper") typeStr = "Research Paper";
        else if (sourceFormType === "youtube") typeStr = "YouTube Transcript";
        else if (sourceFormType === "gdrive") typeStr = "Google Drive";
        else if (sourceFormType === "notes") typeStr = "Manual Notes";

        setWorkspaceSaving(true);
        try {
            const payload = {
                title: sourceIn.title,
                author: sourceIn.author || null,
                organization: sourceIn.organization || null,
                publication_date: sourceIn.publication_date || null,
                source_type: typeStr,
                source_url: sourceIn.source_url || null,
                credibility_score: sourceIn.credibility_score,
                status: "Indexed",
                tags: sourceIn.tags || null,
                content: sourceIn.content || "Empty content",
                is_favorite: false
            };

            const saved = await apiCall(`/projects/${activeProject.id}/sources`, {
                method: "POST",
                body: JSON.stringify(payload)
            });

            setSources([saved, ...sources]);
            setShowAddSourceModal(false);
            setSourceIn({ title: "", author: "", organization: "", publication_date: "", source_url: "", credibility_score: 80, tags: "", content: "" });
            showToast(`Ingested and analyzed source: ${saved.title}`, "success");

            setHistoryLogs(prev => [
                { id: prev.length + 1, action: `Ingested source: ${saved.title} [${saved.source_type}]`, date: new Date().toISOString().replace("T", " ").substring(0, 16) },
                ...prev
            ]);
            
            setStats(prev => ({ ...prev, sources_collected: prev.sources_collected + 1 }));
            setSelectedInsightSource(saved); 
        } catch (err: any) {
            showToast("Failed to save source", "error");
        } finally {
            setWorkspaceSaving(false);
        }
    };

    // Google Drive simulated picker import
    const handleIngestGDriveFile = async (idx: number) => {
        if (!activeProject) return;
        const file = mockGDriveFiles[idx];
        setWorkspaceSaving(true);
        try {
            const payload = {
                title: file.title,
                author: file.author,
                organization: file.org,
                publication_date: file.date,
                source_type: "Google Drive",
                source_url: "https://drive.google.com/mock-file",
                credibility_score: file.score,
                status: "Indexed",
                tags: file.tags,
                content: file.content,
                is_favorite: false
            };

            const saved = await apiCall(`/projects/${activeProject.id}/sources`, {
                method: "POST",
                body: JSON.stringify(payload)
            });

            setSources([saved, ...sources]);
            setShowAddSourceModal(false);
            showToast(`Ingested and analyzed: ${saved.title}`, "success");

            setHistoryLogs(prev => [
                { id: prev.length + 1, action: `Imported GDrive file: ${saved.title}`, date: new Date().toISOString().replace("T", " ").substring(0, 16) },
                ...prev
            ]);
            setStats(prev => ({ ...prev, sources_collected: prev.sources_collected + 1 }));
            setSelectedInsightSource(saved); 
        } catch (err) {
            showToast("Failed to ingest Google Drive file", "error");
        } finally {
            setWorkspaceSaving(false);
        }
    };

    // Toggle Favorite Source
    const handleToggleFavoriteSource = async (srcId: number, currentVal: boolean) => {
        if (!activeProject) return;
        try {
            const updated = await apiCall(`/projects/${activeProject.id}/sources/${srcId}`, {
                method: "PUT",
                body: JSON.stringify({ is_favorite: !currentVal }),
            });
            setSources(sources.map(s => s.id === srcId ? updated : s));
            if (selectedInsightSource?.id === srcId) {
                setSelectedInsightSource(updated);
            }
            showToast(updated.is_favorite ? "Source favorited" : "Source unfavorited", "success");
        } catch (err) {
            showToast("Failed to update source", "error");
        }
    };

    // Delete Source
    const handleDeleteSource = async (srcId: number) => {
        if (!activeProject) return;
        try {
            await apiCall(`/projects/${activeProject.id}/sources/${srcId}`, { method: "DELETE" });
            const deleted = sources.find(s => s.id === srcId);
            setSources(sources.filter(s => s.id !== srcId));
            if (selectedInsightSource?.id === srcId) {
                setSelectedInsightSource(null);
            }
            showToast("Source deleted from library", "success");

            setHistoryLogs(prev => [
                { id: prev.length + 1, action: `Deleted source: ${deleted?.title || "Unknown"}`, date: new Date().toISOString().replace("T", " ").substring(0, 16) },
                ...prev
            ]);
            setStats(prev => ({ ...prev, sources_collected: Math.max(0, prev.sources_collected - 1) }));
        } catch (err) {
            showToast("Failed to delete source", "error");
        }
    };

    // Clip Quote to Evidence directly from insights card
    const handleClipQuoteToEvidence = async (quoteText: string, citationText: string) => {
        if (!activeProject) return;
        const title = prompt("Enter evidence claim summary:", "Key Stat metric");
        if (!title) return;

        setWorkspaceSaving(true);
        try {
            const payload = {
                claim: title,
                supporting_evidence: quoteText,
                source: citationText.split(" (")[0],
                publication_date: citationText.includes(" (") ? citationText.split(" (")[1].replace(")", "") : "2026",
                evidence_type: "Quote",
                confidence_level: "High",
                business_impact: "Identified via AI summary. Confirms operational retention indices.",
                recommendation: "Review findings and align objectives.",
                risk: "Unverified third party bias.",
                priority: "High"
            };

            const saved = await apiCall(`/projects/${activeProject.id}/evidence`, {
                method: "POST",
                body: JSON.stringify(payload)
            });

            setEvidence([saved, ...evidence]);
            showToast("Quote clipped to Airtable Evidence Database!", "success");

            setHistoryLogs(prev => [
                { id: prev.length + 1, action: `Clipped quote to table: ${saved.claim}`, date: new Date().toISOString().replace("T", " ").substring(0, 16) },
                ...prev
            ]);
        } catch (err) {
            showToast("Failed to clip quote to database", "error");
        } finally {
            setWorkspaceSaving(false);
        }
    };

    // Clip Quote to Evidence (from generic manual selections)
    const handleClipEvidence = async (sourceTitle: string, selectedText: string) => {
        if (!activeProject) return;
        const title = prompt("Enter snippet claim summary:", "Evidence point");
        if (!title) return;

        setWorkspaceSaving(true);
        try {
            const payload = {
                claim: title,
                supporting_evidence: selectedText,
                source: sourceTitle,
                publication_date: new Date().getFullYear().toString(),
                evidence_type: "Quote",
                confidence_level: "High",
                business_impact: "Selected by user. Confirms structural parameters.",
                recommendation: "Incorporate in final executive briefs.",
                risk: "Varies depending on source credibility.",
                priority: "High"
            };

            const saved = await apiCall(`/projects/${activeProject.id}/evidence`, {
                method: "POST",
                body: JSON.stringify(payload)
            });

            setEvidence([saved, ...evidence]);
            showToast("Snippet clipped to Airtable Evidence Database!", "success");

            setHistoryLogs(prev => [
                { id: prev.length + 1, action: `Clipped snippet to table: ${saved.claim}`, date: new Date().toISOString().replace("T", " ").substring(0, 16) },
                ...prev
            ]);
        } catch (err) {
            showToast("Failed to clip selection", "error");
        } finally {
            setWorkspaceSaving(false);
        }
    };

    // Toggle task completion
    const handleToggleTask = async (taskId: number) => {
        const nextTasks = tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
        setTasks(nextTasks);

        const completedCount = nextTasks.filter(t => t.completed).length;
        const pct = Math.round((completedCount / nextTasks.length) * 100);

        if (activeProject) {
            try {
                const updated = await apiCall(`/projects/${activeProject.id}`, {
                    method: "PUT",
                    body: JSON.stringify({ progress: pct, status: pct === 100 ? "Completed" : activeProject.status }),
                });
                setActiveProject(updated);
                setProjects(projects.map(p => p.id === activeProject.id ? updated : p));
            } catch (err) {
                console.error("Failed to auto-update progress");
            }
        }
    };

    const handleGenerateActionPlan = async () => {
        if (!activeProject) return;
        setWorkspaceSaving(true);
        try {
            const updated = await apiCall(`/projects/${activeProject.id}/plan/generate`, {
                method: "POST"
            });
            setActiveProject(updated);
            setProjects(projects.map(p => p.id === activeProject.id ? updated : p));
            showToast("30-Day Action Plan Roadmap synthesized!", "success");

            setHistoryLogs(prev => [
                { id: prev.length + 1, action: "Synthesized 30-day action plan timeline using AI planner", date: new Date().toISOString().replace("T", " ").substring(0, 16) },
                ...prev
            ]);
        } catch (err) {
            showToast("Failed to generate roadmap", "error");
        } finally {
            setWorkspaceSaving(false);
        }
    };

    const handleTogglePlanWeek = async (weekIdx: number) => {
        if (!activeProject || !activeProject.action_plan) return;
        try {
            const plan = JSON.parse(activeProject.action_plan);
            plan[weekIdx].completed = !plan[weekIdx].completed;

            const completedWeeks = plan.filter((w: any) => w.completed).length;
            const pct = Math.round((completedWeeks / plan.length) * 100);

            const updated = await apiCall(`/projects/${activeProject.id}`, {
                method: "PUT",
                body: JSON.stringify({ 
                    action_plan: JSON.stringify(plan),
                    progress: pct === 100 ? 100 : Math.max(activeProject.progress, pct)
                })
            });
            setActiveProject(updated);
            setProjects(projects.map(p => p.id === activeProject.id ? updated : p));
            showToast(`Updated completion status for ${plan[weekIdx].week}`, "success");

            setHistoryLogs(prev => [
                { id: prev.length + 1, action: `Toggled completion status for action plan: ${plan[weekIdx].week}`, date: new Date().toISOString().replace("T", " ").substring(0, 16) },
                ...prev
            ]);
        } catch (err) {
            showToast("Failed to save progress", "error");
        }
    };

    const handleGeneratePresentation = async () => {
        if (!activeProject) return;
        setWorkspaceSaving(true);
        try {
            const updated = await apiCall(`/projects/${activeProject.id}/presentation/generate`, {
                method: "POST"
            });
            setActiveProject(updated);
            setProjects(projects.map(p => p.id === activeProject.id ? updated : p));
            setCurrentSlideIdx(0);
            showToast("Presentation outline deck generated!", "success");

            setHistoryLogs(prev => [
                { id: prev.length + 1, action: "Generated widescreen slide outline presentation with speaker notes", date: new Date().toISOString().replace("T", " ").substring(0, 16) },
                ...prev
            ]);
        } catch (err) {
            showToast("Failed to generate presentation outlines", "error");
        } finally {
            setWorkspaceSaving(false);
        }
    };

    const handleExportPptx = () => {
        if (!activeProject || !activeProject.presentation_slides) return;
        try {
            const slides = JSON.parse(activeProject.presentation_slides);
            const pptx = new pptxgen();
            
            // Set widescreen 16:9 layout
            pptx.defineLayout({ name: 'WIDE_LAYOUT', width: 13.33, height: 7.5 });
            pptx.layout = 'WIDE_LAYOUT';

            slides.forEach((sl: any) => {
                const slide = pptx.addSlide();
                slide.background = { fill: "0F0F12" }; // Premium dark zinc background

                // Slide Title
                slide.addText(sl.title, {
                    x: 0.8,
                    y: 0.8,
                    w: 11.7,
                    h: 0.8,
                    fontSize: 28,
                    bold: true,
                    color: "FFFFFF",
                    fontFace: "Arial"
                });

                // Slide Subtitle
                if (sl.subtitle) {
                    slide.addText(sl.subtitle, {
                        x: 0.8,
                        y: 1.5,
                        w: 11.7,
                        h: 0.4,
                        fontSize: 14,
                        italic: true,
                        color: "818CF8", // Indigo-400
                        fontFace: "Arial"
                    });
                }

                // Bullets list content
                if (sl.bullets && sl.bullets.length > 0) {
                    const bulletObjects = sl.bullets.map((b: string) => {
                        return { text: b, options: { bullet: true, color: "D1D5DB" } };
                    });
                    
                    slide.addText(bulletObjects, {
                        x: 0.8,
                        y: 2.2,
                        w: 11.7,
                        h: 4.2,
                        fontSize: 14,
                        lineSpacing: 24,
                        fontFace: "Arial"
                    });
                }

                // Speaker Notes binding
                if (sl.speaker_notes) {
                    (slide as any).notes = sl.speaker_notes;
                }
            });

            pptx.writeFile({ fileName: `${activeProject.name.replace(/\s+/g, '_')}_Presentation_Outline.pptx` });
            showToast("PowerPoint file (.pptx) downloaded successfully!", "success");
        } catch (err) {
            showToast("Failed to compile PowerPoint file", "error");
            console.error(err);
        }
    };

    const handleExportDocx = () => {
        if (!activeProject || !activeProject.executive_brief) return;
        try {
            const brief = JSON.parse(activeProject.executive_brief);
            const htmlContent = `
                <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
                <head>
                    <title>Inquira Executive Brief</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #111111; padding: 40px; }
                        h1 { color: #1e3a8a; font-size: 24pt; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; }
                        h2 { color: #3b82f6; font-size: 16pt; margin-top: 24px; }
                        p { font-size: 11pt; }
                        blockquote { border-left: 3px solid #3b82f6; padding-left: 12px; font-style: italic; color: #4b5563; }
                        .callout { background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 12px; border-radius: 8px; margin: 12px 0; }
                    </style>
                </head>
                <body>
                    <h1>${activeProject.name}</h1>
                    <p><strong>Industry:</strong> ${activeProject.industry}</p>
                    <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
                    
                    <h2>1. Executive Summary</h2>
                    <p>${brief.executive_summary || ""}</p>
                    
                    <h2>2. Business Context</h2>
                    <p>${brief.business_context || ""}</p>
                    
                    <h2>3. Research Objectives</h2>
                    <p>${brief.research_objectives || ""}</p>
                    
                    <h2>4. Major Findings</h2>
                    <ul>
                        ${(brief.major_findings || []).map((f: string) => `<li>${f}</li>`).join("")}
                    </ul>
                    
                    <h2>5. Industry Trends</h2>
                    <ul>
                        ${(brief.industry_trends || []).map((t: string) => `<li>${t}</li>`).join("")}
                    </ul>
                    
                    <h2>6. Strategic Opportunities</h2>
                    <div class="callout">
                        <strong>Opportunities:</strong>
                        <ul>
                            ${(brief.opportunities || []).map((o: string) => `<li>${o}</li>`).join("")}
                        </ul>
                    </div>
                    
                    <h2>7. Risk Analysis</h2>
                    <div class="callout" style="background-color: #fef2f2; border-color: #fecaca;">
                        <strong>Risk Parameters:</strong>
                        <ul>
                            ${(brief.risk_analysis || []).map((r: string) => `<li>${r}</li>`).join("")}
                        </ul>
                    </div>
                    
                    <h2>8. Strategic Recommendations</h2>
                    <ul>
                        ${(brief.recommendations || []).map((r: string) => `<li>${r}</li>`).join("")}
                    </ul>
                    
                    <h2>9. Future Outlook</h2>
                    <p>${brief.future_outlook || ""}</p>
                </body>
                </html>
            `;
            const blob = new Blob(['\ufeff' + htmlContent], {
                type: 'application/msword'
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${activeProject.name.replace(/\s+/g, '_')}_Executive_Brief.doc`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast("Word document (.doc) downloaded successfully!", "success");
        } catch (err) {
            showToast("Failed to compile Word document", "error");
        }
    };

    const handlePostComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentInput.trim() || !user) return;
        
        const newComm = {
            id: commentsList.length + 1,
            author: user.full_name || "Researcher",
            text: commentInput,
            date: "Just now"
        };
        setCommentsList([...commentsList, newComm]);
        setCommentInput("");
        showToast("Feedback comment registered!", "success");
    };

    const handleDeleteComment = (id: number) => {
        setCommentsList(commentsList.filter(c => c.id !== id));
        showToast("Comment discarded", "success");
    };

    const handleTriggerAutosave = async (fieldsUpdate: any) => {
        if (!activeProject) return;
        setAutosaveStatus("saving");
        try {
            const updated = await apiCall(`/projects/${activeProject.id}`, {
                method: "PUT",
                body: JSON.stringify(fieldsUpdate)
            });
            setActiveProject(updated);
            setProjects(projects.map(p => p.id === activeProject.id ? updated : p));
            setAutosaveStatus("saved");
            setTimeout(() => setAutosaveStatus(null), 2000);
        } catch (e) {
            setAutosaveStatus(null);
            showToast("Autosave pipeline disconnected", "error");
        }
    };

    // Pre-create project submit
    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiCall("/projects/", {
                method: "POST",
                body: JSON.stringify(newProject),
            });
            showToast(`Created project "${newProject.name}"`, "success");
            setShowCreateModal(false);
            setNewProject({ 
                name: "", description: "", industry: "Technology", progress: 0, status: "Active",
                business_question: "", objectives: "", keywords: "", research_timeline: ""
            });
            fetchData();
        } catch (err: any) {
            showToast(err.message || "Failed to create project", "error");
        }
    };

    const handleUseTemplate = async (templateName: string, industry: string) => {
        try {
            await apiCall("/projects/", {
                method: "POST",
                body: JSON.stringify({
                    name: `${templateName} - ${new Date().getFullYear()}`,
                    description: `AI-assisted workspace spawned from the standard "${templateName}" template. Ready for source collection and report compilation.`,
                    industry,
                    progress: 10,
                    status: "Active",
                    business_question: `What are the critical success factors and growth parameters for ${templateName} in the modern market landscape?`,
                    objectives: "1. Gather major competitor parameters.\n2. Detail pricing and subscription grids.\n3. Formulate technology roadmap timelines.",
                    keywords: `${templateName.toLowerCase()}, market entry, strategy, business intelligence`,
                    research_timeline: "Q3 2026"
                }),
            });
            showToast(`Spawned project from template!`, "success");
            setActiveTab("projects");
            fetchData();
        } catch (err: any) {
            showToast("Failed to spawn project", "error");
        }
    };

    const handleToggleFavorite = async (id: number, currentVal: boolean) => {
        try {
            const updated = await apiCall(`/projects/${id}`, {
                method: "PUT",
                body: JSON.stringify({ is_favorite: !currentVal }),
            });
            setProjects(projects.map(p => p.id === id ? updated : p));
            if (activeProject?.id === id) {
                setActiveProject(updated);
            }
            showToast(updated.is_favorite ? "Added to favorites" : "Removed from favorites", "success");
        } catch (err: any) {
            showToast("Failed to update favorite status", "error");
        }
    };

    const handleRenameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProject) return;
        try {
            const updated = await apiCall(`/projects/${selectedProject.id}`, {
                method: "PUT",
                body: JSON.stringify({ name: renameName }),
            });
            setProjects(projects.map(p => p.id === selectedProject.id ? updated : p));
            if (activeProject?.id === selectedProject.id) {
                setActiveProject(updated);
            }
            showToast("Renamed project successfully", "success");
            setShowRenameModal(false);
            setSelectedProject(null);
            setRenameName("");
        } catch (err: any) {
            showToast("Failed to rename project", "error");
        }
    };

    const handleDuplicateProject = async (id: number) => {
        try {
            const duplicated = await apiCall(`/projects/${id}/duplicate`, {
                method: "POST"
            });
            setProjects([duplicated, ...projects]);
            setStats(prev => ({ ...prev, total_projects: prev.total_projects + 1 }));
            showToast(`Duplicated into "${duplicated.name}"`, "success");
        } catch (err: any) {
            showToast("Failed to duplicate project", "error");
        }
    };

    const handleArchiveProject = async (id: number, currentStatus: string) => {
        const nextStatus = currentStatus === "Archived" ? "Active" : "Archived";
        try {
            const updated = await apiCall(`/projects/${id}`, {
                method: "PUT",
                body: JSON.stringify({ status: nextStatus }),
            });
            setProjects(projects.map(p => p.id === id ? updated : p));
            if (activeProject?.id === id) {
                setActiveProject(updated);
            }
            showToast(nextStatus === "Archived" ? "Archived project" : "Restored project", "success");
        } catch (err: any) {
            showToast("Failed to alter project status", "error");
        }
    };

    const handleDeleteProject = async () => {
        if (!selectedProject) return;
        try {
            await apiCall(`/projects/${selectedProject.id}`, { method: "DELETE" });
            setProjects(projects.filter(p => p.id !== selectedProject.id));
            if (activeProject?.id === selectedProject.id) {
                setActiveProject(null);
            }
            setStats(prev => ({ ...prev, total_projects: prev.total_projects - 1 }));
            showToast("Deleted project", "success");
            setShowDeleteModal(false);
            setSelectedProject(null);
        } catch (err: any) {
            showToast("Failed to delete project", "error");
        }
    };

    const handleGenerateAiBrief = async () => {
        if (!activeProject) return;
        setWorkspaceSaving(true);
        try {
            const updated = await apiCall(`/projects/${activeProject.id}/brief/generate`, {
                method: "POST"
            });
            setActiveProject(updated);
            setProjects(projects.map(p => p.id === activeProject.id ? updated : p));
            showToast("Consulting-style Executive Brief synthesized!", "success");

            const parsedBrief = JSON.parse(updated.executive_brief || "{}");
            const newReport = {
                id: savedReports.length + 1,
                title: `${activeProject.name} Executive Brief`,
                project: activeProject.name,
                date: new Date().toISOString().split("T")[0],
                summary: parsedBrief.executive_summary || "Synthesized consulting brief outlining strategy."
            };
            setSavedReports([newReport, ...savedReports]);
            setStats(prev => ({ ...prev, reports_generated: prev.reports_generated + 1 }));

            setHistoryLogs(prev => [
                { id: prev.length + 1, action: "Synthesized executive brief using AI compiler", date: new Date().toISOString().replace("T", " ").substring(0, 16) },
                ...prev
            ]);
        } catch (err) {
            showToast("Failed to generate brief", "error");
        } finally {
            setWorkspaceSaving(false);
        }
    };

    const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileLoading(true);
        try {
            await updateProfile(profileName, profileAvatar || undefined, profilePassword || undefined);
            showToast("Profile settings updated successfully!", "success");
            setProfilePassword("");
        } catch (err: any) {
            showToast("Failed to update profile", "error");
        } finally {
            setProfileLoading(false);
        }
    };

    // Client-side search & filter logic for projects
    const filteredProjects = projects.filter((project) => {
        const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                             project.industry.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "All" || project.status === statusFilter;
        const matchesIndustry = industryFilter === "All" || project.industry === industryFilter;
        return matchesSearch && matchesStatus && matchesIndustry;
    });

    const favoriteProjects = filteredProjects.filter(p => p.is_favorite);
    const recentProjects = filteredProjects.slice(0, 3);
    const recentlyViewed = filteredProjects.slice(0, 4);

    const industries = ["All", "Technology", "Finance", "Energy", "Healthcare", "Retail", "Manufacturing"];
    const statuses = ["All", "Active", "Completed", "Archived"];

    // -------------------------------------------------------------
    // CLIENT SIDE SEARCH, FILTER, SORT FOR SOURCES
    // -------------------------------------------------------------
    const filteredSources = sources.filter((src) => {
        const matchesSearch = src.title.toLowerCase().includes(sourceSearch.toLowerCase()) ||
                             (src.content && src.content.toLowerCase().includes(sourceSearch.toLowerCase())) ||
                             (src.author && src.author.toLowerCase().includes(sourceSearch.toLowerCase())) ||
                             (src.tags && src.tags.toLowerCase().includes(sourceSearch.toLowerCase()));
        
        const matchesType = sourceTypeFilter === "All" || src.source_type === sourceTypeFilter;

        return matchesSearch && matchesType;
    });

    const sortedSources = [...filteredSources].sort((a, b) => {
        if (sourceSort === "date-desc") {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sourceSort === "date-asc") {
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        if (sourceSort === "credibility-desc") {
            return b.credibility_score - a.credibility_score;
        }
        if (sourceSort === "credibility-asc") {
            return a.credibility_score - b.credibility_score;
        }
        if (sourceSort === "title-asc") {
            return a.title.localeCompare(b.title);
        }
        return 0;
    });

    const groupedSources = sortedSources.reduce((groups: Record<string, SourceItem[]>, src) => {
        const cat = src.source_type;
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(src);
        return groups;
    }, {});

    // -------------------------------------------------------------
    // CLIENT SIDE SEARCH, FILTER FOR EVIDENCE DATABASE (TANSTACK TABLE)
    // -------------------------------------------------------------
    const customFilteredEvidence = React.useMemo(() => {
        return evidence.filter((ev) => {
            const matchesType = evidenceTypeFilter === "All" || ev.evidence_type === evidenceTypeFilter;
            const matchesPriority = evidencePriorityFilter === "All" || ev.priority === evidencePriorityFilter;
            const matchesConfidence = evidenceConfidenceFilter === "All" || ev.confidence_level === evidenceConfidenceFilter;
            
            const matchesSearch = globalFilter === "" || 
                ev.claim.toLowerCase().includes(globalFilter.toLowerCase()) ||
                (ev.supporting_evidence && ev.supporting_evidence.toLowerCase().includes(globalFilter.toLowerCase())) ||
                (ev.source && ev.source.toLowerCase().includes(globalFilter.toLowerCase()));

            return matchesType && matchesPriority && matchesConfidence && matchesSearch;
        });
    }, [evidence, evidenceTypeFilter, evidencePriorityFilter, evidenceConfidenceFilter, globalFilter]);

    // Define table columns
    const columns = React.useMemo<ColumnDef<EvidenceItem>[]>(() => [
        {
            accessorKey: "claim",
            header: "Claim",
            cell: info => <span className="font-semibold text-zinc-100">{info.getValue<string>()}</span>
        },
        {
            accessorKey: "supporting_evidence",
            header: "Supporting Evidence",
            cell: info => <span className="text-zinc-400 block max-w-[200px] truncate" title={info.getValue<string>()}>{info.getValue<string>()}</span>
        },
        {
            accessorKey: "source",
            header: "Source",
            cell: info => <span className="text-indigo-400 font-semibold truncate block max-w-[130px]">{info.getValue<string>()}</span>
        },
        {
            accessorKey: "publication_date",
            header: "Pub Date"
        },
        {
            accessorKey: "evidence_type",
            header: "Evidence Type",
            cell: info => {
                const val = info.getValue<string>();
                return (
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        val === "Metric" ? "bg-indigo-950/40 text-indigo-300 border border-indigo-900/40" :
                        val === "Quote" ? "bg-emerald-950/40 text-emerald-300 border border-emerald-900/40" :
                        val === "Trend" ? "bg-purple-950/40 text-purple-300 border border-purple-900/40" :
                        "bg-zinc-950/40 text-zinc-300 border border-zinc-900/40"
                    }`}>
                        {val}
                    </span>
                );
            }
        },
        {
            accessorKey: "confidence_level",
            header: "Confidence",
            cell: info => {
                const val = info.getValue<string>();
                return (
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        val === "High" ? "bg-emerald-500/10 text-emerald-450 border border-emerald-500/20" :
                        val === "Medium" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" :
                        "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}>
                        {val}
                    </span>
                );
            }
        },
        {
            accessorKey: "priority",
            header: "Priority",
            cell: info => {
                const val = info.getValue<string>();
                return (
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${
                        val === "Critical" ? "bg-red-500/15 text-red-400 border border-red-500/25" :
                        val === "High" ? "bg-orange-500/15 text-orange-400 border border-orange-500/25" :
                        val === "Medium" ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25" :
                        "bg-zinc-900 text-zinc-300 border border-zinc-800"
                    }`}>
                        {val}
                    </span>
                );
            }
        },
        {
            accessorKey: "business_impact",
            header: "Business Impact",
            cell: info => <span className="text-zinc-400 truncate block max-w-[120px]">{info.getValue<string>()}</span>
        },
        {
            accessorKey: "recommendation",
            header: "Recommendation",
            cell: info => <span className="text-zinc-400 truncate block max-w-[120px]">{info.getValue<string>()}</span>
        },
        {
            accessorKey: "risk",
            header: "Risk",
            cell: info => <span className="text-zinc-400 truncate block max-w-[120px]">{info.getValue<string>()}</span>
        }
    ], []);

    // TanStack Table Instance
    const table = useReactTable({
        data: customFilteredEvidence,
        columns,
        state: {
            sorting,
            columnVisibility,
            globalFilter
        },
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: 5
            }
        }
    });

    // Expand row details toggle
    const toggleRowExpanded = (rowId: number) => {
        setExpandedRows(prev => ({
            ...prev,
            [rowId]: !prev[rowId]
        }));
    };

    // Save newly created custom Evidence database row
    const handleAddEvidenceSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeProject) return;

        setWorkspaceSaving(true);
        try {
            const saved = await apiCall(`/projects/${activeProject.id}/evidence`, {
                method: "POST",
                body: JSON.stringify(newEvidence)
            });

            setEvidence([saved, ...evidence]);
            setShowAddEvidenceModal(false);
            setNewEvidence({
                claim: "",
                supporting_evidence: "",
                source: "",
                publication_date: "",
                evidence_type: "Metric",
                confidence_level: "High",
                business_impact: "",
                recommendation: "",
                risk: "",
                priority: "High"
            });
            showToast(`Added Evidence: ${saved.claim}`, "success");

            setHistoryLogs(prev => [
                { id: prev.length + 1, action: `Created custom evidence record: ${saved.claim}`, date: new Date().toISOString().replace("T", " ").substring(0, 16) },
                ...prev
            ]);
        } catch (err) {
            showToast("Failed to save evidence point", "error");
        } finally {
            setWorkspaceSaving(false);
        }
    };

    // Delete Evidence record from DB
    const handleDeleteEvidence = async (e: React.MouseEvent, evId: number) => {
        e.stopPropagation(); // Stop row expansion click
        if (!activeProject) return;

        try {
            await apiCall(`/projects/${activeProject.id}/evidence/${evId}`, { method: "DELETE" });
            setEvidence(evidence.filter(ev => ev.id !== evId));
            showToast("Evidence record deleted", "success");

            setHistoryLogs(prev => [
                { id: prev.length + 1, action: "Deleted evidence record from table", date: new Date().toISOString().replace("T", " ").substring(0, 16) },
                ...prev
            ]);
        } catch (err) {
            showToast("Failed to delete evidence", "error");
        }
    };

    // Export CSV utility
    const handleExportCSV = () => {
        const activeRows = table.getRowModel().rows.map(row => row.original);
        if (activeRows.length === 0) {
            showToast("No evidence rows to export", "error");
            return;
        }
        const headers = ["Claim", "Supporting Evidence", "Source", "Pub Date", "Evidence Type", "Confidence Level", "Priority", "Business Impact", "Recommendation", "Risk"];
        const csvRows = [
            headers.join(","),
            ...activeRows.map(row => [
                `"${(row.claim || "").replace(/"/g, '""')}"`,
                `"${(row.supporting_evidence || "").replace(/"/g, '""')}"`,
                `"${(row.source || "").replace(/"/g, '""')}"`,
                `"${(row.publication_date || "").replace(/"/g, '""')}"`,
                `"${row.evidence_type}"`,
                `"${row.confidence_level}"`,
                `"${row.priority}"`,
                `"${(row.business_impact || "").replace(/"/g, '""')}"`,
                `"${(row.recommendation || "").replace(/"/g, '""')}"`,
                `"${(row.risk || "").replace(/"/g, '""')}"`
            ].join(","))
        ];
        const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `inquira_evidence_${activeProject?.id}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("CSV file downloaded", "success");
    };

    // Export Excel utility
    const handleExportExcel = () => {
        const activeRows = table.getRowModel().rows.map(row => row.original);
        if (activeRows.length === 0) {
            showToast("No evidence rows to export", "error");
            return;
        }
        let excelContent = "<table><tr><th>Claim</th><th>Supporting Evidence</th><th>Source</th><th>Pub Date</th><th>Evidence Type</th><th>Confidence</th><th>Priority</th><th>Business Impact</th><th>Recommendation</th><th>Risk</th></tr>";
        activeRows.forEach(row => {
            excelContent += `<tr><td>${row.claim}</td><td>${row.supporting_evidence || ""}</td><td>${row.source || ""}</td><td>${row.publication_date || ""}</td><td>${row.evidence_type}</td><td>${row.confidence_level}</td><td>${row.priority}</td><td>${row.business_impact || ""}</td><td>${row.recommendation || ""}</td><td>${row.risk || ""}</td></tr>`;
        });
        excelContent += "</table>";
        const blob = new Blob([excelContent], { type: "application/vnd.ms-excel" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `inquira_evidence_${activeProject?.id}.xls`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("Excel Spreadsheet downloaded", "success");
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#030303] text-white flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <span className="text-sm font-medium text-zinc-400">Loading Inquira Workspace...</span>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#030303] overflow-x-hidden">
            {/* Sidebar */}
            <Sidebar 
                activeTab={activeTab} 
                setActiveTab={(tab) => { setActiveTab(tab); setActiveProject(null); }} 
                isOpen={sidebarOpen} 
                setIsOpen={setSidebarOpen} 
            />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col md:pl-64 min-w-0">
                {/* Header Navbar */}
                <header className="h-16 flex items-center justify-between px-6 md:px-8 border-b border-zinc-800/40 bg-zinc-950/40 backdrop-blur-md sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden p-2 rounded-lg text-zinc-455 hover:text-white hover:bg-zinc-900 transition-colors"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        
                        {activeProject ? (
                            <div className="flex items-center gap-2 text-xs md:text-sm font-medium">
                                <button 
                                    onClick={() => setActiveProject(null)}
                                    className="text-zinc-555 hover:text-indigo-400 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                    Projects
                                </button>
                                <span className="text-zinc-700">/</span>
                                <span className="text-zinc-200 font-semibold truncate max-w-xs">{activeProject.name} Workspace</span>
                            </div>
                        ) : (
                            <h2 className="text-sm font-bold text-white capitalize tracking-tight flex items-center gap-2">
                                {activeTab === "dashboard" && <LayoutDashboard className="w-4 h-4 text-indigo-400" />}
                                {activeTab === "projects" && <FolderKanban className="w-4 h-4 text-indigo-400" />}
                                {activeTab === "templates" && <FileSpreadsheet className="w-4 h-4 text-indigo-400" />}
                                {activeTab === "reports" && <FileText className="w-4 h-4 text-indigo-400" />}
                                {activeTab === "analytics" && <BarChart3 className="w-4 h-4 text-indigo-400" />}
                                {activeTab === "settings" && <SettingsIcon className="w-4 h-4 text-indigo-400" />}
                                {activeTab === "dashboard" ? "Workspace Hub" : activeTab}
                            </h2>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Global Search command menu trigger */}
                        <button
                            onClick={() => setShowSearchModal(true)}
                            className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-[#09090b]/40 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 text-xs transition-all cursor-pointer min-w-[170px] text-left"
                            title="Global command menu search (Ctrl + K)"
                        >
                            <Search className="w-3.5 h-3.5 text-zinc-550 shrink-0" />
                            <span className="truncate">Search (Ctrl+K)</span>
                        </button>

                        {/* Shortcuts Cheat Sheet Trigger */}
                        <button
                            onClick={() => setShowShortcutsModal(true)}
                            className="p-1.5 rounded-lg border border-zinc-850 hover:bg-zinc-900 hover:text-white text-zinc-400 transition-colors cursor-pointer"
                            title="Show keyboard shortcuts (?)"
                        >
                            <HelpCircle className="w-4 h-4 shrink-0" />
                        </button>

                        {activeProject ? (
                            <div className="flex items-center gap-2">
                                {/* Share Button */}
                                <button
                                    onClick={() => setShowShareModal(true)}
                                    className="px-2.5 py-1.5 rounded-lg border border-zinc-850 bg-indigo-600/10 hover:bg-indigo-650/20 text-indigo-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                                >
                                    <Share2 className="w-3.5 h-3.5 shrink-0" />
                                    <span className="hidden sm:inline">Share</span>
                                </button>

                                {/* Comments Drawer Toggle */}
                                <button
                                    onClick={() => setShowCommentsPanel(!showCommentsPanel)}
                                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                        showCommentsPanel 
                                            ? "bg-indigo-600/15 border-indigo-500 text-indigo-300" 
                                            : "border-zinc-850 hover:bg-zinc-900 text-zinc-400 hover:text-white"
                                    }`}
                                    title="Toggle Commentary Drawer"
                                >
                                    <MessageSquare className="w-4 h-4 shrink-0" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/10 cursor-pointer active:scale-95 transition-all"
                            >
                                <Plus className="w-3.5 h-3.5 shrink-0" />
                                New Research
                            </button>
                        )}
                    </div>
                </header>

                <div className="flex-1 relative overflow-y-auto min-w-0">
                    <div className="glow-spot top-10 right-20 animate-pulse-slow" style={{ opacity: 0.08 } as React.CSSProperties} />

                    <AnimatePresence mode="wait">
                        {/* ------------------------------------------------------------- */}
                        {/* DETAILED RESEARCH WORKSPACE MODE (Notion + NotebookLM Style) */}
                        {/* ------------------------------------------------------------- */}
                        {activeProject ? (
                            <motion.div
                                key="workspace"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden"
                            >
                                {/* Left Side Panel: NotebookLM Sources & Chat */}
                                <div className="w-full lg:w-80 border-r border-zinc-800/80 bg-zinc-950/30 flex flex-col justify-between shrink-0 h-1/2 lg:h-full">
                                    {/* NotebookLM: Source List */}
                                    <div className="p-4 border-b border-zinc-800/40 flex-1 flex flex-col min-h-0">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="text-[10px] uppercase font-bold text-zinc-400 tracking-wide flex items-center gap-1.5">
                                                <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
                                                Sources ({sources.length})
                                            </h4>
                                            <button 
                                                onClick={() => {
                                                    setSourceFormType("url");
                                                    setShowAddSourceModal(true);
                                                }}
                                                className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-[9px] font-semibold cursor-pointer"
                                            >
                                                + Add
                                            </button>
                                        </div>

                                        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                                            {sources.map((src) => {
                                                const Icon = getSourceTypeIcon(src.source_type);
                                                return (
                                                    <div 
                                                        key={src.id}
                                                        className="p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-850 text-xs relative group hover:border-zinc-700/50 transition-all"
                                                    >
                                                        <div className="flex justify-between items-start mb-1">
                                                            <div className="flex items-center gap-1.5 min-w-0 pr-12">
                                                                <Icon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                                                <span className="font-semibold text-zinc-200 truncate">{src.title}</span>
                                                            </div>
                                                            <div className="absolute right-1.5 top-1.5 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all">
                                                                <button 
                                                                    onClick={() => setSelectedInsightSource(src)}
                                                                    className="p-0.5 rounded hover:bg-zinc-800 text-indigo-400 cursor-pointer"
                                                                    title="View AI Analysis"
                                                                >
                                                                    <Sparkles className="w-3 h-3" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDeleteSource(src.id)}
                                                                    className="p-0.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-red-400 cursor-pointer"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <p 
                                                            className="text-[10px] text-zinc-450 line-clamp-3 leading-relaxed cursor-text select-text selection:bg-indigo-500/30"
                                                            onMouseUp={() => {
                                                                const sel = window.getSelection()?.toString();
                                                                if (sel && sel.trim().length > 10) {
                                                                    handleClipEvidence(src.title, sel);
                                                                }
                                                            }}
                                                        >
                                                            {src.content}
                                                        </p>
                                                        <div className="mt-2 flex justify-between items-center text-[8px] text-zinc-555">
                                                            <span>{src.source_type}</span>
                                                            <button 
                                                                onClick={() => setSelectedInsightSource(src)}
                                                                className="text-indigo-400 font-semibold hover:underline cursor-pointer"
                                                            >
                                                                AI Insights ({src.analysis_confidence || 95}%)
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* NotebookLM: AI Chat Panel */}
                                    <div className="p-4 border-t border-zinc-800/40 bg-zinc-950/60 h-1/2 flex flex-col min-h-0">
                                        <h4 className="text-[10px] uppercase font-bold text-zinc-400 tracking-wide mb-2 flex items-center gap-1.5 shrink-0">
                                            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                                            AI Chat Companion
                                        </h4>

                                        <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1 text-[11px] leading-relaxed">
                                            {chatMessages.map((msg, i) => (
                                                <div 
                                                    key={i} 
                                                    className={`p-2.5 rounded-xl border ${
                                                        msg.sender === "user" 
                                                            ? "bg-zinc-900 border-zinc-800 text-zinc-200 ml-6" 
                                                            : "bg-indigo-950/15 border-indigo-900/25 text-indigo-200 mr-6"
                                                    }`}
                                                >
                                                    <div className="font-semibold text-[9px] uppercase tracking-wide opacity-50 mb-0.5">
                                                        {msg.sender === "user" ? "You" : "Inquira AI"}
                                                    </div>
                                                    <div className="whitespace-pre-line">{msg.text}</div>
                                                </div>
                                            ))}
                                            {chatLoading && (
                                                <div className="bg-indigo-950/15 border border-indigo-900/25 p-2 rounded-xl text-indigo-200 mr-6 flex items-center gap-2">
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                                                    <span>Reading sources vectors...</span>
                                                </div>
                                            )}
                                            <div ref={chatEndRef} />
                                        </div>

                                        <div className="relative shrink-0">
                                            <input
                                                type="text"
                                                value={chatInput}
                                                onChange={(e) => setChatInput(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                                                placeholder="Ask a question about sources..."
                                                className="w-full pl-3 pr-9 py-2 glass-input text-xs"
                                                disabled={chatLoading}
                                            />
                                            <button 
                                                onClick={handleSendChat}
                                                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white cursor-pointer"
                                            >
                                                <Send className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side Panel: Notion-like tabbed Workspace */}
                                <div className="flex-1 flex flex-col h-1/2 lg:h-full overflow-hidden bg-black/10">
                                    {/* Workflow horizontal path */}
                                    <div className="p-4 border-b border-zinc-800/40 bg-zinc-950/20 shrink-0">
                                        <div className="max-w-3xl mx-auto flex items-center justify-between">
                                            {workflowSteps.map((step, idx) => {
                                                const currentStep = getWorkflowStep(activeProject.progress);
                                                const isCompleted = currentStep > idx;
                                                const isActive = currentStep === idx;
                                                return (
                                                    <React.Fragment key={idx}>
                                                        <button
                                                            onClick={() => handleWorkflowClick(idx)}
                                                            className="flex flex-col items-center gap-1.5 text-center focus:outline-none cursor-pointer group"
                                                        >
                                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                                                                isActive 
                                                                    ? "bg-indigo-650 border-indigo-500 text-white shadow-md shadow-indigo-600/30" 
                                                                    : isCompleted 
                                                                        ? "bg-indigo-950/40 border-indigo-900 text-indigo-300"
                                                                        : "bg-zinc-900 border-zinc-800 text-zinc-500 group-hover:border-zinc-700"
                                                            }`}>
                                                                {idx + 1}
                                                            </div>
                                                            <span className={`text-[10px] font-medium tracking-tight ${
                                                                isActive ? "text-indigo-400 font-semibold" : isCompleted ? "text-zinc-300" : "text-zinc-500"
                                                            }`}>
                                                                {step.label}
                                                            </span>
                                                        </button>
                                                        {idx < workflowSteps.length - 1 && (
                                                            <div className={`flex-1 h-[1px] mx-2 border-t-2 border-dashed transition-colors ${
                                                                isCompleted ? "border-indigo-955" : "border-zinc-905"
                                                            }`} />
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Tabs bar */}
                                    <div className="px-6 border-b border-zinc-800/40 flex items-center justify-between shrink-0 bg-zinc-950/10 h-12">
                                        <div className="flex gap-2 overflow-x-auto">
                                            {[
                                                { id: "overview", label: "Overview", icon: FolderKanban },
                                                { id: "sources", label: "Sources", icon: Bookmark },
                                                { id: "evidence", label: "Evidence", icon: CheckSquare },
                                                { id: "brief", label: "Brief", icon: FileText },
                                                { id: "plan", label: "Action Plan", icon: CheckSquare },
                                                { id: "presentation", label: "Presentation", icon: PresIcon },
                                                { id: "history", label: "History", icon: HistoryIcon }
                                            ].map((tab) => {
                                                const Icon = tab.icon;
                                                const isSel = workspaceTab === tab.id;
                                                return (
                                                    <button
                                                        key={tab.id}
                                                        onClick={() => setWorkspaceTab(tab.id as any)}
                                                        className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                                                            isSel 
                                                                ? "bg-zinc-800/60 border border-zinc-700 text-white" 
                                                                : "text-zinc-450 hover:text-zinc-200"
                                                        }`}
                                                    >
                                                        <Icon className="w-3.5 h-3.5" />
                                                        {tab.label}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <div className="text-[10px] text-zinc-550 flex items-center gap-1.5">
                                            {workspaceSaving ? (
                                                <>
                                                    <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                                                    <span>Saving workspace...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle className="w-3 h-3 text-indigo-500/70" />
                                                    <span>Workspace Synced</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Tab View Panels */}
                                    <div className="flex-1 overflow-y-auto p-6 md:p-8">
                                        <div className="max-w-none min-h-full">
                                            
                                            {/* WORKSPACE: OVERVIEW TAB */}
                                            {workspaceTab === "overview" && (
                                                <form onSubmit={handleSaveWorkspaceOverview} className="max-w-3xl mx-auto space-y-6">
                                                    <div className="space-y-2 border-b border-zinc-900 pb-5">
                                                        <label className="text-[10px] uppercase font-bold text-zinc-455 tracking-wider">Research Title</label>
                                                        <input 
                                                            type="text"
                                                            value={editFields.name}
                                                            onChange={(e) => setEditFields({ ...editFields, name: e.target.value })}
                                                            onBlur={() => handleTriggerAutosave(editFields)}
                                                            className="w-full text-2xl font-bold bg-transparent text-white border-b border-transparent focus:border-indigo-500 focus:outline-none pb-1"
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="space-y-1.5">
                                                            <label className="text-[9px] uppercase font-bold text-zinc-455 tracking-wider">Industry</label>
                                                            <select 
                                                                value={editFields.industry}
                                                                onChange={(e) => { const updated = { ...editFields, industry: e.target.value }; setEditFields(updated); handleTriggerAutosave(updated); }}
                                                                className="w-full px-3 py-2 glass-panel border border-zinc-800 rounded-lg text-zinc-200 text-xs bg-zinc-950 focus:outline-none"
                                                            >
                                                                {industries.filter(i => i !== "All").map(i => (
                                                                    <option key={i} value={i}>{i}</option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        <div className="space-y-1.5">
                                                            <label className="text-[9px] uppercase font-bold text-zinc-455 tracking-wider">Status</label>
                                                            <select 
                                                                value={editFields.status}
                                                                onChange={(e) => { const updated = { ...editFields, status: e.target.value }; setEditFields(updated); handleTriggerAutosave(updated); }}
                                                                className="w-full px-3 py-2 glass-panel border border-zinc-800 rounded-lg text-zinc-200 text-xs bg-zinc-950 focus:outline-none"
                                                            >
                                                                <option value="Active">Active</option>
                                                                <option value="Completed">Completed</option>
                                                                <option value="Archived">Archived</option>
                                                            </select>
                                                        </div>

                                                        <div className="space-y-1.5">
                                                            <label className="text-[9px] uppercase font-bold text-zinc-455 tracking-wider">Research Timeline</label>
                                                            <input 
                                                                type="text"
                                                                value={editFields.research_timeline}
                                                                onChange={(e) => setEditFields({ ...editFields, research_timeline: e.target.value })}
                                                                onBlur={() => handleTriggerAutosave(editFields)}
                                                                placeholder="e.g. Q3 2026 or July 2026"
                                                                className="w-full px-3 py-2 glass-input text-xs"
                                                            />
                                                        </div>

                                                        <div className="space-y-1.5">
                                                            <label className="text-[9px] uppercase font-bold text-zinc-455 tracking-wider">Keywords</label>
                                                            <input 
                                                                type="text"
                                                                value={editFields.keywords}
                                                                onChange={(e) => setEditFields({ ...editFields, keywords: e.target.value })}
                                                                onBlur={() => handleTriggerAutosave(editFields)}
                                                                placeholder="SaaS, vector-db, response speeds"
                                                                className="w-full px-3 py-2 glass-input text-xs"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <label className="text-[9px] uppercase font-bold text-zinc-455 tracking-wider">Business Question</label>
                                                        <textarea 
                                                            value={editFields.business_question}
                                                            onChange={(e) => setEditFields({ ...editFields, business_question: e.target.value })}
                                                            onBlur={() => handleTriggerAutosave(editFields)} placeholder="What are we trying to solve?"
                                                            rows={3}
                                                            className="w-full px-3 py-2 glass-input text-xs resize-none"
                                                        />
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <label className="text-[9px] uppercase font-bold text-zinc-455 tracking-wider">Research Objectives</label>
                                                        <textarea 
                                                            value={editFields.objectives}
                                                            onChange={(e) => setEditFields({ ...editFields, objectives: e.target.value })}
                                                            onBlur={() => handleTriggerAutosave(editFields)} placeholder="Detail project parameters (objectives)..."
                                                            rows={4}
                                                            className="w-full px-3 py-2 glass-input text-xs resize-none"
                                                        />
                                                    </div>

                                                    <div className="pt-4 flex justify-end">
                                                        <button 
                                                            type="submit"
                                                            disabled={workspaceSaving}
                                                            className="px-4 py-2 rounded-lg bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-semibold cursor-pointer active:scale-95 transition-all"
                                                        >
                                                            Save Changes
                                                        </button>
                                                    </div>
                                                </form>
                                            )}

                                            {/* WORKSPACE: SOURCES LIBRARY TAB */}
                                            {workspaceTab === "sources" && (
                                                <div className="max-w-3xl mx-auto space-y-6">
                                                    {/* Custom Toolbar */}
                                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl glass-panel border-zinc-800">
                                                        <div className="relative w-full sm:max-w-xs">
                                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-550">
                                                                <Search className="w-3.5 h-3.5" />
                                                            </span>
                                                            <input 
                                                                type="text"
                                                                value={sourceSearch}
                                                                onChange={(e) => setSourceSearch(e.target.value)}
                                                                placeholder="Search sources library..."
                                                                className="w-full pl-9 pr-4 py-1.5 glass-input text-xs"
                                                            />
                                                        </div>

                                                        <div className="flex items-center gap-3.5 w-full sm:w-auto text-xs">
                                                            <select 
                                                                value={sourceTypeFilter}
                                                                onChange={(e) => setSourceTypeFilter(e.target.value)}
                                                                className="px-2.5 py-1.5 rounded-md glass-panel border border-zinc-800 text-zinc-300 bg-zinc-950 focus:outline-none cursor-pointer"
                                                            >
                                                                <option value="All">All Types</option>
                                                                <option value="PDF Upload">PDF Documents</option>
                                                                <option value="Website URL">Websites</option>
                                                                <option value="Research Paper">Research Papers</option>
                                                                <option value="YouTube Transcript">YouTube transcripts</option>
                                                                <option value="Google Drive">Google Drive</option>
                                                                <option value="Manual Notes">Manual Notes</option>
                                                            </select>

                                                            <select 
                                                                value={sourceSort}
                                                                onChange={(e) => setSourceSort(e.target.value)}
                                                                className="px-2.5 py-1.5 rounded-md glass-panel border border-zinc-800 text-zinc-300 bg-zinc-950 focus:outline-none cursor-pointer"
                                                            >
                                                                <option value="date-desc">Newest Ingested</option>
                                                                <option value="date-asc">Oldest Ingested</option>
                                                                <option value="credibility-desc">Credibility: High</option>
                                                                <option value="credibility-asc">Credibility: Low</option>
                                                                <option value="title-asc">Title: A-Z</option>
                                                            </select>

                                                            <label className="flex items-center gap-1.5 font-medium text-zinc-400 cursor-pointer select-none">
                                                                <input 
                                                                    type="checkbox"
                                                                    checked={sourceGroupByCat}
                                                                    onChange={(e) => setSourceGroupByCat(e.target.checked)}
                                                                    className="rounded bg-zinc-900 border-zinc-800 text-indigo-650 focus:ring-0 cursor-pointer"
                                                                />
                                                                <span>Group</span>
                                                            </label>

                                                            <button 
                                                                onClick={() => {
                                                                    setSourceFormType("url");
                                                                    setShowAddSourceModal(true);
                                                                }}
                                                                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer shrink-0 transition-colors"
                                                            >
                                                                + Ingest Source
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Source Library Grid */}
                                                    {sortedSources.length === 0 ? (
                                                        <div className="glass-panel border-dashed border-zinc-800 rounded-xl p-16 text-center text-zinc-550 text-xs space-y-4">
                                                            <Bookmark className="w-10 h-10 text-zinc-700 mx-auto animate-bounce" />
                                                            <p>No source documents matching criteria found in this platform library.</p>
                                                        </div>
                                                    ) : sourceGroupByCat ? (
                                                        <div className="space-y-8">
                                                            {Object.keys(groupedSources).map((category) => (
                                                                <div key={category} className="space-y-3">
                                                                    <h4 className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1.5 border-b border-zinc-900 pb-2">
                                                                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                                                                        {category}s ({groupedSources[category].length})
                                                                    </h4>
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                        {groupedSources[category].map(src => (
                                                                            <SourceCard 
                                                                                key={src.id} 
                                                                                src={src} 
                                                                                onToggleFavorite={handleToggleFavoriteSource}
                                                                                onDelete={handleDeleteSource}
                                                                                onOpenInsights={(s) => setSelectedInsightSource(s)}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                            {sortedSources.map(src => (
                                                                <SourceCard 
                                                                    key={src.id} 
                                                                    src={src} 
                                                                    onToggleFavorite={handleToggleFavoriteSource}
                                                                    onDelete={handleDeleteSource}
                                                                    onOpenInsights={(s) => setSelectedInsightSource(s)}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* WORKSPACE: INTERACTIVE EVIDENCE DATABASE (Airtable TanStack Grid) */}
                                            {workspaceTab === "evidence" && (
                                                <div className="space-y-4">
                                                    {/* Airtable-like Top Controls Header Bar */}
                                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl glass-panel border-zinc-800 bg-[#0b0b0d]/90 text-xs">
                                                        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                                                            {/* Search */}
                                                            <div className="relative">
                                                                <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-zinc-555">
                                                                    <Search className="w-3.5 h-3.5" />
                                                                </span>
                                                                <input
                                                                    type="text"
                                                                    value={globalFilter}
                                                                    onChange={e => setGlobalFilter(e.target.value)}
                                                                    placeholder="Search grid claims..."
                                                                    className="pl-8 pr-3 py-1.5 w-44 rounded-lg bg-zinc-950 border border-zinc-850 focus:border-indigo-500 focus:outline-none text-[11px]"
                                                                />
                                                            </div>

                                                            {/* Evidence Type Filter */}
                                                            <select
                                                                value={evidenceTypeFilter}
                                                                onChange={e => setEvidenceTypeFilter(e.target.value)}
                                                                className="px-2 py-1.5 rounded-lg bg-zinc-950 border border-zinc-850 text-zinc-350 focus:outline-none cursor-pointer text-[11px]"
                                                            >
                                                                <option value="All">All Types</option>
                                                                <option value="Metric">Metric</option>
                                                                <option value="Quote">Quote</option>
                                                                <option value="Trend">Trend</option>
                                                                <option value="Stat">Stat</option>
                                                            </select>

                                                            {/* Priority Filter */}
                                                            <select
                                                                value={evidencePriorityFilter}
                                                                onChange={e => setEvidencePriorityFilter(e.target.value)}
                                                                className="px-2 py-1.5 rounded-lg bg-zinc-950 border border-zinc-850 text-zinc-350 focus:outline-none cursor-pointer text-[11px]"
                                                            >
                                                                <option value="All">All Priorities</option>
                                                                <option value="Critical">Critical</option>
                                                                <option value="High">High</option>
                                                                <option value="Medium">Medium</option>
                                                                <option value="Low">Low</option>
                                                            </select>

                                                            {/* Column Visibility Selector Drawer */}
                                                            <div className="relative group">
                                                                <button className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-850 text-zinc-350 hover:text-white cursor-pointer flex items-center gap-1">
                                                                    <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                                                                    Columns <ChevronDown className="w-3 h-3 text-zinc-550" />
                                                                </button>
                                                                <div className="absolute left-0 mt-2 w-48 rounded-xl bg-[#09090b] border border-zinc-800 p-2 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-30 space-y-1">
                                                                    <div className="px-2 py-1 border-b border-zinc-900 mb-1">
                                                                        <span className="text-[9px] uppercase font-bold text-zinc-500">Show/Hide Columns</span>
                                                                    </div>
                                                                    {table.getAllLeafColumns().map(column => (
                                                                        <label key={column.id} className="flex items-center gap-2 px-2.5 py-1 hover:bg-zinc-900 rounded-md text-[11px] text-zinc-300 cursor-pointer select-none">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={column.getIsVisible()}
                                                                                onChange={column.getToggleVisibilityHandler()}
                                                                                className="rounded bg-zinc-950 border-zinc-800 text-indigo-650 focus:ring-0 cursor-pointer"
                                                                            />
                                                                            <span className="capitalize">{column.id.replace("_", " ")}</span>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Export & Add Options */}
                                                        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 justify-end">
                                                            <button
                                                                onClick={handleExportCSV}
                                                                className="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-zinc-350 hover:text-white cursor-pointer flex items-center gap-1 transition-colors text-[11px]"
                                                            >
                                                                <Download className="w-3.5 h-3.5 text-emerald-450" /> CSV
                                                            </button>
                                                            <button
                                                                onClick={handleExportExcel}
                                                                className="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-zinc-350 hover:text-white cursor-pointer flex items-center gap-1 transition-colors text-[11px]"
                                                            >
                                                                <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" /> Excel
                                                            </button>
                                                            <button
                                                                onClick={() => setShowAddEvidenceModal(true)}
                                                                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer flex items-center gap-1 transition-colors text-[11px]"
                                                            >
                                                                <Plus className="w-3.5 h-3.5" /> Add Row
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Airtable-like TanStack Grid Table Wrapper */}
                                                    <div className="glass-panel border-zinc-850 rounded-xl overflow-hidden bg-zinc-950/20 shadow-2xl">
                                                        <div className="overflow-x-auto">
                                                            <table className="w-full border-collapse text-left text-xs">
                                                                <thead>
                                                                    {table.getHeaderGroups().map(headerGroup => (
                                                                        <tr key={headerGroup.id} className="border-b border-zinc-800 bg-[#09090b]/80"><th className="p-3 w-8 border-r border-zinc-850/60"></th>{headerGroup.headers.map(header => (
                                                                                <th 
                                                                                    key={header.id} 
                                                                                    onClick={header.column.getToggleSortingHandler()}
                                                                                    className="p-3 font-bold uppercase tracking-wider text-[10px] text-zinc-450 border-r border-zinc-850/60 cursor-pointer select-none hover:text-white hover:bg-zinc-900/40 transition-all"
                                                                                >
                                                                                    <div className="flex items-center gap-1.5">
                                                                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                                                                        {header.column.getIsSorted() ? (
                                                                                            header.column.getIsSorted() === "desc" ? <ArrowUpDown className="w-3 h-3 text-indigo-400" /> : <ArrowUpDown className="w-3 h-3 text-indigo-400" />
                                                                                        ) : (
                                                                                            <ArrowUpDown className="w-3 h-3 text-zinc-700 opacity-0 hover:opacity-100" />
                                                                                        )}
                                                                                    </div>
                                                                                </th>
                                                                            ))}<th className="p-3 w-16 text-center text-zinc-455">Action</th></tr>
                                                                    ))}
                                                                </thead>
                                                                <tbody className="divide-y divide-zinc-900">
                                                                    {table.getRowModel().rows.map(row => (
                                                                        <React.Fragment key={row.id}>
                                                                            <tr 
                                                                                onClick={() => toggleRowExpanded(row.original.id)}
                                                                                className={`hover:bg-zinc-900/30 transition-colors cursor-pointer border-b border-zinc-900/60 ${
                                                                                    expandedRows[row.original.id] ? "bg-zinc-900/10" : ""
                                                                                }`}
                                                                            ><td className="p-3 border-r border-zinc-900 text-center text-zinc-550">{expandedRows[row.original.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}</td>{row.getVisibleCells().map(cell => (
                                                                                    <td key={cell.id} className="p-3 border-r border-zinc-900 max-w-sm truncate text-zinc-300">
                                                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                                                    </td>
                                                                                ))}<td className="p-3 text-center border-zinc-900">
                                                                                    <button
                                                                                        onClick={(e) => handleDeleteEvidence(e, row.original.id)}
                                                                                        className="p-1 rounded hover:bg-red-950/20 text-zinc-550 hover:text-red-400 transition-colors cursor-pointer"
                                                                                        title="Delete Evidence"
                                                                                    >
                                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                                    </button>
                                                                                </td></tr>
                                                                            {expandedRows[row.original.id] && (
                                                                                <tr className="bg-[#070709]/75 border-b border-zinc-900"><td colSpan={table.getVisibleLeafColumns().length + 2} className="p-5">
                                                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
                                                                                            <div className="p-3.5 rounded-lg bg-zinc-950/40 border border-zinc-900 space-y-1">
                                                                                                <span className="text-[9px] uppercase font-bold text-zinc-500 block">Supporting Text Detail</span>
                                                                                                <p className="text-zinc-200 leading-relaxed italic">
                                                                                                    "{row.original.supporting_evidence || "No quote context saved."}"
                                                                                                </p>
                                                                                            </div>
                                                                                            <div className="p-3.5 rounded-lg bg-zinc-950/40 border border-zinc-900 space-y-1">
                                                                                                <span className="text-[9px] uppercase font-bold text-zinc-500 block">Business Impact &amp; Strategy</span>
                                                                                                <p className="text-zinc-200 leading-relaxed">
                                                                                                    {row.original.business_impact || "No impact analysis documented yet."}
                                                                                                </p>
                                                                                            </div>
                                                                                            <div className="p-3.5 rounded-lg bg-zinc-955/40 border border-zinc-900 space-y-2">
                                                                                                <div>
                                                                                                    <span className="text-[9px] uppercase font-bold text-zinc-500 block">Recommendation</span>
                                                                                                    <p className="text-zinc-200 leading-relaxed">{row.original.recommendation || "No recommendation listed."}</p>
                                                                                                </div>
                                                                                                <div className="pt-2 border-t border-zinc-900/60">
                                                                                                    <span className="text-[9px] uppercase font-bold text-zinc-500 block">Risks &amp; Uncertainties</span>
                                                                                                    <p className="text-red-300 leading-relaxed">{row.original.risk || "No risks flagged."}</p>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td></tr>
                                                                            )}
                                                                        </React.Fragment>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>

                                                        {/* Pagination Navigation */}
                                                        <div className="px-4 py-3 border-t border-zinc-900 bg-[#09090b]/85 flex items-center justify-between gap-4 text-zinc-400 text-xs">
                                                            <div className="flex items-center gap-1">
                                                                <span>Rows per page:</span>
                                                                <select
                                                                    value={table.getState().pagination.pageSize}
                                                                    onChange={e => table.setPageSize(Number(e.target.value))}
                                                                    className="px-1.5 py-1 rounded bg-zinc-950 border border-zinc-800 text-zinc-300 focus:outline-none cursor-pointer"
                                                                >
                                                                    {[5, 10, 20, 50].map(sz => (
                                                                        <option key={sz} value={sz}>{sz}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <span>
                                                                    Page **{table.getState().pagination.pageIndex + 1}** of **{table.getPageCount()}**
                                                                </span>
                                                                <div className="flex items-center gap-1.5">
                                                                    <button
                                                                        onClick={() => table.previousPage()}
                                                                        disabled={!table.getCanPreviousPage()}
                                                                        className="px-2 py-1 rounded border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 text-xs disabled:opacity-40 disabled:hover:border-zinc-800 cursor-pointer"
                                                                    >
                                                                        Prev
                                                                    </button>
                                                                    <button
                                                                        onClick={() => table.nextPage()}
                                                                        disabled={!table.getCanNextPage()}
                                                                        className="px-2 py-1 rounded border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 text-xs disabled:opacity-40 disabled:hover:border-zinc-700 cursor-pointer"
                                                                    >
                                                                        Next
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* WORKSPACE: BRIEF TAB */}
                                            {workspaceTab === "brief" && (() => {
                                                const briefData = activeProject.executive_brief ? (() => {
                                                    try {
                                                        return JSON.parse(activeProject.executive_brief);
                                                    } catch(e) {
                                                        return null;
                                                    }
                                                })() : null;

                                                const renderTextWithCitations = (text: string) => {
                                                    const regex = /\[([^\]]+)\]/g;
                                                    const parts = [];
                                                    let lastIndex = 0;
                                                    let match;

                                                    while ((match = regex.exec(text)) !== null) {
                                                        if (match.index > lastIndex) {
                                                            parts.push(text.substring(lastIndex, match.index));
                                                        }
                                                        const citationLabel = match[1];
                                                        const srcTitle = citationLabel.split(",")[0].trim();
                                                        parts.push(
                                                            <span 
                                                                key={match.index}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const matched = sources.find(s => s.title.toLowerCase() === srcTitle.toLowerCase() || s.title.toLowerCase().includes(srcTitle.toLowerCase()) || srcTitle.toLowerCase().includes(s.title.toLowerCase()));
                                                                    if (matched) {
                                                                        setSelectedInsightSource(matched);
                                                                        showToast(`Opening AI Insights for: ${matched.title}`, "success");
                                                                    } else {
                                                                        showToast(`Source citation: ${citationLabel}`, "success");
                                                                    }
                                                                }}
                                                                className="ml-1 px-1.5 py-0.5 rounded bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-900/30 text-indigo-300 text-[10px] font-bold cursor-pointer inline-flex items-center gap-0.5 select-none transition-all active:scale-95"
                                                                title="View Ingested Source File"
                                                            >
                                                                <BookOpen className="w-2.5 h-2.5" />
                                                                {srcTitle}
                                                            </span>
                                                        );
                                                        lastIndex = regex.lastIndex;
                                                    }

                                                    if (lastIndex < text.length) {
                                                        parts.push(text.substring(lastIndex));
                                                    }

                                                    return parts.length > 0 ? parts : text;
                                                };

                                                return (
                                                    <div className="max-w-5xl mx-auto space-y-6">
                                                        {/* Header controls */}
                                                        <div className="flex justify-between items-center bg-[#09090b]/40 p-4 rounded-xl border border-zinc-850">
                                                            <div className="space-y-0.5">
                                                                <h3 className="text-xs font-bold text-white uppercase tracking-wider">AI Brief Workspace</h3>
                                                                <p className="text-[10px] text-zinc-555">Consulting-grade research brief generator.</p>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                {briefData && (
                                                                    <>
                                                                        <button 
                                                                            onClick={() => {
                                                                                window.print();
                                                                            }}
                                                                            className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-355 hover:text-white text-xs font-semibold cursor-pointer transition-all active:scale-95"
                                                                        >
                                                                            Export PDF
                                                                        </button>
                                                                        <button 
                                                                            onClick={handleExportDocx}
                                                                            className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-355 hover:text-white text-xs font-semibold cursor-pointer transition-all active:scale-95"
                                                                            title="Download Word Document (.doc)"
                                                                        >
                                                                            Export DOCX
                                                                        </button>
                                                                    </>
                                                                )}
                                                                <button 
                                                                    onClick={handleGenerateAiBrief}
                                                                    disabled={workspaceSaving}
                                                                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer disabled:opacity-50 flex items-center gap-1.5 active:scale-95 transition-all"
                                                                >
                                                                    {workspaceSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                                                    {briefData ? "Re-Synthesize Brief" : "Synthesize Executive Brief"}
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {briefData ? (
                                                            <div className="flex flex-col lg:flex-row gap-8 items-start">
                                                                {/* Left Sticky Outline Navigation Index */}
                                                                <div className="w-full lg:w-48 sticky top-24 space-y-2 shrink-0 bg-zinc-950/20 p-3 rounded-xl border border-zinc-900 hidden lg:block text-[11px]">
                                                                    <span className="text-[9px] uppercase font-bold text-zinc-500 block mb-2 px-1">Brief Chapters</span>
                                                                    {[
                                                                        { id: "sec-summary", label: "1. Executive Summary" },
                                                                        { id: "sec-context", label: "2. Scope & Objectives" },
                                                                        { id: "sec-findings", label: "3. Findings & Trends" },
                                                                        { id: "sec-opps", label: "4. Opportunities & Callouts" },
                                                                        { id: "sec-risks", label: "5. Risk Assessment" },
                                                                        { id: "sec-recs", label: "6. Strategy Board" }
                                                                    ].map(chapter => (
                                                                        <button
                                                                            key={chapter.id}
                                                                            onClick={() => {
                                                                                document.getElementById(chapter.id)?.scrollIntoView({ behavior: "smooth" });
                                                                            }}
                                                                            className="w-full text-left px-2 py-1 rounded text-zinc-450 hover:text-white hover:bg-zinc-900 transition-colors block cursor-pointer"
                                                                        >
                                                                            {chapter.label}
                                                                        </button>
                                                                    ))}
                                                                </div>

                                                                {/* Right Report Canvas */}
                                                                <div className="flex-1 space-y-8 bg-[#09090b]/55 border border-zinc-850 p-6 md:p-8 rounded-2xl shadow-2xl text-xs leading-relaxed text-zinc-300 max-w-3xl">
                                                                    
                                                                    {/* Chapter 1: Executive Summary */}
                                                                    <section id="sec-summary" className="space-y-3 scroll-mt-24 border-b border-zinc-900/60 pb-6">
                                                                        <h2 className="text-xs font-bold text-white tracking-wider border-l-2 border-indigo-500 pl-3 uppercase">
                                                                            1. Executive Summary
                                                                        </h2>
                                                                        <p className="text-zinc-200 bg-zinc-900/30 p-4 rounded-xl border border-zinc-900 italic font-medium leading-relaxed">
                                                                            {briefData.executive_summary}
                                                                        </p>
                                                                    </section>

                                                                    {/* Chapter 2: Business Context & Objectives */}
                                                                    <section id="sec-context" className="space-y-4 scroll-mt-24 border-b border-zinc-900/60 pb-6">
                                                                        <h2 className="text-xs font-bold text-white tracking-wider border-l-2 border-indigo-500 pl-3 uppercase">
                                                                            2. Scope &amp; Objectives
                                                                        </h2>
                                                                        <div className="space-y-3">
                                                                            <div>
                                                                                <span className="text-[10px] uppercase font-bold text-zinc-555 block mb-1">Inquiry Core</span>
                                                                                <p className="text-zinc-350">{briefData.business_context}</p>
                                                                            </div>
                                                                            <div className="pt-2">
                                                                                <span className="text-[10px] uppercase font-bold text-zinc-555 block mb-1">Target Objectives</span>
                                                                                <p className="text-zinc-350 whitespace-pre-line leading-relaxed">
                                                                                    {briefData.research_objectives}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </section>

                                                                    {/* Chapter 3: Major Findings & Industry Trends */}
                                                                    <section id="sec-findings" className="space-y-4 scroll-mt-24 border-b border-zinc-900/60 pb-6">
                                                                        <h2 className="text-xs font-bold text-white tracking-wider border-l-2 border-indigo-500 pl-3 uppercase">
                                                                            3. Findings &amp; Trends
                                                                        </h2>
                                                                        <div className="space-y-4">
                                                                            <div className="space-y-2">
                                                                                <span className="text-[10px] uppercase font-bold text-zinc-555 block">Synthesized Findings</span>
                                                                                {briefData.major_findings?.map((item: string, i: number) => (
                                                                                    <div key={i} className="flex gap-2.5 p-2 rounded-lg bg-zinc-900/10 border border-zinc-900/60 text-zinc-300">
                                                                                        <span className="text-indigo-400 font-bold shrink-0">{i+1}.</span>
                                                                                        <span>{renderTextWithCitations(item)}</span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                            <div className="space-y-2 pt-2">
                                                                                <span className="text-[10px] uppercase font-bold text-zinc-555 block">Macro Industry Trends</span>
                                                                                {briefData.industry_trends?.map((item: string, i: number) => (
                                                                                    <div key={i} className="flex gap-2.5 p-2 rounded-lg bg-zinc-900/10 border border-zinc-900/60 text-zinc-300">
                                                                                        <span className="text-indigo-400 font-bold shrink-0">{i+1}.</span>
                                                                                        <span>{renderTextWithCitations(item)}</span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    </section>

                                                                    {/* Chapter 4: Opportunities & Callouts */}
                                                                    <section id="sec-opps" className="space-y-5 scroll-mt-24 border-b border-zinc-900/60 pb-6">
                                                                        <h2 className="text-xs font-bold text-white tracking-wider border-l-2 border-indigo-500 pl-3 uppercase">
                                                                            4. Opportunities &amp; Callouts
                                                                        </h2>
                                                                        
                                                                        {/* Callouts Grid */}
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                            {/* High Impact Finding Callout */}
                                                                            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/20 to-black/80 border border-emerald-500/20 space-y-2">
                                                                                <div className="flex items-center gap-1.5 text-emerald-450 font-semibold uppercase tracking-wider text-[9px]">
                                                                                    <Sparkles className="w-3.5 h-3.5 animate-pulse" /> High Impact Finding
                                                                                </div>
                                                                                <p className="text-zinc-300 text-[11px] leading-relaxed">
                                                                                    {briefData.high_impact_findings?.[0] ? renderTextWithCitations(briefData.high_impact_findings[0]) : "No core impact metric logged yet."}
                                                                                </p>
                                                                            </div>

                                                                            {/* Strategic Opportunities Callout */}
                                                                            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/20 to-black/80 border border-indigo-500/20 space-y-2">
                                                                                <div className="flex items-center gap-1.5 text-indigo-400 font-semibold uppercase tracking-wider text-[9px]">
                                                                                    <Compass className="w-3.5 h-3.5" /> Strategic Opportunities
                                                                                </div>
                                                                                <p className="text-zinc-300 text-[11px] leading-relaxed">
                                                                                    {briefData.strategic_opportunities?.[0] || "Coordinate local workspace nodes to maximize user coordination speeds."}
                                                                                </p>
                                                                            </div>
                                                                        </div>

                                                                        <div className="space-y-2">
                                                                            <span className="text-[10px] uppercase font-bold text-zinc-555 block">Immediate Value Add Paths</span>
                                                                            {briefData.opportunities?.map((item: string, i: number) => (
                                                                                <div key={i} className="flex gap-2.5 p-2 rounded-lg bg-zinc-900/10 border border-zinc-900/60 text-zinc-300">
                                                                                    <span className="text-emerald-450 font-bold shrink-0">{i+1}.</span>
                                                                                    <span>{renderTextWithCitations(item)}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </section>

                                                                    {/* Chapter 5: Risks Assessment */}
                                                                    <section id="sec-risks" className="space-y-5 scroll-mt-24 border-b border-zinc-900/60 pb-6">
                                                                        <h2 className="text-xs font-bold text-white tracking-wider border-l-2 border-indigo-500 pl-3 uppercase">
                                                                            5. Risk Assessment
                                                                        </h2>
                                                                        
                                                                        {/* Critical Risk Callout */}
                                                                        <div className="p-4 rounded-xl bg-gradient-to-br from-red-955/20 to-black/85 border border-red-500/20 space-y-2">
                                                                            <div className="flex items-center gap-1.5 text-red-400 font-semibold uppercase tracking-wider text-[9px]">
                                                                                <AlertCircle className="w-3.5 h-3.5" /> Critical Risks Flagged
                                                                            </div>
                                                                            <p className="text-zinc-300 text-[11px] leading-relaxed">
                                                                                {briefData.critical_risks?.[0] ? renderTextWithCitations(briefData.critical_risks[0]) : "SQLite locking limits in concurrent setups [Financial Forecasts.xlsx]"}
                                                                            </p>
                                                                        </div>

                                                                        <div className="space-y-3">
                                                                            <div>
                                                                                <span className="text-[10px] uppercase font-bold text-zinc-555 block mb-1">Core Risk Landscape</span>
                                                                                <p className="text-zinc-350">{briefData.risk_analysis}</p>
                                                                            </div>
                                                                            <div className="pt-1">
                                                                                <span className="text-[10px] uppercase font-bold text-zinc-555 block mb-1">Bottlenecks &amp; Challenges</span>
                                                                                <ul className="list-disc pl-4 space-y-1.5 text-zinc-350">
                                                                                    {briefData.challenges?.map((item: string, i: number) => (
                                                                                        <li key={i}>{item}</li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        </div>
                                                                    </section>

                                                                    {/* Chapter 6: Recommendations & Outlook */}
                                                                    <section id="sec-recs" className="space-y-4 scroll-mt-24">
                                                                        <h2 className="text-xs font-bold text-white tracking-wider border-l-2 border-indigo-500 pl-3 uppercase">
                                                                            6. Strategic Actions
                                                                        </h2>
                                                                        <div className="space-y-3">
                                                                            <div className="space-y-2">
                                                                                <span className="text-[10px] uppercase font-bold text-zinc-555 block">Strategic Recommendations</span>
                                                                                {briefData.recommendations?.map((item: string, i: number) => (
                                                                                    <div key={i} className="flex gap-2.5 p-2 rounded-lg bg-zinc-900/10 border border-zinc-900/60 text-zinc-300">
                                                                                        <span className="text-indigo-400 font-bold shrink-0">{i+1}.</span>
                                                                                        <span>{item}</span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                            <div className="pt-2">
                                                                                <span className="text-[10px] uppercase font-bold text-zinc-555 block mb-1">Future Outlook</span>
                                                                                <p className="text-zinc-350">{briefData.future_outlook}</p>
                                                                            </div>
                                                                        </div>
                                                                    </section>

                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="glass-panel border-dashed border-zinc-850 rounded-xl p-16 text-center text-zinc-550 text-xs space-y-4 max-w-2xl mx-auto bg-zinc-950/20 shadow-2xl">
                                                                <Sparkles className="w-10 h-10 text-zinc-700 mx-auto animate-bounce" />
                                                                <h4 className="font-bold text-white">Synthesize Executive Brief</h4>
                                                                <p className="max-w-xs mx-auto leading-relaxed">
                                                                    Extract facts, dates, stats, and critical risk callouts from all active database sources.
                                                                </p>
                                                                <button
                                                                    onClick={handleGenerateAiBrief}
                                                                    disabled={workspaceSaving}
                                                                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer active:scale-95 transition-all shadow-lg"
                                                                >
                                                                    {workspaceSaving ? "Compiling briefing files..." : "Synthesize with AI"}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()}

                                            {/* WORKSPACE: ACTION PLAN TAB */}
                                            {workspaceTab === "plan" && (() => {
                                                const planWeeks = activeProject.action_plan ? (() => {
                                                    try {
                                                        return JSON.parse(activeProject.action_plan);
                                                     } catch(e) {
                                                         return null;
                                                     }
                                                 })() : null;

                                                 const completedCount = planWeeks ? planWeeks.filter((w: any) => w.completed).length : 0;
                                                 const progressPct = planWeeks ? Math.round((completedCount / planWeeks.length) * 100) : 0;

                                                 return (
                                                     <div className="max-w-3xl mx-auto space-y-6">
                                                         {planWeeks ? (
                                                             <div className="space-y-6">
                                                                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#09090b]/40 p-4 rounded-xl border border-zinc-850">
                                                                     <div className="space-y-0.5">
                                                                         <h3 className="text-xs font-bold text-white uppercase tracking-wider">30-Day Development Timeline</h3>
                                                                         <p className="text-[10px] text-zinc-555">Toggle week checkboxes to update progress indices.</p>
                                                                     </div>
                                                                     <div className="flex items-center gap-3">
                                                                         <div className="text-right">
                                                                             <span className="text-[9px] uppercase font-bold text-zinc-550 block">Milestones Met</span>
                                                                             <span className="text-xs font-bold text-white">{completedCount} / {planWeeks.length} Weeks</span>
                                                                         </div>
                                                                         <div className="px-2.5 py-1 rounded bg-indigo-950/20 border border-indigo-900/10 text-indigo-300 text-xs font-bold">
                                                                             {progressPct}% Done
                                                                         </div>
                                                                     </div>
                                                                 </div>

                                                                 {/* Progress tracker bar */}
                                                                 <div className="w-full h-2 bg-zinc-900 border border-zinc-850 rounded-full overflow-hidden shadow-inner">
                                                                     <div className="h-full bg-indigo-600 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]" style={{ width: `${progressPct}%` }} />
                                                                 </div>

                                                                 {/* Visual Timeline Track */}
                                                                 <div className="relative border-l border-zinc-850 ml-4.5 pl-8 space-y-8 py-2">
                                                                     {planWeeks.map((wk: any, idx: number) => (
                                                                         <div key={idx} className="relative">
                                                                             {/* Checkpoint circular node */}
                                                                             <div 
                                                                                 onClick={() => handleTogglePlanWeek(idx)}
                                                                                 className={`absolute -left-[45px] top-1.5 w-7 h-7 rounded-full border flex items-center justify-center cursor-pointer transition-all duration-300 active:scale-90 ${
                                                                                     wk.completed 
                                                                                         ? "bg-indigo-650 border-indigo-500 text-white shadow-md shadow-indigo-600/30" 
                                                                                         : "bg-zinc-950 border-zinc-800 text-zinc-550 hover:border-zinc-700 hover:text-zinc-300"
                                                                                 }`}
                                                                                 title="Toggle Milestone Completion"
                                                                             >
                                                                                 {wk.completed ? (
                                                                                     <CheckCircle className="w-3.5 h-3.5" />
                                                                                 ) : (
                                                                                     <span className="text-[10px] font-bold">{idx + 1}</span>
                                                                                 )}
                                                                             </div>

                                                                             {/* Milestone Card */}
                                                                             <div className={`p-5 rounded-2xl glass-panel border bg-zinc-950/25 space-y-4 hover:border-zinc-700/60 transition-all ${
                                                                                 wk.completed ? "border-indigo-950/40 bg-indigo-950/5" : "border-zinc-850"
                                                                             }`}>
                                                                                 <div className="flex justify-between items-start gap-4">
                                                                                     <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                                                                                         {wk.week}
                                                                                     </span>
                                                                                     <span className={`text-[9px] uppercase font-bold tracking-wider ${wk.completed ? "text-indigo-400" : "text-zinc-555"}`}>
                                                                                         {wk.completed ? "Milestone Met" : "Development In Progress"}
                                                                                     </span>
                                                                                 </div>

                                                                                 <div className="space-y-1">
                                                                                     <span className="text-[9px] uppercase font-bold text-zinc-555 block leading-none">Milestone Target Goal</span>
                                                                                     <h4 className="font-bold text-white text-xs leading-snug">{wk.goal}</h4>
                                                                                 </div>

                                                                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2.5 border-t border-zinc-900 text-[11px] leading-relaxed text-zinc-350">
                                                                                     <div className="space-y-0.5">
                                                                                         <span className="text-[9px] uppercase font-bold text-zinc-555 block">Skills Required</span>
                                                                                         <p className="text-zinc-300">{wk.skills}</p>
                                                                                     </div>
                                                                                     <div className="space-y-0.5">
                                                                                         <span className="text-[9px] uppercase font-bold text-zinc-555 block">Tools &amp; Frameworks</span>
                                                                                         <p className="text-zinc-300">{wk.tools}</p>
                                                                                     </div>
                                                                                 </div>

                                                                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] leading-relaxed text-zinc-350">
                                                                                     <div className="space-y-0.5">
                                                                                         <span className="text-[9px] uppercase font-bold text-zinc-555 block">Milestone Deliverables</span>
                                                                                         <p className="text-zinc-300">{wk.deliverables}</p>
                                                                                     </div>
                                                                                     <div className="space-y-0.5">
                                                                                         <span className="text-[9px] uppercase font-bold text-zinc-555 block">Business Outcome</span>
                                                                                         <p className="text-emerald-450 font-semibold">{wk.business_outcome}</p>
                                                                                     </div>
                                                                                 </div>

                                                                                 {/* Responsible AI Notes Panel */}
                                                                                 <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-900/15 text-[10px] leading-relaxed">
                                                                                     <span className="text-[9px] uppercase font-bold text-indigo-400 block tracking-wide mb-1">Responsible AI Notes</span>
                                                                                     <p className="text-indigo-250 italic">
                                                                                         "{wk.responsible_ai_notes}"
                                                                                     </p>
                                                                                 </div>
                                                                             </div>
                                                                         </div>
                                                                     ))}
                                                                 </div>
                                                             </div>
                                                         ) : (
                                                             <div className="glass-panel border-dashed border-zinc-850 rounded-xl p-16 text-center text-zinc-550 text-xs space-y-4 max-w-2xl mx-auto bg-zinc-950/20 shadow-2xl">
                                                                 <Sparkles className="w-10 h-10 text-zinc-700 mx-auto animate-bounce" />
                                                                 <h4 className="font-bold text-white">Generate 30-Day Implementation Plan</h4>
                                                                 <p className="max-w-xs mx-auto leading-relaxed">
                                                                     Compile visual weekly milestones, required tools, developers skills, and ethical AI safeguards.
                                                                 </p>
                                                                 <button
                                                                     onClick={handleGenerateActionPlan}
                                                                     disabled={workspaceSaving}
                                                                     className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer active:scale-95 transition-all shadow-lg"
                                                                 >
                                                                     {workspaceSaving ? "Compiling roadmap indices..." : "Generate Roadmap"}
                                                                 </button>
                                                             </div>
                                                         )}
                                                     </div>
                                                 );
                                             })()}

                                            {/* WORKSPACE: PRESENTATION TAB */}
                                            {workspaceTab === "presentation" && (() => {
                                                const slides = activeProject.presentation_slides ? (() => {
                                                    try {
                                                        return JSON.parse(activeProject.presentation_slides);
                                                    } catch(e) {
                                                        return null;
                                                    }
                                                })() : null;

                                                return (
                                                    <div className="max-w-3xl mx-auto space-y-6 print:hidden">
                                                        {slides ? (
                                                            <div className="space-y-6">
                                                                {/* Export Headers Row */}
                                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#09090b]/40 p-4 rounded-xl border border-zinc-850">
                                                                    <div className="space-y-0.5">
                                                                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Widescreen Presentation Outline</h3>
                                                                        <p className="text-[10px] text-zinc-555">Review slides outline and download presentation packages.</p>
                                                                    </div>
                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                        <button
                                                                            onClick={handleExportPptx}
                                                                            className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                                                                            title="Download widescreen MS PowerPoint file (.pptx)"
                                                                        >
                                                                            <Download className="w-3.5 h-3.5" />
                                                                            <span>PowerPoint</span>
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                showToast("Preparing slide sheets for printing...", "success");
                                                                                setTimeout(() => window.print(), 500);
                                                                            }}
                                                                            className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                                                                            title="Print slideshow sheets or save as PDF"
                                                                        >
                                                                            <FileText className="w-3.5 h-3.5" />
                                                                            <span>PDF</span>
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                handleExportPptx();
                                                                                setShowGoogleSlidesModal(true);
                                                                            }}
                                                                            className="px-3 py-1.5 rounded bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 hover:border-indigo-500/35 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                                                                            title="Export and upload to Google Slides"
                                                                        >
                                                                            <Compass className="w-3.5 h-3.5" />
                                                                            <span>Google Slides</span>
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                {/* Widescreen Active Slide Preview Card */}
                                                                <div className="relative aspect-[16/9] w-full rounded-2xl border border-zinc-850 bg-[#0c0c0e] p-10 flex flex-col justify-between shadow-2xl overflow-hidden group">
                                                                    <div className="absolute inset-0 bg-radial-gradient from-indigo-950/20 via-transparent to-transparent opacity-60 pointer-events-none" />

                                                                    <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-zinc-500 border-b border-zinc-900/60 pb-4 z-10">
                                                                        <span>Slide {currentSlideIdx + 1} of {slides.length}</span>
                                                                        <span className="text-indigo-400/90">{slides[currentSlideIdx].slide_number === 1 ? "Title Presentation" : "Strategy Bullet Outline"}</span>
                                                                    </div>

                                                                    <div className="space-y-4 my-auto z-10">
                                                                        <h4 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-tight">
                                                                            {slides[currentSlideIdx].title}
                                                                        </h4>
                                                                        {slides[currentSlideIdx].subtitle && (
                                                                            <p className="text-xs md:text-sm italic text-indigo-400/90">
                                                                                {slides[currentSlideIdx].subtitle}
                                                                            </p>
                                                                        )}

                                                                        <ul className="space-y-2.5 pt-2">
                                                                            {slides[currentSlideIdx].bullets?.map((bullet: string, bIdx: number) => (
                                                                                <li key={bIdx} className="text-xs md:text-sm text-zinc-350 flex items-start gap-2.5 leading-relaxed">
                                                                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                                                                                    <span>{bullet}</span>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>

                                                                    <div className="flex justify-between items-center text-[9px] uppercase font-bold tracking-wider text-zinc-650 border-t border-zinc-900/40 pt-4 z-10">
                                                                        <span>Inquira Consulting Suite</span>
                                                                        <span>Confidential</span>
                                                                    </div>
                                                                </div>

                                                                {/* Slide Deck Navigation Controls */}
                                                                <div className="flex justify-between items-center bg-[#09090b]/20 px-4 py-3 rounded-xl border border-zinc-900">
                                                                    <button
                                                                        onClick={() => setCurrentSlideIdx(Math.max(0, currentSlideIdx - 1))}
                                                                        disabled={currentSlideIdx === 0}
                                                                        className="px-3.5 py-1.5 rounded-lg border border-zinc-850 hover:border-zinc-800 text-zinc-405 hover:text-white text-xs font-semibold cursor-pointer disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95"
                                                                    >
                                                                        Previous Slide
                                                                    </button>
                                                                    <div className="flex items-center gap-1.5">
                                                                        {slides.map((_: any, sIdx: number) => (
                                                                            <button
                                                                                key={sIdx}
                                                                                onClick={() => setCurrentSlideIdx(sIdx)}
                                                                                className={`w-2 h-2 rounded-full transition-all ${
                                                                                    currentSlideIdx === sIdx
                                                                                        ? "bg-indigo-505 scale-125"
                                                                                        : "bg-zinc-800 hover:bg-zinc-700"
                                                                                }`}
                                                                                title={`Jump to slide ${sIdx + 1}`}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                    <button
                                                                        onClick={() => setCurrentSlideIdx(Math.min(slides.length - 1, currentSlideIdx + 1))}
                                                                        disabled={currentSlideIdx === slides.length - 1}
                                                                        className="px-3.5 py-1.5 rounded-lg border border-zinc-850 hover:border-zinc-800 text-zinc-405 hover:text-white text-xs font-semibold cursor-pointer disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95"
                                                                    >
                                                                        Next Slide
                                                                    </button>
                                                                </div>

                                                                {/* Collapsible Speaker Notes Drawer */}
                                                                <div className="rounded-xl border border-zinc-850 bg-[#09090b]/40 overflow-hidden">
                                                                    <button
                                                                        onClick={() => setNotesExpanded(!notesExpanded)}
                                                                        className="w-full flex items-center justify-between px-4 py-3 bg-[#0d0d0f]/60 hover:bg-[#121215]/80 transition-colors text-left"
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <PresIcon className="w-4 h-4 text-indigo-400" />
                                                                            <span className="text-xs font-bold text-white">Presenter Speaker Notes</span>
                                                                        </div>
                                                                        <span className="text-zinc-550 text-[11px] font-semibold hover:text-zinc-350">
                                                                            {notesExpanded ? "Collapse Notes" : "Expand Notes"}
                                                                        </span>
                                                                    </button>
                                                                    {notesExpanded && (
                                                                        <div className="p-4 bg-zinc-950/20 border-t border-zinc-900 text-xs text-zinc-300 italic leading-relaxed">
                                                                            "{slides[currentSlideIdx].speaker_notes}"
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="glass-panel border-dashed border-zinc-850 rounded-xl p-16 text-center text-zinc-550 text-xs space-y-4 max-w-2xl mx-auto bg-zinc-950/20 shadow-2xl">
                                                                <Sparkles className="w-10 h-10 text-zinc-700 mx-auto animate-bounce" />
                                                                <h4 className="font-bold text-white">Generate Presentation Outline</h4>
                                                                <p className="max-w-xs mx-auto leading-relaxed">
                                                                    Compile facts, objectives, methodology records, recommendations, and timeline maps into a widescreen 9-slide consulting deck.
                                                                </p>
                                                                <button
                                                                    onClick={handleGeneratePresentation}
                                                                    disabled={workspaceSaving}
                                                                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer active:scale-95 transition-all shadow-lg"
                                                                >
                                                                    {workspaceSaving ? "Compiling slide parameters..." : "Generate Slides Outline"}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()}

                                            {/* WORKSPACE: HISTORY TAB */}
                                            {workspaceTab === "history" && (
                                                <div className="max-w-3xl mx-auto space-y-6">
                                                    <h3 className="text-sm font-bold text-white">Workspace Audit Logs</h3>

                                                    <div className="glass-panel border-zinc-855 rounded-xl p-4 divide-y divide-zinc-900">
                                                        {historyLogs.map(log => (
                                                            <div key={log.id} className="py-3 flex justify-between items-center text-xs text-zinc-300">
                                                                <span>{log.action}</span>
                                                                <span className="text-[10px] text-zinc-550 font-semibold">{log.date}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                        </div>
                                    </div>
                                </div>

                                {/* Comments Side Drawer */}
                                {showCommentsPanel && (
                                    <div className="w-full lg:w-72 border-l border-zinc-800/80 bg-zinc-950/40 backdrop-blur-md flex flex-col justify-between shrink-0 h-1/2 lg:h-full z-20">
                                        <div className="p-4 border-b border-zinc-800/40 flex justify-between items-center bg-black/10">
                                            <h4 className="text-[10px] uppercase font-bold text-zinc-400 tracking-wide flex items-center gap-1.5 font-mono">
                                                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                                                Feedback Drawer
                                            </h4>
                                            <button
                                                onClick={() => setShowCommentsPanel(false)}
                                                className="text-zinc-550 hover:text-white transition-colors cursor-pointer"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        {/* Comments list scroll */}
                                        <div className="flex-1 p-4 overflow-y-auto space-y-4">
                                            {commentsList.map((comm) => (
                                                <div key={comm.id} className="p-3 rounded-lg border border-zinc-850 bg-zinc-950/20 space-y-1 relative group">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[10px] font-bold text-white">{comm.author}</span>
                                                        <span className="text-[8px] text-zinc-550">{comm.date}</span>
                                                    </div>
                                                    <p className="text-[10px] text-zinc-350 leading-relaxed">
                                                        {comm.text}
                                                    </p>
                                                    {comm.id !== 1 && (
                                                        <button
                                                            onClick={() => handleDeleteComment(comm.id)}
                                                            className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-[8px] text-red-500 hover:underline transition-opacity cursor-pointer border-none bg-transparent"
                                                        >
                                                            Discard
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Input form */}
                                        <form onSubmit={handlePostComment} className="p-3 border-t border-zinc-800/40 bg-zinc-950/60 flex items-center gap-2">
                                            <input
                                                type="text"
                                                required
                                                value={commentInput}
                                                onChange={(e) => setCommentInput(e.target.value)}
                                                placeholder="Write feedback comment..."
                                                className="flex-1 px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                            />
                                            <button
                                                type="submit"
                                                className="p-1.5 rounded bg-indigo-650 hover:bg-indigo-500 text-white cursor-pointer active:scale-95 transition-all shadow-md"
                                            >
                                                <Send className="w-3.5 h-3.5" />
                                            </button>
                                        </form>
                                    </div>
                                )}

                            </motion.div>
                        ) : (
                            /* ------------------------------------------------------------- */
                            /* STANDARD DASHBOARD TABS (Dashboard, Projects, etc.) */
                            /* ------------------------------------------------------------- */
                            <div className="p-6 md:p-8 space-y-8">
                                {activeTab === "dashboard" && (
                                    <motion.div
                                        key="dashboard"
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -15 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-8"
                                    >
                                        <div className="p-6 rounded-2xl glass-panel relative overflow-hidden border-zinc-800/80 bg-gradient-to-br from-indigo-900/10 via-zinc-955/60 to-black/80">
                                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="space-y-1.5">
                                                    <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                                                        Welcome back, {user?.full_name.split(" ")[0]}! <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                                                    </h3>
                                                    <p className="text-xs md:text-sm text-zinc-400 max-w-xl">
                                                        Your research grid is ready. Select a project card to open its Notion/NotebookLM research workspace.
                                                    </p>
                                                </div>
                                                <div className="shrink-0 flex gap-2.5">
                                                    <button 
                                                        onClick={() => setActiveTab("projects")}
                                                        className="px-4 py-2 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 text-zinc-300 text-xs font-semibold hover:text-white cursor-pointer transition-colors"
                                                    >
                                                        Browse Projects
                                                    </button>
                                                    <button 
                                                        onClick={() => setActiveTab("templates")}
                                                        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer transition-colors"
                                                    >
                                                        Use Templates
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full filter blur-3xl pointer-events-none" />
                                        </div>

                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                                            {[
                                                { label: "Total Projects", val: stats.total_projects, icon: FolderKanban, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
                                                { label: "Reports Generated", val: stats.reports_generated, icon: FileText, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
                                                { label: "Sources Collected", val: stats.sources_collected, icon: Globe, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
                                                { label: "Executive Briefs", val: stats.executive_briefs_created, icon: Sparkles, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
                                            ].map((stat, idx) => {
                                                const Icon = stat.icon;
                                                return (
                                                    <div 
                                                        key={idx}
                                                        className="glass-panel border-zinc-800/80 rounded-xl p-4.5 flex items-center justify-between gap-4 hover:border-zinc-700/60 transition-colors"
                                                    >
                                                        <div className="space-y-1 min-w-0">
                                                            <span className="text-[10px] md:text-xs font-medium text-zinc-405 uppercase tracking-wide block truncate">
                                                                {stat.label}
                                                            </span>
                                                            {loading ? (
                                                                <div className="h-6 w-12 bg-zinc-800 animate-pulse rounded mt-1" />
                                                            ) : (
                                                                <span className="text-xl md:text-2xl font-bold text-white tracking-tight leading-none">
                                                                    {stat.val}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border shrink-0 ${stat.color}`}>
                                                            <Icon className="w-5 h-5" />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                            <div className="lg:col-span-2 space-y-4">
                                                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                                                    <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                                                    Favorite Projects
                                                </h3>

                                                {loading ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="h-44 bg-zinc-900/40 rounded-xl animate-pulse" />
                                                        <div className="h-44 bg-zinc-900/40 rounded-xl animate-pulse" />
                                                    </div>
                                                ) : favoriteProjects.length === 0 ? (
                                                    <div className="glass-panel rounded-xl border-dashed border-zinc-800 p-8 text-center text-zinc-550 text-xs">
                                                        Star project cards to keep them pinned here.
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {favoriteProjects.slice(0, 4).map(project => (
                                                            <ProjectCard
                                                                key={project.id}
                                                                project={project}
                                                                onToggleFavorite={handleToggleFavorite}
                                                                onRename={(p) => { setSelectedProject(p); setRenameName(p.name); setShowRenameModal(true); }}
                                                                onDuplicate={handleDuplicateProject}
                                                                onArchive={handleArchiveProject}
                                                                onDelete={(id) => { const p = projects.find(pr => pr.id === id); if (p) { setSelectedProject(p); setShowDeleteModal(true); } }}
                                                                onClick={openWorkspace}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                                                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                                                    Recently Updated
                                                </h3>

                                                <div className="glass-panel border-zinc-800/80 rounded-xl p-4 space-y-3">
                                                    {loading ? (
                                                        <div className="space-y-2">
                                                            <div className="h-10 bg-zinc-900/40 rounded animate-pulse" />
                                                            <div className="h-10 bg-zinc-905/40 rounded animate-pulse" />
                                                        </div>
                                                    ) : recentlyViewed.length === 0 ? (
                                                        <div className="text-zinc-555 text-center py-4 text-xs">
                                                            No projects found.
                                                        </div>
                                                    ) : (
                                                        <div className="divide-y divide-zinc-800/50">
                                                            {recentlyViewed.map(p => (
                                                                <div 
                                                                    key={p.id}
                                                                    onClick={() => openWorkspace(p)}
                                                                    className="py-2.5 flex items-center justify-between cursor-pointer group first:pt-0 last:pb-0"
                                                                >
                                                                    <div className="min-w-0">
                                                                        <p className="text-xs font-semibold text-zinc-200 group-hover:text-indigo-400 transition-colors truncate">
                                                                            {p.name}
                                                                        </p>
                                                                        <span className="text-[10px] text-zinc-550">{p.industry}</span>
                                                                    </div>
                                                                    <ChevronRight className="w-3.5 h-3.5 text-zinc-655 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Projects List Tab */}
                                {activeTab === "projects" && (
                                    <motion.div
                                        key="projects"
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -15 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl glass-panel border-zinc-800/80">
                                            <div className="relative w-full sm:max-w-xs">
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-555">
                                                    <Search className="w-4 h-4" />
                                                </span>
                                                <input
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    placeholder="Search projects..."
                                                    className="w-full pl-9 pr-4 py-2 glass-input text-xs"
                                                />
                                            </div>

                                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                                <div className="flex items-center gap-1.5 text-zinc-400 text-xs shrink-0">
                                                    <SlidersHorizontal className="w-3.5 h-3.5" />
                                                    <span>Filters:</span>
                                                </div>

                                                <select
                                                    value={statusFilter}
                                                    onChange={(e) => setStatusFilter(e.target.value)}
                                                    className="px-2.5 py-1.5 rounded-lg glass-panel border border-zinc-800 text-zinc-300 text-xs bg-zinc-955 focus:outline-none cursor-pointer"
                                                >
                                                    <option value="All">All Statuses</option>
                                                    {statuses.filter(s => s !== "All").map(s => (
                                                        <option key={s} value={s}>{s}</option>
                                                    ))}
                                                </select>

                                                <select
                                                    value={industryFilter}
                                                    onChange={(e) => setIndustryFilter(e.target.value)}
                                                    className="px-2.5 py-1.5 rounded-lg glass-panel border border-zinc-800 text-zinc-300 text-xs bg-zinc-955 focus:outline-none cursor-pointer"
                                                >
                                                    <option value="All">All Industries</option>
                                                    {industries.filter(i => i !== "All").map(i => (
                                                        <option key={i} value={i}>{i}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {loading ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {[...Array(6)].map((_, i) => (
                                                    <div key={i} className="h-48 bg-zinc-905/30 border border-zinc-800/80 rounded-xl animate-pulse" />
                                                ))}
                                            </div>
                                        ) : filteredProjects.length === 0 ? (
                                            <div className="glass-panel border-zinc-800/80 rounded-2xl p-16 text-center max-w-md mx-auto space-y-4">
                                                <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                                                    <FolderKanban className="w-5 h-5" />
                                                </div>
                                                <h4 className="font-bold text-white text-sm">No research projects found</h4>
                                                <button
                                                    onClick={() => setShowCreateModal(true)}
                                                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs cursor-pointer"
                                                >
                                                    Create Project
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {filteredProjects.map((project) => (
                                                    <ProjectCard
                                                        key={project.id}
                                                        project={project}
                                                        onToggleFavorite={handleToggleFavorite}
                                                        onRename={(p) => { setSelectedProject(p); setRenameName(p.name); setShowRenameModal(true); }}
                                                        onDuplicate={handleDuplicateProject}
                                                        onArchive={handleArchiveProject}
                                                        onDelete={(id) => { const p = projects.find(pr => pr.id === id); if (p) { setSelectedProject(p); setShowDeleteModal(true); } }}
                                                        onClick={openWorkspace}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {/* Templates Tab */}
                                {activeTab === "templates" && (
                                    <motion.div
                                        key="templates"
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -15 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-6"
                                    >
                                        <div className="space-y-1">
                                            <h3 className="text-sm font-bold text-white">AI-Assisted Research Blueprints</h3>
                                            <p className="text-xs text-zinc-450">
                                                Kickstart your inquiry with templates featuring structured fields. Click to spawn.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {templates.map((tmpl, idx) => {
                                                const Icon = tmpl.icon;
                                                return (
                                                    <div 
                                                        key={idx}
                                                        className="glass-panel border-zinc-800/80 rounded-xl p-5 hover:border-indigo-500/30 flex flex-col justify-between h-44 group cursor-pointer transition-all duration-300"
                                                        onClick={() => handleUseTemplate(tmpl.name, tmpl.industry)}
                                                    >
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                                                                    <Icon className="w-5.5 h-5.5" />
                                                                </div>
                                                                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-zinc-905 text-zinc-400 border border-zinc-700/50">
                                                                    {tmpl.industry}
                                                                </span>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <h4 className="font-semibold text-white text-xs group-hover:text-indigo-400 transition-colors">
                                                                    {tmpl.name}
                                                                </h4>
                                                                <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2">
                                                                    {tmpl.desc}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-[10px] text-indigo-400 font-semibold group-hover:underline flex items-center gap-1 mt-2">
                                                            Spawn Workspace <ChevronRight className="w-3.5 h-3.5" />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Saved Reports Tab */}
                                {activeTab === "reports" && (
                                    <motion.div
                                        key="reports"
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -15 }}
                                        transition={{ duration: 0.3 }}
                                        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                                    >
                                        <div className="lg:col-span-1 space-y-4">
                                            <h3 className="text-sm font-bold text-white">Saved Intelligence Briefs</h3>
                                            <div className="space-y-3">
                                                {savedReports.map((report) => (
                                                    <div
                                                        key={report.id}
                                                        onClick={() => setSelectedReport(report)}
                                                        className={`p-4 rounded-xl glass-panel text-left cursor-pointer transition-all border-zinc-800/80 hover:border-zinc-700 ${
                                                            selectedReport?.id === report.id ? "border-indigo-500/50 bg-indigo-955/5 text-indigo-200" : ""
                                                        }`}
                                                    >
                                                        <h4 className="font-semibold text-white text-xs truncate mb-1">{report.title}</h4>
                                                        <p className="text-[10px] text-zinc-555 mb-2 truncate">Project: {report.project}</p>
                                                        <div className="flex justify-between items-center text-[10px] text-zinc-500">
                                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {report.date}</span>
                                                            <span className="text-indigo-455 font-semibold">Open Brief</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="lg:col-span-2">
                                            <div className="glass-panel border-zinc-800/80 rounded-2xl p-6 min-h-[400px] flex flex-col justify-between">
                                                {selectedReport ? (
                                                    <div className="space-y-4">
                                                        <div className="flex justify-between items-center border-b border-zinc-850 pb-4">
                                                            <div>
                                                                <h3 className="text-base font-bold text-white tracking-tight">{selectedReport.title}</h3>
                                                                <p className="text-[10px] text-zinc-555 mt-0.5">Created: {selectedReport.date} | Link: {selectedReport.project}</p>
                                                            </div>
                                                            <button 
                                                                onClick={() => showToast("Simulating Print PDF...", "success")}
                                                                className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-350 text-[10px] hover:text-white font-medium cursor-pointer"
                                                            >
                                                                Print PDF
                                                            </button>
                                                        </div>
                                                        <div className="text-xs text-zinc-300 space-y-3 leading-relaxed">
                                                            <p className="font-semibold text-indigo-400">RESEARCH EXECUTIVE SUMMARY:</p>
                                                            <p className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-905">{selectedReport.summary}</p>
                                                            <p className="font-semibold text-indigo-400 mt-4">AI COMPILATION NOTES:</p>
                                                            <p>This intelligence document was synthesized matching project specifications inside the Inquira platform environment.</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center m-auto text-center space-y-3">
                                                        <FileText className="w-10 h-10 text-zinc-705 animate-pulse" />
                                                        <p className="text-xs text-zinc-555 max-w-xs">Select a brief document from the panel to read.</p>
                                                    </div>
                                                )}
                                                <div className="text-[10px] text-zinc-650 border-t border-zinc-905 pt-4 mt-6">
                                                    Inquira Security Signature: sha256:4f82...192b
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Analytics Tab */}
                                {activeTab === "analytics" && (() => {
                                    const totalProj = projects.length;
                                    const completedProj = projects.filter(p => p.progress === 100 || p.status === "Completed").length;
                                    const sourcesCount = stats.sources_collected || (projects.length * 3);
                                    const avgCredibility = 86;
                                    const researchHoursCount = totalProj * 12 + sourcesCount * 3 + completedProj * 5;

                                    const industryMap: Record<string, number> = {};
                                    projects.forEach(p => {
                                        const ind = p.industry || "Technology";
                                        industryMap[ind] = (industryMap[ind] || 0) + 1;
                                    });
                                    if (Object.keys(industryMap).length === 0) {
                                        industryMap["Technology"] = 4;
                                        industryMap["Finance"] = 3;
                                        industryMap["Energy"] = 2;
                                        industryMap["Retail"] = 1;
                                    }
                                    const industryChartData = Object.entries(industryMap).map(([name, count]) => ({
                                        name,
                                        Projects: count
                                    }));

                                    const sourceTypesChartData = [
                                        { name: "Website URL", value: 35, color: "#6366F1" },
                                        { name: "PDF Upload", value: 25, color: "#10B981" },
                                        { name: "Research Paper", value: 20, color: "#8B5CF6" },
                                        { name: "YouTube Transcript", value: 10, color: "#F59E0B" },
                                        { name: "Google Drive", value: 5, color: "#06B6D4" },
                                        { name: "Manual Notes", value: 5, color: "#64748B" }
                                    ];

                                    const monthlyActiveData = [
                                        { name: "Jan", Projects: 2, Sources: 5 },
                                        { name: "Feb", Projects: 4, Sources: 12 },
                                        { name: "Mar", Projects: 3, Sources: 8 },
                                        { name: "Apr", Projects: 6, Sources: 18 },
                                        { name: "May", Projects: 8, Sources: 22 },
                                        { name: "Jun", Projects: 7, Sources: 20 },
                                        { name: "Jul", Projects: 9, Sources: 28 }
                                    ];

                                    const heatmapDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
                                    const heatmapHours = ["Morning", "Afternoon", "Evening"];
                                    const heatmapMatrix = [
                                        [3, 8, 5],
                                        [6, 9, 4],
                                        [4, 7, 8],
                                        [7, 5, 6],
                                        [5, 8, 9]
                                    ];

                                    const getHeatColor = (val: number) => {
                                        if (val >= 8) return "bg-indigo-600/90 border border-indigo-400/30 text-white font-bold";
                                        if (val >= 6) return "bg-indigo-600/60 border border-indigo-505/20 text-zinc-105";
                                        if (val >= 4) return "bg-indigo-900/40 border border-indigo-950/20 text-zinc-300";
                                        return "bg-zinc-950/30 border border-zinc-900 text-zinc-550";
                                    };

                                    return (
                                        <motion.div
                                            key="analytics"
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -15 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-6"
                                        >
                                            <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                                                <div className="space-y-0.5">
                                                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                                        <BarChart3 className="w-4.5 h-4.5 text-indigo-400" />
                                                        Inquira Power Analytics Dashboard
                                                    </h3>
                                                    <p className="text-[10px] text-zinc-550">Real-time database metrics compiling research sessions.</p>
                                                </div>
                                            </div>

                                            {/* KPI Cards Row (Microsoft Power BI dashboard style) */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                                <div className="p-4 rounded-xl border border-zinc-850 bg-gradient-to-br from-[#0c0c0e]/80 to-zinc-950/40 shadow-xl flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <span className="text-[8px] uppercase font-bold text-zinc-500 block tracking-wider">Projects Completed</span>
                                                        <span className="text-xl font-black text-white">{completedProj} <span className="text-xs font-normal text-zinc-650">/ {totalProj}</span></span>
                                                    </div>
                                                    <div className="w-9 h-9 rounded-lg bg-indigo-950/35 border border-indigo-900/20 flex items-center justify-center text-indigo-400">
                                                        <FolderKanban className="w-4.5 h-4.5" />
                                                    </div>
                                                </div>

                                                <div className="p-4 rounded-xl border border-zinc-850 bg-gradient-to-br from-[#0c0c0e]/80 to-zinc-955/40 shadow-xl flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <span className="text-[8px] uppercase font-bold text-zinc-500 block tracking-wider">Research Hours</span>
                                                        <span className="text-xl font-black text-emerald-400">{researchHoursCount} <span className="text-[10px] font-normal text-zinc-550">Hours</span></span>
                                                    </div>
                                                    <div className="w-9 h-9 rounded-lg bg-emerald-950/20 border border-emerald-900/15 flex items-center justify-center text-emerald-405">
                                                        <Calendar className="w-4.5 h-4.5" />
                                                    </div>
                                                </div>

                                                <div className="p-4 rounded-xl border border-zinc-850 bg-gradient-to-br from-[#0c0c0e]/80 to-zinc-950/40 shadow-xl flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <span className="text-[8px] uppercase font-bold text-zinc-500 block tracking-wider">Sources Used</span>
                                                        <span className="text-xl font-black text-white">{sourcesCount} <span className="text-[10px] font-normal text-zinc-550">Files</span></span>
                                                    </div>
                                                    <div className="w-9 h-9 rounded-lg bg-purple-950/30 border border-purple-900/20 flex items-center justify-center text-purple-400">
                                                        <BookOpen className="w-4.5 h-4.5" />
                                                    </div>
                                                </div>

                                                <div className="p-4 rounded-xl border border-zinc-850 bg-gradient-to-br from-[#0c0c0e]/80 to-zinc-950/40 shadow-xl flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <span className="text-[8px] uppercase font-bold text-zinc-500 block tracking-wider">Average Confidence</span>
                                                        <span className="text-xl font-black text-indigo-400">{avgCredibility}% <span className="text-[9px] text-emerald-500 font-bold bg-emerald-955/20 border border-emerald-900/10 px-1 py-0.5 rounded">High</span></span>
                                                    </div>
                                                    <div className="w-9 h-9 rounded-lg bg-cyan-955/20 border border-cyan-900/10 flex items-center justify-center text-cyan-400">
                                                        <Cpu className="w-4.5 h-4.5" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Charts Workspace Grids */}
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                {/* 1. Bar Chart: Most Common Industries */}
                                                <div className="glass-panel border-zinc-850 rounded-2xl p-5 space-y-4">
                                                    <div className="space-y-0.5">
                                                        <span className="text-[9px] uppercase font-bold text-zinc-500 block tracking-wider">Vertical Distribution</span>
                                                        <h4 className="text-xs font-bold text-white uppercase">Most Common Industries</h4>
                                                    </div>
                                                    <div className="h-64 w-full text-[10px] leading-none">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <BarChart data={industryChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                                                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                                                                <XAxis dataKey="name" stroke="#52525b" />
                                                                <YAxis stroke="#52525b" />
                                                                <Tooltip 
                                                                    contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", borderRadius: "8px" }}
                                                                    itemStyle={{ color: "#ffffff" }}
                                                                    labelStyle={{ color: "#818cf8" }}
                                                                />
                                                                <Bar dataKey="Projects" fill="#6366F1" radius={[4, 4, 0, 0]} />
                                                            </BarChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </div>

                                                {/* 2. Pie Chart: Most Used Source Types */}
                                                <div className="glass-panel border-zinc-850 rounded-2xl p-5 space-y-4">
                                                    <div className="space-y-0.5">
                                                        <span className="text-[9px] uppercase font-bold text-zinc-500 block tracking-wider">Source Library breakdown</span>
                                                        <h4 className="text-xs font-bold text-white uppercase">Most Used Source Types</h4>
                                                    </div>
                                                    <div className="h-64 w-full flex flex-col md:flex-row items-center gap-4 text-[10px]">
                                                        <div className="h-full w-full md:w-1/2">
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <PieChart>
                                                                    <Pie
                                                                        data={sourceTypesChartData}
                                                                        cx="50%"
                                                                        cy="50%"
                                                                        innerRadius={45}
                                                                        outerRadius={70}
                                                                        paddingAngle={4}
                                                                        dataKey="value"
                                                                    >
                                                                        {sourceTypesChartData.map((entry, index) => (
                                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                                        ))}
                                                                    </Pie>
                                                                    <Tooltip 
                                                                        contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", borderRadius: "8px" }}
                                                                        itemStyle={{ color: "#ffffff" }}
                                                                    />
                                                                </PieChart>
                                                            </ResponsiveContainer>
                                                        </div>
                                                        <div className="w-full md:w-1/2 grid grid-cols-2 gap-2 text-[10px] text-zinc-400">
                                                            {sourceTypesChartData.map((item, i) => (
                                                                <div key={i} className="flex items-center gap-1.5 leading-none">
                                                                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                                                    <span className="truncate">{item.name} ({item.value}%)</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                {/* 3. Area Chart: Most Active Month (Timeline) */}
                                                <div className="glass-panel border-zinc-850 rounded-2xl p-5 space-y-4 lg:col-span-2">
                                                    <div className="space-y-0.5">
                                                        <span className="text-[9px] uppercase font-bold text-zinc-500 block tracking-wider">Sourcing activity velocity</span>
                                                        <h4 className="text-xs font-bold text-white uppercase">Most Active Month</h4>
                                                    </div>
                                                    <div className="h-60 w-full text-[10px] leading-none">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <AreaChart data={monthlyActiveData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                                                <defs>
                                                                    <linearGradient id="colorProj" x1="0" y1="0" x2="0" y2="1">
                                                                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                                                                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                                                                    </linearGradient>
                                                                    <linearGradient id="colorSources" x1="0" y1="0" x2="0" y2="1">
                                                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                                                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                                                    </linearGradient>
                                                                </defs>
                                                                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                                                                <XAxis dataKey="name" stroke="#52525b" />
                                                                <YAxis stroke="#52525b" />
                                                                <Tooltip 
                                                                    contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", borderRadius: "8px" }}
                                                                    itemStyle={{ color: "#ffffff" }}
                                                                />
                                                                <Legend wrapperStyle={{ paddingTop: "10px" }} />
                                                                <Area type="monotone" dataKey="Projects" stroke="#6366F1" fillOpacity={1} fill="url(#colorProj)" strokeWidth={2} />
                                                                <Area type="monotone" dataKey="Sources" stroke="#10B981" fillOpacity={1} fill="url(#colorSources)" strokeWidth={2} />
                                                            </AreaChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </div>

                                                {/* 4. Power BI Heatmap: Activity Matrix */}
                                                <div className="glass-panel border-zinc-850 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                                                    <div className="space-y-0.5">
                                                        <span className="text-[9px] uppercase font-bold text-zinc-500 block tracking-wider">Weekly Workload heat map</span>
                                                        <h4 className="text-xs font-bold text-white uppercase">Active Weekdays &amp; Hours</h4>
                                                    </div>

                                                    <div className="space-y-2 pt-2 my-auto">
                                                        <div className="grid grid-cols-4 gap-1.5 text-center text-[9px] text-zinc-555 font-bold uppercase">
                                                            <div />
                                                            {heatmapHours.map((h, i) => (
                                                                <div key={i}>{h.substring(0, 4)}</div>
                                                            ))}
                                                        </div>

                                                        {heatmapDays.map((day, dIdx) => (
                                                            <div key={dIdx} className="grid grid-cols-4 gap-1.5 items-center">
                                                                <div className="text-[9px] font-bold text-zinc-400 uppercase text-left">{day}</div>
                                                                {heatmapHours.map((_, hIdx) => {
                                                                    const val = heatmapMatrix[dIdx][hIdx];
                                                                    return (
                                                                        <div
                                                                            key={hIdx}
                                                                            className={`aspect-square rounded-md flex items-center justify-center text-[10px] transition-all cursor-default ${getHeatColor(val)}`}
                                                                            title={`${day} ${heatmapHours[hIdx]} activity weight: ${val}/10`}
                                                                        >
                                                                            {val}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="flex justify-between items-center text-[8px] text-zinc-555 border-t border-zinc-900 pt-3">
                                                        <span>Legend: 1 (Low) - 10 (High)</span>
                                                        <span className="flex items-center gap-1">
                                                            <span className="w-2.5 h-2.5 rounded bg-indigo-650/90" />
                                                            Peak
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })()}

                                {/* Settings Tab */}
                                {activeTab === "settings" && (
                                    <motion.div
                                        key="settings"
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -15 }}
                                        transition={{ duration: 0.3 }}
                                        className="max-w-xl mx-auto"
                                    >
                                        <div className="glass-panel border-zinc-800/80 rounded-2xl p-6 md:p-8 space-y-6">
                                            <div className="border-b border-zinc-850 pb-4">
                                                <h3 className="text-sm font-bold text-white flex items-center gap-1.5"><User className="w-4 h-4 text-indigo-400" /> User Profile Management</h3>
                                                <p className="text-xs text-zinc-550 mt-0.5">Configure Inquira workspace identity credentials.</p>
                                            </div>

                                            <form onSubmit={handleUpdateProfileSubmit} className="space-y-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-semibold uppercase text-zinc-450">Full Name</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={profileName}
                                                        onChange={(e) => setProfileName(e.target.value)}
                                                        className="w-full px-3 py-2 glass-input text-xs"
                                                    />
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-semibold uppercase text-zinc-455">Avatar Image URL</label>
                                                    <input
                                                        type="url"
                                                        value={profileAvatar}
                                                        onChange={(e) => setProfileAvatar(e.target.value)}
                                                        placeholder="https://api.dicebear.com/..."
                                                        className="w-full px-3 py-2 glass-input text-xs"
                                                    />
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-semibold uppercase text-zinc-455">Change Password</label>
                                                    <input
                                                        type="password"
                                                        value={profilePassword}
                                                        onChange={(e) => setProfilePassword(e.target.value)}
                                                        placeholder="Enter new password (optional)"
                                                        className="w-full px-3 py-2 glass-input text-xs"
                                                    />
                                                </div>

                                                <div className="pt-4 flex justify-end">
                                                    <button
                                                        type="submit"
                                                        disabled={profileLoading}
                                                        className="px-4 py-2 rounded-lg bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-semibold cursor-pointer active:scale-95 transition-all"
                                                    >
                                                        {profileLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Update Profile"}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* TOAST SYSTEM */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg border text-xs font-medium z-55 flex items-center gap-2.5 shadow-xl ${
                            toast.type === "success" 
                                ? "bg-indigo-950/80 border-indigo-500/30 text-indigo-200" 
                                : "bg-red-950/80 border-red-500/30 text-red-200"
                        }`}
                    >
                        {toast.type === "success" ? <CheckCircle className="w-4 h-4 text-indigo-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
                        <span>{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CREATE PROJECT MODAL */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md glass-panel rounded-xl p-6 border-zinc-800 bg-[#0c0c0e]/95"
                        >
                            <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-4">
                                <h3 className="text-sm font-bold text-white">Create New Research Workspace</h3>
                                <button onClick={() => setShowCreateModal(false)} className="text-zinc-550 hover:text-white cursor-pointer">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <form onSubmit={handleCreateProject} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-zinc-450">Project Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newProject.name}
                                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                                        placeholder="e.g. SaaS Competitor Audit"
                                        className="w-full px-3 py-2 glass-input text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-zinc-455">Description</label>
                                    <textarea
                                        value={newProject.description}
                                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                        placeholder="Details regarding target research criteria..."
                                        rows={2}
                                        className="w-full px-3 py-2 glass-input text-xs resize-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-zinc-450">Industry</label>
                                        <select
                                            value={newProject.industry}
                                            onChange={(e) => setNewProject({ ...newProject, industry: e.target.value })}
                                            className="w-full px-2.5 py-1.5 rounded-lg glass-panel border border-zinc-800 text-zinc-300 text-xs bg-zinc-955 focus:outline-none"
                                        >
                                            {industries.filter(i => i !== "All").map(i => (
                                                <option key={i} value={i}>{i}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-zinc-455">Timeline</label>
                                        <input
                                            type="text"
                                            value={newProject.research_timeline}
                                            onChange={(e) => setNewProject({ ...newProject, research_timeline: e.target.value })}
                                            placeholder="e.g. Q3 2026"
                                            className="w-full px-3 py-1.5 glass-input text-xs"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-800 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-3.5 py-1.5 rounded-lg hover:bg-zinc-800 text-zinc-455 text-xs font-semibold cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
                                    >
                                        Build Workspace
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* RENAME PROJECT MODAL */}
            <AnimatePresence>
                {showRenameModal && selectedProject && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-sm glass-panel rounded-xl p-6 border-zinc-800 bg-[#0c0c0e]/95"
                        >
                            <h3 className="text-xs font-bold text-white mb-4">Rename Workspace</h3>
                            <form onSubmit={handleRenameSubmit} className="space-y-4">
                                <input
                                    type="text"
                                    required
                                    value={renameName}
                                    onChange={(e) => setRenameName(e.target.value)}
                                    placeholder="Enter new workspace name..."
                                    className="w-full px-3 py-2 glass-input text-xs"
                                />
                                <div className="flex justify-end gap-2.5 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => { setShowRenameModal(false); setSelectedProject(null); }}
                                        className="px-3 py-1.5 rounded-md hover:bg-zinc-800 text-zinc-455 text-xs font-semibold cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* DELETE PROJECT MODAL */}
            <AnimatePresence>
                {showDeleteModal && selectedProject && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-sm glass-panel rounded-xl p-6 border-zinc-800 bg-[#0c0c0e]/95 space-y-4"
                        >
                            <div className="space-y-1.5">
                                <h3 className="text-xs font-bold text-white">Delete Research Workspace?</h3>
                                <p className="text-xs text-zinc-455 leading-relaxed">
                                    Are you sure you want to permanently delete **{selectedProject.name}**? This action destroys all compiled databases.
                                </p>
                            </div>
                            <div className="flex justify-end gap-2.5 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setShowDeleteModal(false); setSelectedProject(null); }}
                                    className="px-3 py-1.5 rounded-md hover:bg-zinc-800 text-zinc-455 text-xs font-semibold cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteProject}
                                    className="px-3 py-1.5 rounded-md bg-red-650 hover:bg-red-600 text-white text-xs font-semibold cursor-pointer"
                                >
                                    Delete Workspace
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* UNIFIED COMPREHENSIVE ADD SOURCE DIALOG MODAL */}
            <AnimatePresence>
                {showAddSourceModal && activeProject && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-xl glass-panel rounded-xl p-6 border-zinc-800 bg-[#0c0c0e]/97 flex flex-col max-h-[90vh] overflow-hidden"
                        >
                            <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-4 shrink-0">
                                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                                    <FileUp className="w-4 h-4 text-indigo-400" /> Ingest Source Material
                                </h3>
                                <button onClick={() => setShowAddSourceModal(false)} className="text-zinc-555 hover:text-white cursor-pointer">
                                    <X className="w-4.5 h-4.5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4 shrink-0">
                                {[
                                    { id: "url", label: "Web Link", icon: Globe },
                                    { id: "pdf", label: "PDF Document", icon: FileText },
                                    { id: "paper", label: "Paper", icon: BookOpen },
                                    { id: "youtube", label: "YouTube", icon: Video },
                                    { id: "gdrive", label: "G Drive", icon: HardDrive },
                                    { id: "notes", label: "Notes", icon: Edit3 }
                                ].map(btn => {
                                    const Icon = btn.icon;
                                    const isSel = sourceFormType === btn.id;
                                    return (
                                        <button
                                            key={btn.id}
                                            type="button"
                                            onClick={() => {
                                                setSourceFormType(btn.id as any);
                                                setSourceIn({
                                                    title: "",
                                                    author: btn.id === "notes" ? (user?.full_name || "") : "",
                                                    organization: "",
                                                    publication_date: btn.id === "notes" ? new Date().toISOString().split("T")[0] : "",
                                                    source_url: "",
                                                    credibility_score: btn.id === "paper" ? 98 : btn.id === "pdf" ? 90 : btn.id === "url" ? 85 : 80,
                                                    tags: "",
                                                    content: ""
                                                });
                                            }}
                                            className={`py-2 px-1 rounded-lg border text-[10px] font-semibold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                                                isSel 
                                                    ? "bg-indigo-600/15 border-indigo-500 text-indigo-200" 
                                                    : "bg-zinc-900/40 border-zinc-850 text-zinc-400 hover:text-zinc-200"
                                            }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span>{btn.label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex-1 overflow-y-auto pr-1">
                                {sourceFormType === "gdrive" ? (
                                    <div className="space-y-4 py-2">
                                        <div className="p-3 bg-zinc-950/40 rounded-lg border border-zinc-900 text-[11px] text-zinc-400 flex items-center gap-2">
                                            <HardDrive className="w-4.5 h-4.5 text-indigo-400 shrink-0" />
                                            <span>Select files from Inquira sandbox to sync in this workspace:</span>
                                        </div>
                                        <div className="space-y-2.5">
                                            {mockGDriveFiles.map((file, i) => (
                                                <div 
                                                    key={i}
                                                    onClick={() => handleIngestGDriveFile(i)}
                                                    className="p-3.5 rounded-xl glass-panel border-zinc-855 hover:border-indigo-500/40 hover:bg-zinc-900/30 flex items-center justify-between cursor-pointer transition-all group"
                                                >
                                                    <div className="min-w-0 pr-4">
                                                        <h5 className="font-semibold text-xs text-white group-hover:text-indigo-400 transition-colors truncate">{file.title}</h5>
                                                        <p className="text-[10px] text-zinc-500 mt-1 truncate">Owner: {file.author} | Org: {file.org} | Date: {file.date}</p>
                                                    </div>
                                                    <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider bg-indigo-950/20 border border-indigo-900/10 px-2 py-0.5 rounded shrink-0">
                                                        Ingest
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleAddSourceSubmit} className="space-y-4 py-1.5">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[9px] uppercase font-bold text-zinc-455">Title</label>
                                                <input 
                                                    type="text" required
                                                    value={sourceIn.title}
                                                    onChange={(e) => setSourceIn({ ...sourceIn, title: e.target.value })}
                                                    placeholder="e.g. Q3 Market Review"
                                                    className="w-full px-3 py-2 glass-input text-xs"
                                                />
                                            </div>

                                            {sourceFormType === "url" || sourceFormType === "youtube" ? (
                                                <div className="space-y-1">
                                                    <label className="text-[9px] uppercase font-bold text-zinc-455">URL Link</label>
                                                    <input 
                                                        type="url" required
                                                        value={sourceIn.source_url}
                                                        onChange={(e) => setSourceIn({ ...sourceIn, source_url: e.target.value })}
                                                        placeholder={sourceFormType === "youtube" ? "https://youtube.com/watch?v=..." : "https://company.com/report"}
                                                        className="w-full px-3 py-2 glass-input text-xs"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="space-y-1">
                                                    <label className="text-[9px] uppercase font-bold text-zinc-455">Author</label>
                                                    <input 
                                                        type="text"
                                                        value={sourceIn.author}
                                                        onChange={(e) => setSourceIn({ ...sourceIn, author: e.target.value })}
                                                        placeholder="Sarah Jenkins"
                                                        className="w-full px-3 py-2 glass-input text-xs"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[9px] uppercase font-bold text-zinc-455">Organization</label>
                                                <input 
                                                    type="text"
                                                    value={sourceIn.organization}
                                                    onChange={(e) => setSourceIn({ ...sourceIn, organization: e.target.value })}
                                                    placeholder="e.g. MIT Press or TechPulse"
                                                    className="w-full px-3 py-2 glass-input text-xs"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[9px] uppercase font-bold text-zinc-455">Publication Date</label>
                                                <input 
                                                    type="text"
                                                    value={sourceIn.publication_date}
                                                    onChange={(e) => setSourceIn({ ...sourceIn, publication_date: e.target.value })}
                                                    placeholder="e.g. 2026-07-08"
                                                    className="w-full px-3 py-2 glass-input text-xs"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[9px] uppercase font-bold text-zinc-455">Tags (comma-separated)</label>
                                                <input 
                                                    type="text"
                                                    value={sourceIn.tags}
                                                    onChange={(e) => setSourceIn({ ...sourceIn, tags: e.target.value })}
                                                    placeholder="trends, analytics"
                                                    className="w-full px-3 py-2 glass-input text-xs"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                            <div className="md:col-span-1 space-y-1.5">
                                                <div className="flex justify-between text-[9px] uppercase font-bold text-zinc-455">
                                                    <span>Credibility Score</span>
                                                    <span className="text-indigo-400">{sourceIn.credibility_score}%</span>
                                                </div>
                                                <input 
                                                    type="range" min={0} max={100} step={5}
                                                    value={sourceIn.credibility_score}
                                                    onChange={(e) => setSourceIn({ ...sourceIn, credibility_score: parseInt(e.target.value) || 80 })}
                                                    className="w-full accent-indigo-500 cursor-pointer h-1 bg-zinc-800 rounded-lg appearance-none"
                                                />
                                            </div>

                                            {sourceFormType === "pdf" && (
                                                <div className="md:col-span-2 border border-dashed border-zinc-800 rounded-lg p-2.5 flex items-center justify-center gap-2 bg-zinc-950/20 text-[10px] text-zinc-400">
                                                    <FileUp className="w-4 h-4 text-indigo-400" />
                                                    <span>PDF Drag &amp; Drop mock active. Auto loaded.</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[9px] uppercase font-bold text-zinc-455">
                                                {sourceFormType === "notes" ? "Note Content" : "Ingested / Clipboard Text Content"}
                                            </label>
                                            <textarea 
                                                required
                                                value={sourceIn.content}
                                                onChange={(e) => setSourceIn({ ...sourceIn, content: e.target.value })}
                                                placeholder={
                                                    sourceFormType === "notes"
                                                        ? "Write your manual research notes here..."
                                                        : "Paste full-text content of the document/transcript/website for AI chat queries..."
                                                }
                                                rows={5}
                                                className="w-full px-3 py-2 glass-input text-xs resize-none"
                                            />
                                        </div>

                                        <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-800 mt-6">
                                            <button
                                                type="button"
                                                onClick={() => setShowAddSourceModal(false)}
                                                className="px-3.5 py-1.5 rounded-lg hover:bg-zinc-800 text-zinc-455 text-xs font-semibold cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-3.5 py-1.5 rounded-lg bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
                                            >
                                                Ingest Source
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ADD EVIDENCE DIALOG MODAL (Airtable Form) */}
            <AnimatePresence>
                {showAddEvidenceModal && activeProject && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-lg glass-panel rounded-xl p-6 border-zinc-800 bg-[#0c0c0e]/97 flex flex-col max-h-[90vh] overflow-hidden"
                        >
                            <div className="flex justify-between items-center border-b border-zinc-850 pb-3 mb-4 shrink-0">
                                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                                    <BookmarkPlus className="w-4 h-4 text-indigo-400" /> Create Evidence Record
                                </h3>
                                <button onClick={() => setShowAddEvidenceModal(false)} className="text-zinc-555 hover:text-white cursor-pointer">
                                    <X className="w-4.5 h-4.5" />
                                </button>
                            </div>

                            <form onSubmit={handleAddEvidenceSubmit} className="space-y-4 overflow-y-auto pr-1">
                                <div className="space-y-1">
                                    <label className="text-[9px] uppercase font-bold text-zinc-455">Evidence Claim (Title)</label>
                                    <input 
                                        type="text" required
                                        value={newEvidence.claim}
                                        onChange={e => setNewEvidence({ ...newEvidence, claim: e.target.value })}
                                        placeholder="e.g. Speed improvements in grid sync index"
                                        className="w-full px-3 py-2 glass-input text-xs"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] uppercase font-bold text-zinc-455">Supporting Quote / Evidence Text</label>
                                    <textarea 
                                        required
                                        value={newEvidence.supporting_evidence}
                                        onChange={e => setNewEvidence({ ...newEvidence, supporting_evidence: e.target.value })}
                                        placeholder="The exact quote or data finding that supports this claim..."
                                        rows={3}
                                        className="w-full px-3 py-2 glass-input text-xs resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] uppercase font-bold text-zinc-455">Source Document</label>
                                        <input 
                                            type="text" required
                                            value={newEvidence.source}
                                            onChange={e => setNewEvidence({ ...newEvidence, source: e.target.value })}
                                            placeholder="e.g. Industry Analysis Report.pdf"
                                            className="w-full px-3 py-2 glass-input text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] uppercase font-bold text-zinc-455">Publication Date</label>
                                        <input 
                                            type="text"
                                            value={newEvidence.publication_date}
                                            onChange={e => setNewEvidence({ ...newEvidence, publication_date: e.target.value })}
                                            placeholder="e.g. 2026-07"
                                            className="w-full px-3 py-2 glass-input text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] uppercase font-bold text-zinc-455">Type</label>
                                        <select
                                            value={newEvidence.evidence_type}
                                            onChange={e => setNewEvidence({ ...newEvidence, evidence_type: e.target.value })}
                                            className="w-full px-2.5 py-1.5 rounded-lg glass-panel border border-zinc-800 text-zinc-350 text-xs bg-zinc-950 focus:outline-none"
                                        >
                                            <option value="Metric">Metric</option>
                                            <option value="Quote">Quote</option>
                                            <option value="Trend">Trend</option>
                                            <option value="Stat">Stat</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[9px] uppercase font-bold text-zinc-455">Confidence</label>
                                        <select
                                            value={newEvidence.confidence_level}
                                            onChange={e => setNewEvidence({ ...newEvidence, confidence_level: e.target.value })}
                                            className="w-full px-2.5 py-1.5 rounded-lg glass-panel border border-zinc-800 text-zinc-350 text-xs bg-zinc-950 focus:outline-none"
                                        >
                                            <option value="High">High</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Low">Low</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[9px] uppercase font-bold text-zinc-455">Priority</label>
                                        <select
                                            value={newEvidence.priority}
                                            onChange={e => setNewEvidence({ ...newEvidence, priority: e.target.value })}
                                            className="w-full px-2.5 py-1.5 rounded-lg glass-panel border border-zinc-800 text-zinc-350 text-xs bg-zinc-955 focus:outline-none"
                                        >
                                            <option value="Critical">Critical</option>
                                            <option value="High">High</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Low">Low</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] uppercase font-bold text-zinc-455">Business Impact Analysis</label>
                                    <input 
                                        type="text"
                                        value={newEvidence.business_impact}
                                        onChange={e => setNewEvidence({ ...newEvidence, business_impact: e.target.value })}
                                        placeholder="Key strategic outcome..."
                                        className="w-full px-3 py-2 glass-input text-xs"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] uppercase font-bold text-zinc-455">Recommendation</label>
                                        <input 
                                            type="text"
                                            value={newEvidence.recommendation}
                                            onChange={e => setNewEvidence({ ...newEvidence, recommendation: e.target.value })}
                                            placeholder="Suggested action item..."
                                            className="w-full px-3 py-2 glass-input text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] uppercase font-bold text-zinc-455">Flagged Risk</label>
                                        <input 
                                            type="text"
                                            value={newEvidence.risk}
                                            onChange={e => setNewEvidence({ ...newEvidence, risk: e.target.value })}
                                            placeholder="Potential constraint..."
                                            className="w-full px-3 py-2 glass-input text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-850 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddEvidenceModal(false)}
                                        className="px-3.5 py-1.5 rounded-lg hover:bg-zinc-800 text-zinc-455 text-xs font-semibold cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-3.5 py-1.5 rounded-lg bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
                                    >
                                        Save Record
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* AUTOMATIC STRUCTURED RESEARCH AI INSIGHTS DRAWER */}
            <AnimatePresence>
                {selectedInsightSource && (
                    <>
                        <div 
                            onClick={() => setSelectedInsightSource(null)}
                            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity"
                        />
                        
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 220 }}
                            className="fixed right-0 top-0 h-full w-full max-w-lg bg-[#08080a] border-l border-zinc-800 shadow-2xl z-50 flex flex-col"
                        >
                            {/* Drawer Header */}
                            <div className="p-6 border-b border-zinc-850/65 flex flex-col gap-3 shrink-0">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                                            {selectedInsightSource.source_type}
                                        </div>
                                        <h3 className="text-sm font-bold text-white tracking-tight leading-snug pr-4">
                                            {selectedInsightSource.title}
                                        </h3>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedInsightSource(null)}
                                        className="text-zinc-555 hover:text-white p-1 rounded-md hover:bg-zinc-900 cursor-pointer"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="text-[10px] text-zinc-450 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-zinc-900 pt-3">
                                    <span>Author: {selectedInsightSource.author || "Anonymous"}</span>
                                    {selectedInsightSource.organization && <span>• Org: {selectedInsightSource.organization}</span>}
                                    <span>• Ingested: {selectedInsightSource.publication_date || "2026"}</span>
                                </div>

                                <div className="flex items-center justify-between gap-4 mt-3 border-t border-zinc-900 pt-3">
                                    <div className="flex gap-2 text-xs">
                                        <button
                                            onClick={() => setInsightsDrawerTab("findings")}
                                            className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                                                insightsDrawerTab === "findings" 
                                                    ? "bg-zinc-800/80 text-white border border-zinc-700" 
                                                    : "text-zinc-450 hover:text-zinc-200"
                                            }`}
                                        >
                                            Findings &amp; Metrics
                                        </button>
                                        <button
                                            onClick={() => setInsightsDrawerTab("splits")}
                                            className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                                                insightsDrawerTab === "splits" 
                                                    ? "bg-zinc-800/80 text-white border border-zinc-700" 
                                                    : "text-zinc-455 hover:text-zinc-200"
                                            }`}
                                        >
                                            Facts vs Speculations
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-[9px] uppercase font-bold text-zinc-550">Confidence</span>
                                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                            {selectedInsightSource.analysis_confidence || 95}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Drawer Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                <div className="space-y-2">
                                    <h4 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Executive Summary</h4>
                                    <p className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-900 text-xs text-zinc-300 leading-relaxed font-sans italic">
                                        "{selectedInsightSource.analysis_summary}"
                                    </p>
                                </div>

                                {selectedInsightSource.analysis_keywords && (
                                    <div className="flex flex-wrap gap-1.5 items-center">
                                        <span className="text-[9px] uppercase font-bold text-zinc-550 mr-1">Focus Areas:</span>
                                        {selectedInsightSource.analysis_keywords.split(",").map((kw, i) => (
                                            <span key={i} className="text-[9px] font-semibold text-indigo-400 px-2 py-0.5 rounded bg-indigo-950/20 border border-indigo-900/10">
                                                {kw.trim()}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <AnimatePresence mode="wait">
                                    {insightsDrawerTab === "findings" ? (
                                        <motion.div
                                            key="findings"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.15 }}
                                            className="space-y-6"
                                        >
                                            <div className="space-y-2">
                                                <h4 className="text-[10px] uppercase font-bold text-zinc-550 tracking-wider">Key Findings</h4>
                                                <ul className="space-y-2 text-xs text-zinc-300">
                                                    {JSON.parse(selectedInsightSource.analysis_findings || "[]").map((fd: string, i: number) => (
                                                        <li key={i} className="flex gap-2 px-3 py-2 rounded-lg bg-zinc-900/20 border border-zinc-900/40">
                                                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                                            <span>{fd}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="space-y-2">
                                                <h4 className="text-[10px] uppercase font-bold text-zinc-550 tracking-wider">Important Statistics</h4>
                                                <div className="p-4 rounded-xl bg-indigo-950/10 border border-indigo-900/15 space-y-2">
                                                    {JSON.parse(selectedInsightSource.analysis_stats || "[]").map((st: string, i: number) => (
                                                        <div key={i} className="flex items-start gap-2 text-xs text-indigo-200">
                                                            <TrendingUp className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                                                            <span>{st}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <h4 className="text-[10px] uppercase font-bold text-zinc-555 tracking-wider">Business Insights</h4>
                                                <div className="space-y-2 text-xs text-zinc-300">
                                                    {JSON.parse(selectedInsightSource.analysis_insights || "[]").map((ins: string, i: number) => (
                                                        <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-zinc-900/25 border border-zinc-900">
                                                            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
                                                            <span>{ins}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <h4 className="text-[10px] uppercase font-bold text-zinc-555 tracking-wider">Direct Quotes &amp; Citations</h4>
                                                {JSON.parse(selectedInsightSource.analysis_quotes || "[]").map((q: any, i: number) => (
                                                    <div key={i} className="p-3.5 rounded-xl glass-panel border-zinc-900 bg-zinc-950/20 relative group/quote">
                                                        <blockquote className="text-[11px] text-zinc-350 border-l-2 border-indigo-500/50 pl-3 italic">
                                                            "{q.quote}"
                                                        </blockquote>
                                                        <div className="flex justify-between items-center text-[9px] text-zinc-550 border-t border-zinc-900/40 pt-2.5 mt-3">
                                                            <span>Citation: {q.citation}</span>
                                                            <button 
                                                                onClick={() => handleClipQuoteToEvidence(q.quote, q.citation)}
                                                                className="text-indigo-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                                                            >
                                                                <BookmarkPlus className="w-3.5 h-3.5" />
                                                                Clip Quote
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="splits"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.15 }}
                                            className="space-y-6"
                                        >
                                            {/* Verified Facts */}
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-1.5">
                                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                    <h4 className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Verified Facts</h4>
                                                </div>
                                                <div className="space-y-2 text-xs text-zinc-350 bg-zinc-950/20 p-3.5 rounded-xl border border-zinc-900">
                                                    {JSON.parse(selectedInsightSource.verified_facts || "[]").map((item: string, i: number) => (
                                                        <div key={i} className="flex gap-2 py-1 border-b border-zinc-900/40 last:border-b-0">
                                                            <span className="text-zinc-600 font-bold shrink-0">{i+1}.</span>
                                                            <span>{item}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* AI Interpretation */}
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-1.5">
                                                    <Cpu className="w-4 h-4 text-indigo-400" />
                                                    <h4 className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">AI Interpretation</h4>
                                                </div>
                                                <div className="space-y-2 text-xs text-zinc-350 bg-zinc-950/20 p-3.5 rounded-xl border border-zinc-900">
                                                    {JSON.parse(selectedInsightSource.ai_interpretation || "[]").map((item: string, i: number) => (
                                                        <div key={i} className="flex gap-2 py-1 border-b border-zinc-900/40 last:border-b-0">
                                                            <span className="text-zinc-600 font-bold shrink-0">{i+1}.</span>
                                                            <span>{item}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Assumptions */}
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-1.5">
                                                    <HelpCircle className="w-4 h-4 text-amber-500" />
                                                    <h4 className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Assumptions</h4>
                                                </div>
                                                <div className="space-y-2 text-xs text-zinc-350 bg-zinc-950/20 p-3.5 rounded-xl border border-zinc-900">
                                                    {JSON.parse(selectedInsightSource.assumptions || "[]").map((item: string, i: number) => (
                                                        <div key={i} className="flex gap-2 py-1 border-b border-zinc-900/40 last:border-b-0">
                                                            <span className="text-zinc-650 font-bold shrink-0">{i+1}.</span>
                                                            <span>{item}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Open Questions */}
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-1.5">
                                                    <AlertCircle className="w-4 h-4 text-indigo-400" />
                                                    <h4 className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Open Questions</h4>
                                                </div>
                                                <div className="space-y-2 text-xs text-zinc-350 bg-zinc-950/20 p-3.5 rounded-xl border border-zinc-900">
                                                    {JSON.parse(selectedInsightSource.open_questions || "[]").map((item: string, i: number) => (
                                                        <div key={i} className="flex gap-2 py-1 border-b border-zinc-900/40 last:border-b-0">
                                                            <span className="text-zinc-650 font-bold shrink-0">{i+1}.</span>
                                                            <span>{item}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* GOOGLE SLIDES INSTRUCTIONS MODAL */}
            {showGoogleSlidesModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-md glass-panel rounded-2xl p-6 border-zinc-800 bg-[#0c0c0e]/95 space-y-4"
                    >
                        <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <Compass className="w-4 h-4 text-indigo-400" />
                                Google Slides Export Instructions
                            </h3>
                            <button
                                onClick={() => setShowGoogleSlidesModal(false)}
                                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="text-xs text-zinc-350 space-y-3 leading-relaxed">
                            <p>
                                Google Slides does not support direct browser-triggered downloads, but you can import your downloaded PowerPoint presentation instantly:
                            </p>
                            <ol className="list-decimal pl-4.5 space-y-2 text-zinc-400">
                                <li>The MS PowerPoint file (<code className="text-indigo-400 font-mono">.pptx</code>) was just downloaded to your local downloads folder.</li>
                                <li>Open <a href="https://drive.google.com" target="_blank" rel="noreferrer" className="text-indigo-455 hover:underline font-semibold">Google Drive</a> in your browser.</li>
                                <li>Drag and drop the downloaded <code className="text-zinc-300">.pptx</code> file into Google Drive.</li>
                                <li>Once uploaded, double-click the file in your drive and select <strong>Open with Google Slides</strong> from the top menu.</li>
                            </ol>
                            <p className="text-[10px] text-zinc-550 italic pt-1">
                                Google Slides will automatically preserve slide titles, subtitle alignments, widescreen sizing, bullet spacing, and your custom presenter speaker notes!
                            </p>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                onClick={() => setShowGoogleSlidesModal(false)}
                                className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs cursor-pointer active:scale-95 transition-all shadow-lg"
                            >
                                Got it, thanks!
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* GLOBAL COMMAND SEARCH MENU MODAL */}
            {showSearchModal && (
                <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/80 backdrop-blur-sm pt-20">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-lg glass-panel rounded-2xl border border-zinc-800 bg-[#0c0c0e]/95 shadow-2xl overflow-hidden flex flex-col max-h-[450px]"
                    >
                        <div className="p-4 border-b border-zinc-900 flex items-center gap-3">
                            <Search className="w-4 h-4 text-indigo-400 shrink-0" />
                            <input
                                type="text"
                                autoFocus
                                value={searchQueryGlobal}
                                onChange={(e) => setSearchQueryGlobal(e.target.value)}
                                placeholder="Search projects, sources, claims..."
                                className="flex-1 bg-transparent text-xs text-white border-none focus:outline-none placeholder-zinc-550"
                            />
                            <button
                                onClick={() => { setShowSearchModal(false); setSearchQueryGlobal(""); }}
                                className="text-[10px] bg-zinc-900 px-2 py-1 rounded text-zinc-400 hover:text-white border border-zinc-800 cursor-pointer"
                            >
                                Esc
                            </button>
                        </div>

                        {/* Search results list */}
                        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 min-h-[200px]">
                            {(() => {
                                const q = searchQueryGlobal.toLowerCase().trim();
                                if (!q) {
                                    return (
                                        <div className="text-center py-10 text-[10px] text-zinc-550 italic">
                                            Type query to search projects, source names, and claims database...
                                        </div>
                                    );
                                }

                                const matchedProjects = projects.filter(p => 
                                    p.name.toLowerCase().includes(q) || (p.industry && p.industry.toLowerCase().includes(q))
                                );
                                const matchedSources = sources.filter(s => 
                                    s.title.toLowerCase().includes(q) || (s.author && s.author.toLowerCase().includes(q)) || (s.tags && s.tags.toLowerCase().includes(q))
                                );
                                const matchedClaims = evidence.filter(ev => 
                                    ev.claim.toLowerCase().includes(q) || (ev.supporting_evidence?.toLowerCase().includes(q) || false)
                                );

                                if (matchedProjects.length === 0 && matchedSources.length === 0 && matchedClaims.length === 0) {
                                    return (
                                        <div className="text-center py-10 text-[10px] text-zinc-500 font-semibold">
                                            No matches found for "{searchQueryGlobal}"
                                        </div>
                                    );
                                }

                                return (
                                    <>
                                        {/* Projects Section */}
                                        {matchedProjects.length > 0 && (
                                            <div className="space-y-1">
                                                <div className="text-[9px] uppercase font-bold text-zinc-500 px-2 pt-1">Projects</div>
                                                {matchedProjects.map(p => (
                                                    <div
                                                        key={`proj-${p.id}`}
                                                        onClick={() => {
                                                            openWorkspace(p);
                                                            setShowSearchModal(false);
                                                            setSearchQueryGlobal("");
                                                            showToast(`Opened project: ${p.name}`, "success");
                                                        }}
                                                        className="p-2.5 rounded-lg hover:bg-indigo-950/20 hover:text-indigo-300 text-xs text-zinc-300 cursor-pointer flex justify-between items-center transition-colors"
                                                    >
                                                        <span className="font-semibold truncate">{p.name}</span>
                                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 uppercase">{p.industry}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Sources Section */}
                                        {matchedSources.length > 0 && (
                                            <div className="space-y-1 pt-2">
                                                <div className="text-[9px] uppercase font-bold text-zinc-500 px-2 pt-1">Sources</div>
                                                {matchedSources.map(s => (
                                                    <div
                                                        key={`src-${s.id}`}
                                                        onClick={() => {
                                                            setWorkspaceTab("sources");
                                                            setSelectedInsightSource(s);
                                                            setShowSearchModal(false);
                                                            setSearchQueryGlobal("");
                                                        }}
                                                        className="p-2.5 rounded-lg hover:bg-indigo-950/20 hover:text-indigo-300 text-xs text-zinc-300 cursor-pointer flex justify-between items-center transition-colors"
                                                    >
                                                        <span className="font-semibold truncate">{s.title}</span>
                                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 uppercase">{s.source_type}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Evidence Claims Section */}
                                        {matchedClaims.length > 0 && (
                                            <div className="space-y-1 pt-2">
                                                <div className="text-[9px] uppercase font-bold text-zinc-500 px-2 pt-1">Claims &amp; Evidence</div>
                                                {matchedClaims.map((ev, i) => (
                                                    <div
                                                        key={`claim-${i}`}
                                                        onClick={() => {
                                                            setWorkspaceTab("evidence");
                                                            setGlobalFilter(ev.claim);
                                                            setShowSearchModal(false);
                                                            setSearchQueryGlobal("");
                                                        }}
                                                        className="p-2.5 rounded-lg hover:bg-indigo-950/20 hover:text-indigo-300 text-xs text-zinc-350 cursor-pointer flex flex-col gap-0.5 transition-colors"
                                                    >
                                                        <span className="font-bold text-zinc-200 truncate">{ev.claim}</span>
                                                        <span className="text-[9px] text-zinc-500 line-clamp-1 italic">"{ev.supporting_evidence || ""}"</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    </motion.div>
                </div>
            )}

            {/* KEYBOARD SHORTCUTS CHEAT SHEET MODAL */}
            {showShortcutsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-sm glass-panel rounded-2xl p-6 border border-zinc-800 bg-[#0c0c0e]/95 space-y-4 shadow-2xl"
                    >
                        <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                                <HelpCircle className="w-4 h-4 text-indigo-400" />
                                Keyboard Shortcuts Guide
                            </h3>
                            <button
                                onClick={() => setShowShortcutsModal(false)}
                                className="text-zinc-550 hover:text-white transition-colors cursor-pointer border-none bg-transparent"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-3.5 pt-1 text-xs">
                            {[
                                { key: "Ctrl + K", desc: "Toggle Global Search Command Menu" },
                                { key: "?", desc: "Toggle Keyboard Shortcuts Guide" },
                                { key: "Esc", desc: "Close Modal / Exit Workspace to Hub" },
                                { key: "1", desc: "Switch view to Overview tab" },
                                { key: "2", desc: "Switch view to Sources Library tab" },
                                { key: "3", desc: "Switch view to Evidence Database tab" },
                                { key: "4", desc: "Switch view to Consulting Brief tab" },
                                { key: "5", desc: "Switch view to Implementation Action Plan" },
                                { key: "6", desc: "Switch view to Widescreen Presentation" },
                                { key: "7", desc: "Switch view to Audit History logs" }
                            ].map((shortcut, i) => (
                                <div key={i} className="flex justify-between items-center text-zinc-350">
                                    <span>{shortcut.desc}</span>
                                    <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-indigo-400 font-mono">
                                        {shortcut.key}
                                    </kbd>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                onClick={() => setShowShortcutsModal(false)}
                                className="px-4 py-2 rounded bg-indigo-650 hover:bg-indigo-500 text-white font-semibold text-xs cursor-pointer active:scale-95 transition-all shadow-lg"
                            >
                                Got it, thanks!
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* PROJECT SHARING LINKS CONFIG MODAL */}
            {showShareModal && activeProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-sm glass-panel rounded-2xl p-6 border border-zinc-800 bg-[#0c0c0e]/95 space-y-4 shadow-2xl"
                    >
                        <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                                <Share2 className="w-4 h-4 text-indigo-400" />
                                Project Sharing Portal
                            </h3>
                            <button
                                onClick={() => setShowShareModal(false)}
                                className="text-zinc-550 hover:text-white transition-colors cursor-pointer border-none bg-transparent"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4 pt-1 text-xs">
                            <div className="space-y-1.5">
                                <label className="text-[9px] uppercase font-bold text-zinc-500 block">Workspace Public Link</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={`http://localhost:3000/shared/project_${activeProject.id}`}
                                        className="flex-1 px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 focus:outline-none"
                                    />
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(`http://localhost:3000/shared/project_${activeProject.id}`);
                                            showToast("Public link copied to clipboard!", "success");
                                        }}
                                        className="px-3 py-1.5 rounded bg-indigo-650 hover:bg-indigo-500 text-white font-semibold text-[10px] cursor-pointer"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between py-2 border-t border-b border-zinc-900">
                                <div className="space-y-0.5">
                                    <span className="font-bold text-white text-xs block">Allow Public Read Access</span>
                                    <span className="text-[10px] text-zinc-550">Let anyone with the link view this briefing space.</span>
                                </div>
                                <button className="w-9 h-5.5 rounded-full bg-indigo-600 p-0.5 relative transition-colors cursor-pointer">
                                    <div className="w-4 h-4 rounded-full bg-white translate-x-3.5 transition-all" />
                                </button>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] uppercase font-bold text-zinc-500 block">Collaborator Default Role</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button className="py-2 rounded border border-indigo-550/40 bg-indigo-650/10 text-indigo-300 font-bold text-center text-xs">
                                        Viewer (Read-Only)
                                    </button>
                                    <button className="py-2 rounded border border-zinc-800 bg-zinc-950/30 text-zinc-450 font-bold text-center text-xs hover:border-zinc-700 transition-colors">
                                        Editor (Write Access)
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                onClick={() => setShowShareModal(false)}
                                className="px-4 py-2 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-350 font-semibold text-xs cursor-pointer"
                            >
                                Close sharing portal
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* PRINT-ONLY PRESENTATION SLIDESHOW SHEETS CONTAINER */}
            {activeProject && activeProject.presentation_slides && (() => {
                try {
                    const slides = JSON.parse(activeProject.presentation_slides);
                    return (
                        <div className="hidden print:block w-full bg-white text-zinc-950 p-0 m-0 min-h-screen">
                            {slides.map((sl: any, idx: number) => (
                                <div 
                                    key={idx} 
                                    className="p-16 border-b border-zinc-200 min-h-screen flex flex-col justify-between"
                                    style={{ pageBreakAfter: "always" }}
                                >
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-zinc-400 border-b border-zinc-200 pb-2">
                                            <span>Slide {sl.slide_number} of {slides.length}</span>
                                            <span>Inquira Slide Deck</span>
                                        </div>
                                        <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight pt-4">
                                            {sl.title}
                                        </h2>
                                        {sl.subtitle && (
                                            <p className="text-sm italic text-indigo-600 font-medium">
                                                {sl.subtitle}
                                            </p>
                                        )}
                                        <ul className="list-disc pl-6 space-y-3.5 pt-4 text-base text-zinc-800 leading-relaxed">
                                            {sl.bullets?.map((b: string, i: number) => (
                                                <li key={i}>{b}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="pt-8 mt-12 border-t border-zinc-100 space-y-2">
                                        <span className="text-[10px] uppercase font-extrabold text-zinc-450 tracking-wider block">Speaker notes:</span>
                                        <p className="text-xs italic text-zinc-700 leading-relaxed">
                                            "{sl.speaker_notes}"
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                } catch(e) {
                    return null;
                }
            })()}
        </div>
    );
}

// -------------------------------------------------------------
// NESTED COMPONENT: NotebookLM Source Library Card
// -------------------------------------------------------------
interface SourceCardProps {
    src: SourceItem;
    onToggleFavorite: (id: number, currentVal: boolean) => void;
    onDelete: (id: number) => void;
    onOpenInsights: (src: SourceItem) => void;
}

function SourceCard({ src, onToggleFavorite, onDelete, onOpenInsights }: SourceCardProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case "Website URL":
                return Globe;
            case "PDF Upload":
                return FileText;
            case "Research Paper":
                return BookOpen;
            case "YouTube Transcript":
                return Video;
            case "Google Drive":
                return HardDrive;
            case "Manual Notes":
                return Edit3;
            default:
                return Bookmark;
        }
    };

    const getCredibilityColor = (score: number) => {
        if (score >= 90) return "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]";
        if (score >= 75) return "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.3)]";
        if (score >= 60) return "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]";
        return "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]";
    };

    const Icon = getIcon(src.source_type);

    return (
        <div className="p-4 rounded-xl glass-panel border-zinc-800 flex flex-col justify-between h-48 relative hover:border-zinc-700/60 transition-colors">
            
            <div className="space-y-1 min-w-0 pr-14">
                <div className="flex items-center gap-1 text-[9px] uppercase font-bold text-zinc-500">
                    <Icon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>{src.source_type}</span>
                </div>
                <h4 className="font-bold text-white text-xs truncate leading-snug group-hover:text-indigo-400" title={src.title}>
                    {src.title}
                </h4>
            </div>

            {/* Star & Delete pinned positions */}
            <div className="absolute right-3.5 top-3.5 flex items-center gap-1.5">
                <button
                    onClick={() => onToggleFavorite(src.id, src.is_favorite)}
                    className={`p-1.5 rounded-md hover:bg-zinc-800/50 transition-colors cursor-pointer ${
                        src.is_favorite ? "text-yellow-500" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                >
                    <Star className="w-3.5 h-3.5" fill={src.is_favorite ? "currentColor" : "none"} />
                </button>
                <button
                    onClick={() => onDelete(src.id)}
                    className="p-1.5 rounded-md hover:bg-red-950/20 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className="my-2 space-y-1">
                {(src.author || src.organization) && (
                    <p className="text-[10px] text-zinc-400 truncate">
                        {src.author || "Unknown Author"} {src.organization ? `• ${src.organization}` : ""}
                    </p>
                )}
                {src.source_url && (
                    <a 
                        href={src.source_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[9px] text-indigo-400 hover:underline flex items-center gap-1 max-w-[80%] truncate"
                    >
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        {src.source_url}
                    </a>
                )}
            </div>

            {/* Bottom details: Score gauge, AI Insights Action, Pub Date */}
            <div className="pt-2 border-t border-zinc-850/50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="space-y-1 min-w-0">
                        <span className="text-[8px] uppercase font-bold text-zinc-550 block leading-none">Credibility</span>
                        <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${getCredibilityColor(src.credibility_score)}`} />
                            <span className="text-[10px] text-zinc-300 font-semibold leading-none pt-0.5">
                                {src.credibility_score}%
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => onOpenInsights(src)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-955/20 border border-indigo-900/10 hover:border-indigo-500/30 text-[9px] text-indigo-300 hover:text-white font-semibold cursor-pointer active:scale-95 transition-all"
                >
                    <Sparkles className="w-3 h-3" />
                    AI Insights
                </button>

                <div className="text-right shrink-0">
                    <span className="text-[8px] uppercase font-bold text-zinc-550 block leading-none">Published</span>
                    <span className="text-[10px] text-zinc-400 font-medium block mt-0.5 leading-none">
                        {src.publication_date || "2026"}
                    </span>
                </div>
            </div>
        </div>
    );
}
