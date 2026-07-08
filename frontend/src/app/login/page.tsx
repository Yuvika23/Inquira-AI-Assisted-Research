"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";

export default function LoginPage() {
    const { login, loginGoogle } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Forgot password state
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
    const [forgotLoading, setForgotLoading] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const errorParam = params.get("error");
            if (errorParam === "session_expired") {
                setError("Your session has expired. Please sign in again.");
            }
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await login(email, password);
        } catch (err: any) {
            setError(err.message || "Failed to log in. Please check your credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError(null);
        setIsLoading(true);
        try {
            // Simulating Google OAuth success callback payload
            await loginGoogle(
                "demo.user@insightflow.ai",
                "Demo User",
                "google-oauth2-1029384756",
                "https://api.dicebear.com/7.x/initials/svg?seed=Demo%20User"
            );
        } catch (err: any) {
            setError(err.message || "Failed to log in with Google.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setForgotSuccess(null);
        setError(null);
        setForgotLoading(true);
        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
            const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: forgotEmail }),
            });
            const data = await response.json();
            if (response.ok) {
                setForgotSuccess(data.message);
            } else {
                setError(data.detail || "Forgot password process failed.");
            }
        } catch (err: any) {
            setError("Unable to connect to the backend service.");
        } finally {
            setForgotLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
            {/* Background blur spots */}
            <div className="glow-spot top-1/4 left-1/4 animate-pulse-slow" />
            <div className="glow-spot bottom-1/4 right-1/4 animate-pulse-slow" style={{ "--primary-glow": "rgba(147, 51, 234, 0.12)" } as React.CSSProperties} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-md z-10"
            >
                {/* Logo and title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        AI-Assisted Business Intelligence
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                        Inquira
                    </h1>
                    <p className="text-zinc-400 text-sm">
                        Access your intelligent research workspaces
                    </p>
                </div>

                {/* Card container */}
                <div className="glass-panel rounded-2xl p-8 border-zinc-800">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm">
                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-zinc-300" htmlFor="email">
                                Email Address
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                                    <Mail className="w-4 h-4" />
                                </span>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    className="w-full pl-10 pr-4 py-2.5 glass-input text-sm"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-medium text-zinc-300" htmlFor="password">
                                    Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setError(null);
                                        setForgotSuccess(null);
                                        setShowForgotModal(true);
                                    }}
                                    className="text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                                    <Lock className="w-4 h-4" />
                                </span>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-2.5 glass-input text-sm"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    Sign In <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-zinc-800"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#0c0c0e] px-2 text-zinc-500">Or continue with</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full py-2.5 px-4 rounded-lg border border-zinc-800 hover:bg-zinc-900/50 text-zinc-300 font-medium text-sm flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Sign in with Google
                    </button>
                </div>

                <div className="text-center mt-6 text-sm text-zinc-500">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                        Create Workspace
                    </Link>
                </div>
            </motion.div>

            {/* Forgot Password Modal */}
            <AnimatePresence>
                {showForgotModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-sm glass-panel rounded-xl p-6 border-zinc-800"
                        >
                            <h3 className="text-lg font-semibold text-white mb-2">Reset Password</h3>
                            <p className="text-xs text-zinc-400 mb-4">
                                Enter your email and we will send a password reset simulation link.
                            </p>

                            <form onSubmit={handleForgotSubmit} className="space-y-4">
                                {forgotSuccess ? (
                                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-300 text-xs">
                                        {forgotSuccess}
                                    </div>
                                ) : (
                                    <div className="space-y-1.5">
                                        <label className="text-xs text-zinc-400">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            value={forgotEmail}
                                            onChange={(e) => setForgotEmail(e.target.value)}
                                            placeholder="name@company.com"
                                            className="w-full px-3 py-2 glass-input text-xs"
                                        />
                                    </div>
                                )}

                                <div className="flex justify-end gap-2.5 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowForgotModal(false)}
                                        className="px-3 py-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 text-xs font-medium cursor-pointer transition-colors"
                                    >
                                        Close
                                    </button>
                                    {!forgotSuccess && (
                                        <button
                                            type="submit"
                                            disabled={forgotLoading}
                                            className="px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                                        >
                                            {forgotLoading ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                                "Send Link"
                                            )}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
