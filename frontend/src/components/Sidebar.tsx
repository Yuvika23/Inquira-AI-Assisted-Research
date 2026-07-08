"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { 
    LayoutDashboard, 
    FolderKanban, 
    FileSpreadsheet, 
    FileText, 
    BarChart3, 
    Settings, 
    LogOut,
    Menu,
    X,
    User,
    Compass
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type SidebarTab = "dashboard" | "projects" | "templates" | "reports" | "analytics" | "settings";

interface SidebarProps {
    activeTab: SidebarTab;
    setActiveTab: (tab: SidebarTab) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }: SidebarProps) {
    const { user, logout } = useAuth();

    const menuItems = [
        { id: "dashboard" as SidebarTab, label: "Dashboard", icon: LayoutDashboard },
        { id: "projects" as SidebarTab, label: "Research Projects", icon: FolderKanban },
        { id: "templates" as SidebarTab, label: "Templates", icon: FileSpreadsheet },
        { id: "reports" as SidebarTab, label: "Saved Reports", icon: FileText },
        { id: "analytics" as SidebarTab, label: "Analytics", icon: BarChart3 },
        { id: "settings" as SidebarTab, label: "Settings", icon: Settings },
    ];

    return (
        <>
            {/* Mobile Sidebar overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 z-40 bg-black/60 md:hidden backdrop-blur-xs"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar drawer */}
            <aside
                className={`fixed top-0 bottom-0 left-0 z-45 w-64 glass-panel border-r border-y-0 border-l-0 border-zinc-800/80 transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col justify-between ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex flex-col">
                    {/* Header */}
                    <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-800/50">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                                <Compass className="w-4.5 h-4.5 text-white" />
                            </div>
                            <span className="font-bold tracking-tight text-white text-sm">
                                Inquira
                            </span>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="md:hidden p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="p-4 space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                                        isActive
                                            ? "bg-indigo-600/15 border border-indigo-500/20 text-indigo-200 shadow-sm"
                                            : "border border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-indigo-400" : ""}`} />
                                    {item.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Footer User Info */}
                <div className="p-4 border-t border-zinc-800/50 bg-black/10 flex flex-col gap-3">
                    {user && (
                        <div className="flex items-center gap-3">
                            <div className="relative w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 shrink-0 overflow-hidden">
                                {user.avatar_url ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img 
                                        src={user.avatar_url} 
                                        alt={user.full_name} 
                                        className="w-full h-full object-cover" 
                                    />
                                ) : (
                                    <User className="w-4 h-4 text-zinc-400" />
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-white truncate leading-tight">
                                    {user.full_name}
                                </p>
                                <p className="text-[10px] text-zinc-500 truncate leading-none mt-0.5">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border border-zinc-800 hover:border-red-900/30 hover:bg-red-950/15 hover:text-red-400 text-zinc-400 transition-all cursor-pointer"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        Log out
                    </button>
                </div>
            </aside>
        </>
    );
}
