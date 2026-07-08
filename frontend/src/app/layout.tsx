import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Inquira - SaaS Business Research Platform",
  description: "Organize, analyze, and generate AI-assisted business research projects and executive briefs with a premium workspaces platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-[#030303] text-zinc-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
