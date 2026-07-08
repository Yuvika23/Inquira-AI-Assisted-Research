"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Compass, BookOpen, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DocsPage() {
    const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({
        0: true
    });

    const toggleFaq = (idx: number) => {
        setFaqOpen({ ...faqOpen, [idx]: !faqOpen[idx] });
    };

    const docSections = [
        {
            title: "1. Core Philosophy",
            content: "Inquira organizes reference lists (literature, transcripts, notes) and isolates verified database records to build consulting briefs and widescreen slides. Our core objective is making research fast, reliable, and checkable."
        },
        {
            title: "2. Source Library Ingestion",
            content: "Researchers can import reference inputs using PDFs, websites, YouTube video transcript URLs, or Google Drive sheets. The backend parses textual records, calculates credibility rankings, and seeds default context metadata."
        },
        {
            title: "3. Airtable Evidence Database",
            content: "Extracted claims are mapped into a 10-column spreadsheet grid with priority badges. Clicking cells expands row sub-cards with supporting notes. Verify source citations and export grid lists as CSV arrays."
        },
        {
            title: "4. consulting Brief Synthesis",
            content: "Our AI compiles active literature inputs and evidence parameters to write a widescreen 10-chapter strategic summary report. Critical hazards, opportunities, and findings are highlighted with citation tags linking to document preview slides."
        }
    ];

    const faqs = [
        {
            q: "How does Inquira guarantee zero AI hallucinations?",
            a: "We enforce strict provenance checking. Every strategic recommendation or metric finding is bound to direct text quotes in the source database. Clicking inline citation badges slide open the referenced paper details drawer instantly."
        },
        {
            q: "How does the 30-day implementation plan checklist behave?",
            a: "When you compile your project roadmap, the planner builds a 4-week calendar details grid with required skills, dev tools, and outcomes. Toggling milestones recalculates your project's total progress bar and writes changes directly to SQL databases."
        },
        {
            q: "Can I export slides outline deck to PowerPoint?",
            a: "Yes. Clicking PowerPoint in the Presentation tab compiles widescreen .pptx slides on the fly. The downloaded deck preserves bullet spacing alignments and saves your presenter notes in the speaker notes pane."
        },
        {
            q: "How do I import files to Google Slides?",
            a: "Simply download the PowerPoint deck (.pptx) from Inquira, upload the file directly to Google Drive, double-click it, and select 'Open with Google Slides'."
        }
    ];

    return (
        <div className="min-h-screen bg-[#060608] text-white flex flex-col justify-between relative overflow-hidden font-sans">
            {/* Design ambient meshes */}
            <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] rounded-full bg-indigo-600/5 blur-[100px] pointer-events-none" />

            {/* Top Navigation Bar */}
            <header className="px-6 py-4 flex justify-between items-center border-b border-zinc-900/60 backdrop-blur-md z-10 bg-black/10">
                <Link href="/" className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-indigo-400" />
                    <span className="font-black text-sm tracking-wider uppercase bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent font-mono">
                        Inquira
                    </span>
                </Link>
                <nav className="hidden sm:flex items-center gap-6 text-xs text-zinc-400 font-semibold">
                    <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
                    <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
                    <Link href="/docs" className="text-white">Documentation</Link>
                    <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                </nav>
                <div className="flex items-center gap-3">
                    <Link href="/login" className="text-xs font-semibold text-zinc-400 hover:text-white px-3 py-1.5 transition-colors">Login</Link>
                    <Link href="/register" className="px-3.5 py-1.5 rounded-lg bg-indigo-650 hover:bg-indigo-500 text-white font-semibold text-xs transition-all active:scale-95 shadow-md">Sign Up</Link>
                </div>
            </header>

            {/* Main Content Layout */}
            <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 z-10 grid grid-cols-1 md:grid-cols-3 gap-10">
                
                {/* Left Side: Documentation Guides */}
                <div className="md:col-span-2 space-y-8">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-indigo-400">
                            <BookOpen className="w-5 h-5" />
                            <span className="text-[10px] uppercase font-bold tracking-widest">User Manuals</span>
                        </div>
                        <h1 className="text-2xl font-black text-white">System Documentation</h1>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                            Learn how to index source libraries, structure claim databases, and synthesize briefs and slides.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {docSections.map((sec, idx) => (
                            <div key={idx} className="p-5 rounded-xl border border-zinc-850 bg-[#09090b]/40 space-y-2">
                                <h3 className="font-extrabold text-white text-xs">{sec.title}</h3>
                                <p className="text-[11px] text-zinc-350 leading-relaxed">{sec.content}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: FAQ Accordion */}
                <div className="space-y-8">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-indigo-400">
                            <HelpCircle className="w-5 h-5" />
                            <span className="text-[10px] uppercase font-bold tracking-widest">Support FAQ</span>
                        </div>
                        <h2 className="text-xl font-bold text-white">Frequently Asked</h2>
                        <p className="text-[11px] text-zinc-450 leading-relaxed">
                            Quick answers to commonly asked questions about AI compilation.
                        </p>
                    </div>

                    <div className="space-y-3.5">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="border border-zinc-850 rounded-xl bg-[#09090b]/25 overflow-hidden">
                                <button
                                    onClick={() => toggleFaq(idx)}
                                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-zinc-900/30 text-left transition-colors"
                                >
                                    <span className="text-[11px] font-bold text-zinc-200">{faq.q}</span>
                                    {faqOpen[idx] ? (
                                        <ChevronUp className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                    ) : (
                                        <ChevronDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                    )}
                                </button>
                                <AnimatePresence initial={false}>
                                    {faqOpen[idx] && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="px-4 pb-3 pt-1 border-t border-zinc-900/40 text-[10px] text-zinc-400 leading-relaxed italic"
                                        >
                                            {faq.a}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Footer Bar */}
            <footer className="px-6 py-4 flex justify-between items-center text-[10px] text-zinc-650 border-t border-zinc-900/40 bg-black/10 z-10">
                <span>&copy; {new Date().getFullYear()} Inquira Inc. All rights reserved.</span>
                <span className="font-medium">System Documentation Suite</span>
            </footer>
        </div>
    );
}
