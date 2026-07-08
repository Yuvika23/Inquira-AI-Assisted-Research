"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { apiCall } from "@/lib/api";

interface User {
    id: number;
    email: string;
    full_name: string;
    avatar_url: string | null;
    created_at: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    loginGoogle: (email: string, fullName: string, googleId: string, avatarUrl?: string) => Promise<void>;
    register: (email: string, password: string, fullName: string) => Promise<void>;
    logout: () => void;
    updateProfile: (fullName: string, avatarUrl?: string, password?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        async function loadUser() {
            const storedToken = localStorage.getItem("token");
            if (storedToken) {
                try {
                    setToken(storedToken);
                    const userData = await apiCall("/auth/profile");
                    setUser(userData);
                } catch (error) {
                    console.error("Failed to load user profile, clearing invalid token:", error);
                    localStorage.removeItem("token");
                    setToken(null);
                    setUser(null);
                }
            } else {
                setToken(null);
                setUser(null);
            }
            setIsLoading(false);
        }
        loadUser();
    }, []);

    // Redirect to login if user is not authenticated and is trying to access dashboard/settings, etc.
    useEffect(() => {
        if (!isLoading) {
            const isPublicPage = ["/", "/login", "/register", "/forgot-password", "/pricing", "/about", "/contact", "/docs"].includes(pathname);
            const isAuthPage = ["/login", "/register", "/forgot-password"].includes(pathname);
            if (!user && !isPublicPage) {
                router.push("/login");
            } else if (user && isAuthPage) {
                router.push("/dashboard");
            }
        }
    }, [user, isLoading, pathname, router]);

    const login = async (email: string, password: string) => {
        const formData = new URLSearchParams();
        formData.append("username", email);
        formData.append("password", password);

        const data = await apiCall("/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData.toString(),
        });

        localStorage.setItem("token", data.access_token);
        setToken(data.access_token);
        
        const userData = await apiCall("/auth/profile");
        setUser(userData);
        router.push("/dashboard");
    };

    const loginGoogle = async (email: string, fullName: string, googleId: string, avatarUrl?: string) => {
        const data = await apiCall("/auth/google", {
            method: "POST",
            body: JSON.stringify({
                email,
                full_name: fullName,
                google_id: googleId,
                avatar_url: avatarUrl || "",
            }),
        });

        localStorage.setItem("token", data.access_token);
        setToken(data.access_token);

        const userData = await apiCall("/auth/profile");
        setUser(userData);
        router.push("/dashboard");
    };

    const register = async (email: string, password: string, fullName: string) => {
        await apiCall("/auth/register", {
            method: "POST",
            body: JSON.stringify({
                email,
                password,
                full_name: fullName,
            }),
        });

        // After successful registration, log the user in immediately
        await login(email, password);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        router.push("/login");
    };

    const updateProfile = async (fullName: string, avatarUrl?: string, password?: string) => {
        const body: any = { full_name: fullName };
        if (avatarUrl !== undefined) body.avatar_url = avatarUrl;
        if (password) body.password = password;

        const updatedUser = await apiCall("/auth/profile/update", {
            method: "PUT",
            body: JSON.stringify(body),
        });

        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                login,
                loginGoogle,
                register,
                logout,
                updateProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
