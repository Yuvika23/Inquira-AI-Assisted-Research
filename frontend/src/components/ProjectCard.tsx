"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
    Star, 
    MoreVertical, 
    Folder, 
    Edit2, 
    Copy, 
    Archive, 
    Trash2, 
    Calendar,
    ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface Project {
    id: number;
    name: string;
    description: string | null;
    industry: string;
    status: string;
    progress: number;
    is_favorite: boolean;
    created_at: string;
    updated_at: string;
    business_question?: string | null;
    objectives?: string | null;
    keywords?: string | null;
    research_timeline?: string | null;
    executive_brief?: string | null;
    action_plan?: string | null;
    presentation_slides?: string | null;
}

interface ProjectCardProps {
    project: Project;
    onToggleFavorite: (id: number, currentVal: boolean) => void;
    onRename: (project: Project) => void;
    onDuplicate: (id: number) => void;
    onArchive: (id: number, currentStatus: string) => void;
    onDelete: (id: number) => void;
    onClick: (project: Project) => void;
}

export default function ProjectCard({
    project,
    onToggleFavorite,
    onRename,
    onDuplicate,
    onArchive,
    onDelete,
    onClick
}: ProjectCardProps) {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Get color for status badge
    const getStatusStyles = (status: string) => {
        switch (status.toLowerCase()) {
            case "active":
                return "bg-indigo-500/10 text-indigo-300 border-indigo-500/20";
            case "archived":
                return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
            case "completed":
                return "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
            default:
                return "bg-amber-500/10 text-amber-300 border-amber-500/20";
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="group relative glass-panel rounded-xl p-5 border-zinc-800/80 glass-panel-hover flex flex-col justify-between h-48 cursor-pointer overflow-hidden"
            onClick={() => onClick(project)}
        >
            {/* Star & Action Menu */}
            <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800/50 flex items-center justify-center border border-zinc-700/50 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/5 transition-all">
                        <Folder className="w-4.5 h-4.5 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <div className="min-w-0">
                        <h4 className="font-semibold text-white text-sm group-hover:text-indigo-200 transition-colors truncate">
                            {project.name}
                        </h4>
                        <span className="text-[10px] text-zinc-500 font-medium">
                            {project.industry}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => onToggleFavorite(project.id, project.is_favorite)}
                        className={`p-1.5 rounded-md hover:bg-zinc-800/50 transition-colors cursor-pointer ${
                            project.is_favorite ? "text-yellow-500" : "text-zinc-500 hover:text-zinc-300"
                        }`}
                    >
                        <Star className="w-3.5 h-3.5" fill={project.is_favorite ? "currentColor" : "none"} />
                    </button>
                    
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors cursor-pointer"
                        >
                            <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                        
                        <AnimatePresence>
                            {showMenu && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                    transition={{ duration: 0.1 }}
                                    className="absolute right-0 mt-1 w-40 rounded-lg glass-panel border border-zinc-800 shadow-xl bg-zinc-950/90 py-1 z-20 text-xs text-zinc-300"
                                >
                                    <button
                                        onClick={() => {
                                            onRename(project);
                                            setShowMenu(false);
                                        }}
                                        className="w-full text-left px-3 py-2 hover:bg-zinc-900 hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
                                    >
                                        <Edit2 className="w-3.5 h-3.5 text-zinc-400" />
                                        Rename
                                    </button>
                                    <button
                                        onClick={() => {
                                            onDuplicate(project.id);
                                            setShowMenu(false);
                                        }}
                                        className="w-full text-left px-3 py-2 hover:bg-zinc-900 hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
                                    >
                                        <Copy className="w-3.5 h-3.5 text-zinc-400" />
                                        Duplicate
                                    </button>
                                    <button
                                        onClick={() => {
                                            onArchive(project.id, project.status);
                                            setShowMenu(false);
                                        }}
                                        className="w-full text-left px-3 py-2 hover:bg-zinc-900 hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
                                    >
                                        <Archive className="w-3.5 h-3.5 text-zinc-400" />
                                        {project.status === "Archived" ? "Restore" : "Archive"}
                                    </button>
                                    <div className="border-t border-zinc-900 my-1" />
                                    <button
                                        onClick={() => {
                                            onDelete(project.id);
                                            setShowMenu(false);
                                        }}
                                        className="w-full text-left px-3 py-2 hover:bg-red-950/30 hover:text-red-400 text-red-500/90 flex items-center gap-2 cursor-pointer transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Delete
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Description or dates */}
            <div className="my-2.5">
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {project.description || "No project description provided. Click to add detailed business intelligence research specs."}
                </p>
            </div>

            {/* Status, Date, Progress Bar */}
            <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px]">
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full border text-[9px] font-semibold tracking-wide uppercase ${getStatusStyles(project.status)}`}>
                            {project.status}
                        </span>
                        <span className="text-zinc-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(project.created_at)}
                        </span>
                    </div>
                    <span className="text-zinc-400 font-semibold group-hover:text-indigo-400 transition-colors">
                        {project.progress}%
                    </span>
                </div>

                {/* Progress bar container */}
                <div className="w-full h-1.5 bg-zinc-800/80 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                    />
                </div>
            </div>
            
            {/* Micro hover icon indicator */}
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <ArrowUpRight className="w-3.5 h-3.5 text-indigo-400" />
            </div>
        </motion.div>
    );
}
