"use client";

import React from "react";
import Link from "next/link";
import { Compass, HelpCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#060608] text-white flex flex-col justify-between relative overflow-hidden font-sans">
            {/* Design ambient meshes */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-[300px] h-[300px] rounded-full bg-cyan-500/5 blur-[90px] pointer-events-none" />

            {/* Top Navigation */}
            <header className="px-6 py-4 flex justify-between items-center border-b border-zinc-900/60 backdrop-blur-md z-10 bg-black/10">
                <div className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-indigo-400" />
                    <span className="font-black text-sm tracking-wider uppercase bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent font-mono">
                        Inquira
                    </span>
                </div>
                <Link 
                    href="/dashboard"
                    className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                >
                    Back to Workspaces
                </Link>
            </header>

            {/* Core 404 Card Panel */}
            <main className="flex-1 flex items-center justify-center p-6 z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-md w-full glass-panel border border-zinc-850 bg-[#09090b]/60 rounded-2xl p-8 md:p-10 text-center space-y-6 shadow-2xl relative"
                >
                    <div className="w-14 h-14 rounded-full bg-indigo-950/40 border border-indigo-900/20 flex items-center justify-center mx-auto text-indigo-400">
                        <HelpCircle className="w-7 h-7" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-sm font-black text-indigo-400 uppercase tracking-widest leading-none">Error Code 404</h2>
                        <h3 className="text-2xl font-extrabold text-white tracking-tight">Workspace Lost in Space</h3>
                        <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
                            The folder, analysis sheet, or presentation outline you are trying to view cannot be found. It may have been archived or deleted.
                        </p>
                    </div>

                    <div className="pt-4 border-t border-zinc-900 flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href="/dashboard"
                            className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all shadow-lg text-center"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Return to Dashboard
                        </Link>
                        <Link
                            href="/docs"
                            className="px-4 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 font-semibold text-xs flex items-center justify-center cursor-pointer transition-all text-center"
                        >
                            Read System Docs
                        </Link>
                    </div>
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="px-6 py-4 flex justify-between items-center text-[10px] text-zinc-650 border-t border-zinc-900/40 bg-black/10 z-10">
                <span>&copy; {new Date().getFullYear()} Inquira Inc. All rights reserved.</span>
                <span className="font-medium">Confidential Workspace</span>
            </footer>
        </div>
    );
}
