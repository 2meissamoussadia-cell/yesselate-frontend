import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import { Providers } from "../lib/providers/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NICE RÉNOVATION - Plateforme de Gestion",
  description:
    "Plateforme digitale de gestion de projets de rénovation et construction au Sénégal",
  keywords: [
    "rénovation",
    "construction",
    "Sénégal",
    "gestion de chantier",
    "BTP",
  ],
  authors: [{ name: "NICE RÉNOVATION" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/images/log_yessalate.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#F97316",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <QueryProvider>
          <Providers>
            {children}
          </Providers>
        </QueryProvider>
      </body>
    </html>
  );
}
