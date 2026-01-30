import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import { Providers } from "../lib/providers/Providers";

export const metadata: Metadata = {
  title: "YESSALATE Centrale DG - Cockpit Rénovation Digitale",
  description:
    "Cockpit DG Rénovation Digitale - Zéro surprise, 100% satisfaction. Plateforme de gestion de projets de rénovation.",
  keywords: [
    "rénovation",
    "construction",
    "Sénégal",
    "gestion de chantier",
    "BTP",
    "YESSALATE",
  ],
  authors: [{ name: "YESSALATE" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/images/log_yessalate.png",
  },
  other: {
    "apple-touch-icon": "/images/log_yessalate.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <QueryProvider>
          <Providers>
            {children}
          </Providers>
        </QueryProvider>
      </body>
    </html>
  );
}
