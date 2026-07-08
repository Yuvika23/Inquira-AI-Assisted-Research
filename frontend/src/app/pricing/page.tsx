"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Compass, Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function PricingPage() {
    const [annual, setAnnual] = useState(true);

    const tiers = [
        {
            name: "Free Sandbox",
            price: 0,
            desc: "For individual researchers getting started with AI data extraction.",
            features: [
                "Up to 2 active projects",
                "10 sources per library limit",
                "Basic AI summary generation",
                "Export briefs as PDF",
                "Community support access"
            ],
            cta: "Get Started Free",
            href: "/register",
            popular: false
        },
        {
            name: "Pro Researcher",
            price: annual ? 19 : 24,
            desc: "For consulting practitioners needing unlimited reports and outlines.",
            features: [
                "Unlimited projects & research folders",
                "Up to 100 sources per project",
                "TanStack Airtable Evidence database",
                "Consulting Executive Brief synthesis",
                "Widescreen slide presentation deck creator",
                "Export outlines as PowerPoint (.pptx) & Word (.docx)",
                "Priority AI compiler queue",
                "Email support response under 12 hours"
            ],
            cta: "Upgrade to Pro",
            href: "/register",
            popular: true
        },
        {
            name: "Enterprise Core",
            price: "Custom",
            desc: "For consulting teams and agencies requiring dedicated models and compliance audits.",
            features: [
                "Everything in Pro Researcher tier",
                "Unlimited sources ingestion limits",
                "Custom fine-tuned LLM models integration",
                "Project Sharing role links (Editor/Viewer)",
                "Workspace Commentary side drawers",
                "System logs and audit trails (history trackers)",
                "Dedicated Account Manager",
                "Custom MSA & SLA support pipelines"
            ],
            cta: "Contact Enterprise",
            href: "/contact",
            popular: false
        }
    ];

    return (
        <div className="min-h-screen bg-[#060608] text-white flex flex-col justify-between relative overflow-hidden font-sans">
            {/* Design ambient background meshes */}
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-indigo-600/5 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-cyan-600/5 blur-[120px] pointer-events-none" />

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
                    <Link href="/pricing" className="text-white">Pricing</Link>
                    <Link href="/docs" className="hover:text-white transition-colors">Documentation</Link>
                    <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                </nav>
                <div className="flex items-center gap-3">
                    <Link href="/login" className="text-xs font-semibold text-zinc-400 hover:text-white px-3 py-1.5 transition-colors">Login</Link>
                    <Link href="/register" className="px-3.5 py-1.5 rounded-lg bg-indigo-650 hover:bg-indigo-500 text-white font-semibold text-xs transition-all active:scale-95 shadow-md">Sign Up</Link>
                </div>
            </header>

            {/* Main Pricing Canvas */}
            <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12 md:py-20 z-10 space-y-12">
                <div className="text-center space-y-4 max-w-xl mx-auto">
                    <h2 className="text-xs font-black text-indigo-400 uppercase tracking-widest leading-none">Subscription Plans</h2>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">Simple, predictable pricing.</h1>
                    <p className="text-xs text-zinc-450 leading-relaxed">
                        Choose the right plan to profile your source library, extract evidence tables, and compile professional strategic brief layouts.
                    </p>

                    {/* Toggle Slider Switch */}
                    <div className="flex items-center justify-center gap-3 pt-4">
                        <span className={`text-xs font-bold ${!annual ? "text-white" : "text-zinc-550"}`}>Monthly billing</span>
                        <button 
                            onClick={() => setAnnual(!annual)}
                            className="w-10 h-5.5 rounded-full bg-zinc-900 border border-zinc-800 p-0.5 relative transition-colors cursor-pointer"
                        >
                            <div className={`w-4 h-4 rounded-full bg-indigo-500 transition-all ${annual ? "translate-x-4.5" : "translate-x-0"}`} />
                        </button>
                        <span className={`text-xs font-bold ${annual ? "text-white" : "text-zinc-550"} flex items-center gap-1.5`}>
                            Yearly billing
                            <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-950/30 border border-emerald-900/10 px-1.5 py-0.5 rounded leading-none">
                                Save 20%
                            </span>
                        </span>
                    </div>
                </div>

                {/* Tier Grid Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-6">
                    {tiers.map((tier, idx) => (
                        <div 
                            key={idx}
                            className={`p-6 md:p-8 rounded-2xl border flex flex-col justify-between relative transition-all ${
                                tier.popular 
                                    ? "border-indigo-500 bg-[#0d0d12]/90 shadow-2xl shadow-indigo-550/5 scale-100 lg:scale-[1.02]" 
                                    : "border-zinc-850 bg-[#09090b]/55"
                            }`}
                        >
                            {/* Popular ribbon */}
                            {tier.popular && (
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded bg-indigo-500 text-[9px] uppercase font-black tracking-widest text-white shadow-md">
                                    Most Popular
                                </span>
                            )}

                            <div className="space-y-5">
                                <div className="space-y-1">
                                    <h3 className="font-extrabold text-white text-base leading-none">{tier.name}</h3>
                                    <p className="text-[11px] text-zinc-450 leading-relaxed pt-1">{tier.desc}</p>
                                </div>

                                <div className="flex items-baseline gap-1.5">
                                    {typeof tier.price === "number" ? (
                                        <>
                                            <span className="text-3xl font-black text-white">${tier.price}</span>
                                            <span className="text-xs text-zinc-550">/ month</span>
                                        </>
                                    ) : (
                                        <span className="text-3xl font-black text-white">{tier.price}</span>
                                    )}
                                </div>

                                <ul className="space-y-3 pt-2 text-xs text-zinc-350 border-t border-zinc-900">
                                    {tier.features.map((feat, i) => (
                                        <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                                            <Check className="w-4 h-4 text-emerald-450 shrink-0 mt-0.5" />
                                            <span>{feat}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="pt-6">
                                <Link
                                    href={tier.href}
                                    className={`w-full py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                                        tier.popular 
                                            ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20" 
                                            : "bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300"
                                    }`}
                                >
                                    <span>{tier.cta}</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Footer Bar */}
            <footer className="px-6 py-4 flex justify-between items-center text-[10px] text-zinc-650 border-t border-zinc-900/40 bg-black/10 z-10">
                <span>&copy; {new Date().getFullYear()} Inquira Inc. All rights reserved.</span>
                <span className="font-medium">Secure Payment Processing</span>
            </footer>
        </div>
    );
}
