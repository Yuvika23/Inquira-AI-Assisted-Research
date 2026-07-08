"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Compass, Send, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ContactPage() {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        company: "",
        message: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API tick
        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
            setForm({ name: "", email: "", company: "", message: "" });
        }, 1200);
    };

    return (
        <div className="min-h-screen bg-[#060608] text-white flex flex-col justify-between relative overflow-hidden font-sans">
            {/* Design ambient meshes */}
            <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-indigo-600/5 blur-[100px] pointer-events-none" />

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
                    <Link href="/docs" className="hover:text-white transition-colors">Documentation</Link>
                    <Link href="/contact" className="text-white">Contact</Link>
                </nav>
                <div className="flex items-center gap-3">
                    <Link href="/login" className="text-xs font-semibold text-zinc-400 hover:text-white px-3 py-1.5 transition-colors">Login</Link>
                    <Link href="/register" className="px-3.5 py-1.5 rounded-lg bg-indigo-650 hover:bg-indigo-500 text-white font-semibold text-xs transition-all active:scale-95 shadow-md">Sign Up</Link>
                </div>
            </header>

            {/* Main Contact Form Section */}
            <main className="flex-1 flex items-center justify-center p-6 z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full glass-panel border border-zinc-850 bg-[#09090b]/60 rounded-2xl p-8 shadow-2xl relative space-y-6"
                >
                    <div className="space-y-1.5">
                        <h2 className="text-sm font-black text-indigo-400 uppercase tracking-widest leading-none">Support Ticket</h2>
                        <h1 className="text-2xl font-extrabold text-white tracking-tight">Contact our research desk</h1>
                        <p className="text-[11px] text-zinc-450 leading-relaxed">
                            Have questions about our Pro filters, Enterprise model integrations, or dedicated support terms? Message us.
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {submitted ? (
                            <motion.div 
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-5 rounded-xl bg-emerald-950/20 border border-emerald-900/15 text-center space-y-3"
                            >
                                <div className="w-10 h-10 rounded-full bg-emerald-900/25 border border-emerald-800/20 flex items-center justify-center mx-auto text-emerald-450">
                                    <Check className="w-5 h-5" />
                                </div>
                                <h4 className="font-bold text-white text-xs">Message Transmitted!</h4>
                                <p className="text-[10px] text-zinc-450 leading-relaxed max-w-xs mx-auto">
                                    Your support ticket has been registered. An Inquira specialist will contact you at your email address shortly.
                                </p>
                            </motion.div>
                        ) : (
                            <motion.form 
                                key="form"
                                onSubmit={handleSubmit} 
                                className="space-y-4"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] uppercase font-bold text-zinc-550 block">Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            placeholder="John Doe"
                                            className="w-full px-3 py-2 glass-input text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] uppercase font-bold text-zinc-555 block">Email</label>
                                        <input
                                            type="email"
                                            required
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            placeholder="john@company.com"
                                            className="w-full px-3 py-2 glass-input text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] uppercase font-bold text-zinc-555 block">Company</label>
                                    <input
                                        type="text"
                                        value={form.company}
                                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                                        placeholder="Consulting Ltd."
                                        className="w-full px-3 py-2 glass-input text-xs"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] uppercase font-bold text-zinc-555 block">Message Details</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={form.message}
                                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                                        placeholder="How can we assist your research team..."
                                        className="w-full px-3 py-2 glass-input text-xs resize-none"
                                    />
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-2.5 rounded-lg bg-indigo-650 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all shadow-lg disabled:opacity-50"
                                    >
                                        <Send className="w-3.5 h-3.5" />
                                        <span>{loading ? "Transmitting..." : "Send Message"}</span>
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </motion.div>
            </main>

            {/* Footer Bar */}
            <footer className="px-6 py-4 flex justify-between items-center text-[10px] text-zinc-650 border-t border-zinc-900/40 bg-black/10 z-10">
                <span>&copy; {new Date().getFullYear()} Inquira Inc. All rights reserved.</span>
                <span className="font-medium">Confidential support channel</span>
            </footer>
        </div>
    );
}
