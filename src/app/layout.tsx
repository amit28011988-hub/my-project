import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ThreadGenius - Create Viral Social Media Threads",
  description: "Create viral social media threads using AI-powered generation, proven templates, and a curated viral image library.",
  keywords: ["ThreadGenius", "AI", "Social Media", "Threads", "Viral Content", "Facebook", "LinkedIn", "Twitter", "Templates"],
  authors: [{ name: "ThreadGenius Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "ThreadGenius - Create Viral Social Media Threads",
    description: "Create viral social media threads using AI, templates with engagement scores, and a viral image library for Facebook, LinkedIn, Twitter/X, and Threads.",
    url: "https://threadgenius.ai",
    siteName: "ThreadGenius",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ThreadGenius - Create Viral Social Media Threads",
    description: "Create viral social media threads using AI, templates with engagement scores, and a viral image library.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
