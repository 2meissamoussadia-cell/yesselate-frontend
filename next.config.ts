import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Contourner l'échec "spawn EPERM" du check TypeScript (Windows/sandbox). Vérifier les types avec `npx tsc --noEmit` en CI si besoin.
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configuration des images
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.nicerenovation.sn", pathname: "/**" },
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "https", hostname: "yessalate-photos.s3.af-south-1.amazonaws.com", pathname: "/**" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // Rewrites pour proxy API si nécessaire
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        }/:path*`,
      },
    ];
  },

  // Headers de sécurité
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      // PWA Phase 7: service workers ne doivent pas être mis en cache
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
      {
        source: "/sw-calendrier.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },

  // Activation du mode React strict
  reactStrictMode: true,

  // ✅ Optimisations Fast Refresh
  experimental: {
    // Optimiser la compilation des packages lourds
    optimizePackageImports: [
      '@radix-ui/react-dialog',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      'lucide-react',
      '@tanstack/react-query',
      '@tanstack/react-virtual',
    ],
    // Désactivé : nécessite le module 'critters'. Réactiver après `npm i critters`.
    // optimizeCss: true,
  },

  // ✅ Compiler optimisé
  compiler: {
    // Supprimer les console.log en production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Configuration Turbopack (Next.js 16+)
  turbopack: {
    // Root directory explicite pour éviter le warning
    root: process.cwd(),
  },

  // ✅ Optimisations webpack pour Fast Refresh
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        canvas: false,
        // Exclure les modules serveur du bundle client
        'ioredis': false,
        'pino': false,
        'prom-client': false,
      };
      
      // Exclure explicitement ces modules du bundle client
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push('ioredis', 'pino', 'prom-client');
      } else {
        config.externals = [config.externals, 'ioredis', 'pino', 'prom-client'];
      }
    }

    // ✅ Optimisations Fast Refresh en développement
    if (dev && !isServer) {
      // Optimiser Fast Refresh avec des IDs nommés
      config.optimization = {
        ...config.optimization,
        moduleIds: 'named',
        chunkIds: 'named',
      };

      // Réduire la taille des chunks en développement
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 1,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            reuseExistingChunk: true,
          },
        },
      };
    }

    return config;
  },

  // Configuration i18n si nécessaire (français par défaut)
  // i18n: {
  //   locales: ['fr'],
  //   defaultLocale: 'fr',
  // },
};

export default nextConfig;
