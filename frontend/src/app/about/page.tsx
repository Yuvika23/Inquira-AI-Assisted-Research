"use client";

import React from "react";
import Link from "next/link";
import { Compass, ShieldCheck, Zap, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#060608] text-white flex flex-col justify-between relative overflow-hidden font-sans">
            {/* Design ambient meshes */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-650/5 blur-[120px] pointer-events-none" />

            {/* Top Navigation Bar */}
            <header className="px-6 py-4 flex justify-between items-center border-b border-zinc-900/60 backdrop-blur-md z-10 bg-black/10">
                <Link href="/" className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-indigo-400" />
                    <span className="font-black text-sm tracking-wider uppercase bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent font-mono">
                        Inquira
                    </span>
                </Link>
                <nav className="hidden sm:flex items-center gap-6 text-xs text-zinc-400 font-semibold">
                    <Link href="/about" className="text-white">About Us</Link>
                    <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
                    <Link href="/docs" className="hover:text-white transition-colors">Documentation</Link>
                    <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                </nav>
                <div className="flex items-center gap-3">
                    <Link href="/login" className="text-xs font-semibold text-zinc-400 hover:text-white px-3 py-1.5 transition-colors">Login</Link>
                    <Link href="/register" className="px-3.5 py-1.5 rounded-lg bg-indigo-650 hover:bg-indigo-500 text-white font-semibold text-xs transition-all active:scale-95 shadow-md">Sign Up</Link>
                </div>
            </header>

            {/* Core Canvas */}
            <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 md:py-20 z-10 space-y-16">
                <div className="text-center space-y-4 max-w-xl mx-auto">
                    <h2 className="text-xs font-black text-indigo-400 uppercase tracking-widest leading-none">Our Mission</h2>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">AI-assisted research you can trust.</h1>
                    <p className="text-xs text-zinc-450 leading-relaxed">
                        Inquira bridges the gap between massive literature databases and structured strategic execution. We organize knowledge, separate speculation, and build interactive intelligence pipelines.
                    </p>
                </div>

                {/* Core Values grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                    <div className="p-6 rounded-xl border border-zinc-850 bg-[#09090b]/40 space-y-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-950/40 border border-indigo-900/20 flex items-center justify-center text-indigo-400">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <h3 className="font-extrabold text-white text-xs">Verify Provenance</h3>
                        <p className="text-[11px] text-zinc-450 leading-relaxed">
                            No hallucinations. Every claim in our evidence grids traces directly back to a verified sentence block in your reference documents library.
                        </p>
                    </div>

                    <div className="p-6 rounded-xl border border-zinc-850 bg-[#09090b]/40 space-y-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-950/20 border border-emerald-900/15 flex items-center justify-center text-emerald-400">
                            <Zap className="w-5 h-5" />
                        </div>
                        <h3 className="font-extrabold text-white text-xs">Synthesize Action Plan</h3>
                        <p className="text-[11px] text-zinc-450 leading-relaxed">
                            Turn raw reading into action. We compile findings into 30-day timelines covering skills, tools, and outcomes for developers.
                        </p>
                    </div>

                    <div className="p-6 rounded-xl border border-zinc-850 bg-[#09090b]/40 space-y-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-950/30 border border-purple-900/20 flex items-center justify-center text-purple-400">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <h3 className="font-extrabold text-white text-xs">Responsible AI</h3>
                        <p className="text-[11px] text-zinc-450 leading-relaxed">
                            Moral audit trails. We highlight data collection boundaries, user note sanitization, and transparency check guidelines.
                        </p>
                    </div>
                </div>

                <div className="glass-panel border-zinc-850 bg-[#09090b]/20 p-8 rounded-2xl space-y-4 max-w-2xl mx-auto text-center border">
                    <h3 className="font-bold text-white text-base">Accelerate your team's intelligence velocity.</h3>
                    <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                        Join consulting firms, SaaS groups, and researchers indexing their source materials with Inquira today.
                    </p>
                    <div className="pt-2">
                        <Link
                            href="/register"
                            className="inline-flex px-5 py-2.5 rounded-lg bg-indigo-650 hover:bg-indigo-500 text-white font-bold text-xs transition-all active:scale-95 shadow-lg"
                        >
                            Create Free Sandbox
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer Bar */}
            <footer className="px-6 py-4 flex justify-between items-center text-[10px] text-zinc-650 border-t border-zinc-900/40 bg-black/10 z-10">
                <span>&copy; {new Date().getFullYear()} Inquira Inc. All rights reserved.</span>
                <span className="font-medium">Built for Modern Consulting</span>
            </footer>
        </div>
    );
}
