import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import { Providers } from "../lib/providers/Providers";

export const metadata: Metadata = {
  title: "YESSALATE Centrale DG - Cockpit Rénovation Digitale",
  description:
    "Cockpit DG Rénovation Digitale - Zéro surprise, 100% satisfaction. Plateforme de gestion de projets de rénovation BTP, KPIs temps réel, pilotage chantiers.",
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
  robots: { index: true, follow: true },
  openGraph: {
    title: "YESSALATE Centrale DG",
    description: "Cockpit Rénovation Digitale - Zéro surprise, 100% satisfaction.",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "YESSALATE Centrale DG" },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
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
        {/* Utilise immédiatement les preloads CSS pour éviter le warning "preloaded but not used" (Next.js en dev) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function usePreloadedCss(retry){retry=retry||0;var q=document.querySelectorAll('link[rel="preload"][href*="layout.css"]');if(q.length===0&&retry<3){setTimeout(function(){usePreloadedCss(retry+1);},0);return;}for(var i=0;i<q.length;i++){var h=q[i].getAttribute('href');if(!h)continue;var used=document.querySelectorAll('link[rel="stylesheet"]');var found=false;for(var j=0;j<used.length;j++)if(used[j].getAttribute('href')===h){found=true;break;}if(found)continue;var l=document.createElement('link');l.rel='stylesheet';l.href=h;document.head.appendChild(l);}})();`,
          }}
        />
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
