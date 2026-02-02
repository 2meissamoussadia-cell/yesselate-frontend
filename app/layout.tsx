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
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var s=localStorage.getItem('nice-renovation-app-storage');var d=null;try{var p=s?JSON.parse(s):null;if(p&&p.state&&typeof p.state.darkMode==='boolean')d=p.state.darkMode;}catch(e){}if(d===null&&typeof window!=='undefined'&&window.matchMedia){d=window.matchMedia('(prefers-color-scheme: dark)').matches;}if(d===null)d=true;var r=document.documentElement;if(d){r.classList.add('dark');r.classList.remove('light');r.setAttribute('data-theme','dark');}else{r.classList.add('light');r.classList.remove('dark');r.setAttribute('data-theme','light');}})();`,
          }}
        />
        <QueryProvider>
          <Providers>
            {children}
          </Providers>
        </QueryProvider>
      </body>
    </html>
  );
}
