"use client";

import React from "react";
import Link from "next/link";
import { Compass, Sparkles, ArrowRight, ShieldCheck, Cpu, Globe, FolderKanban, BookOpen, FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
    return (
        <div className="relative min-h-screen flex flex-col justify-between bg-[#060608] text-zinc-100 overflow-hidden font-sans">
            {/* Ambient background meshes */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-indigo-600/10 blur-[130px] pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-[450px] h-[450px] rounded-full bg-cyan-550/5 blur-[100px] pointer-events-none" />

            {/* Header / Navbar */}
            <header className="h-16 border-b border-zinc-900/60 flex items-center justify-between px-6 md:px-12 backdrop-blur-md z-10 sticky top-0 bg-[#060608]/70">
                <div className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-indigo-400" />
                    <span className="font-black tracking-tight text-white text-sm uppercase tracking-wider font-mono">
                        Inquira
                    </span>
                </div>
                
                <nav className="hidden md:flex items-center gap-8 text-xs text-zinc-400 font-bold uppercase tracking-wider">
                    <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
                    <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
                    <Link href="/docs" className="hover:text-white transition-colors">Documentation</Link>
                    <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                </nav>

                <div className="flex items-center gap-3">
                    <Link 
                        href="/login" 
                        className="px-3.5 py-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-900/60 text-zinc-350 text-xs font-semibold hover:text-white transition-colors"
                    >
                        Sign In
                    </Link>
                    <Link 
                        href="/register" 
                        className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-650/20 transition-all hover:scale-[1.02]"
                    >
                        Start Free
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center text-center px-6 max-w-5xl mx-auto py-16 md:py-24 z-10 space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] uppercase font-bold tracking-widest"
                >
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    Consulting-Grade Intelligence Platform
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-none uppercase font-mono"
                >
                    AI-Assisted Research <br />
                    <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                        With Full Provenance
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-zinc-400 text-xs sm:text-sm max-w-xl leading-relaxed mx-auto"
                >
                    Inquira coordinates source libraries, builds claim verification databases, and synthesizes outlined briefs and widescreen slide decks with clickable citations.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-3 pt-4 w-full sm:w-auto justify-center"
                >
                    <Link
                        href="/register"
                        className="py-2.5 px-6 rounded-lg bg-indigo-650 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all active:scale-98 cursor-pointer"
                    >
                        Create Free Sandbox <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                        href="/login"
                        className="py-2.5 px-6 rounded-lg border border-zinc-800 hover:bg-zinc-900/40 text-zinc-300 font-bold text-xs hover:text-white transition-colors cursor-pointer"
                    >
                        Demo Dashboard
                    </Link>
                </motion.div>

                {/* Features Grid */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-16 w-full text-left"
                >
                    {[
                        { title: "Clean Workspaces", icon: FolderKanban, desc: "Organize projects into active, favorited, and archived sandboxes with progress charts." },
                        { title: "Verified Evidence", icon: ShieldCheck, desc: "Collate claims inside Airtable-style grids, separating facts from speculation." },
                        { title: "Outlined Reports", icon: FileText, desc: "Synthesize 10-chapter briefs and widescreen slide outlines with speaker notes." }
                    ].map((feat, i) => (
                        <div key={i} className="p-6 rounded-xl border border-zinc-850 bg-[#09090b]/40 space-y-3">
                            <div className="w-9 h-9 rounded-lg bg-indigo-950/35 border border-indigo-900/20 flex items-center justify-center text-indigo-400">
                                <feat.icon className="w-4.5 h-4.5" />
                            </div>
                            <h3 className="font-extrabold text-white text-xs leading-none">{feat.title}</h3>
                            <p className="text-[11px] text-zinc-450 leading-relaxed">{feat.desc}</p>
                        </div>
                    ))}
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="px-6 md:px-12 py-6 flex flex-col sm:flex-row justify-between items-center text-[10px] text-zinc-650 border-t border-zinc-900/40 bg-black/10 z-10 gap-3">
                <span>&copy; {new Date().getFullYear()} Inquira Inc. All rights reserved.</span>
                <div className="flex gap-6 font-semibold uppercase tracking-wider">
                    <Link href="/about" className="hover:text-white">About</Link>
                    <Link href="/pricing" className="hover:text-white">Pricing</Link>
                    <Link href="/docs" className="hover:text-white">Docs</Link>
                    <Link href="/contact" className="hover:text-white">Contact</Link>
                </div>
            </footer>
        </div>
    );
}
