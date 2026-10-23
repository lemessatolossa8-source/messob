/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,

  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  // Allow Next.js Image Optimization for local uploads and any future CDN
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 80, 85, 90],
    deviceSizes: [390, 435, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 2592000, // 30 days
    remotePatterns: [
      // Self-hosted uploads served from the Express backend (http in dev, https in prod)
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "5000",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "**",
        pathname: "/uploads/**",
      },
    ],
  },

  // Proxy API requests and static uploads to backend
  async rewrites() {
    const rawBackendUrl =
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://127.0.0.1:5000";
    const backendUrl = rawBackendUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "");

    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },

  // Route redirects
  async redirects() {
    return [
      {
        source: "/admin/dashboard/floors",
        destination: "/admin/dashboard/services",
        permanent: true,
      },
      {
        source: "/admin/dashboard/floors/:path*",
        destination: "/admin/dashboard/services",
        permanent: true,
      },
      {
        source: "/floors",
        destination: "/#our-services",
        permanent: false,
      },
      {
        source: "/floors/:floorNumber",
        destination: "/#floor-:floorNumber",
        permanent: false,
      },
    ];
  },

  // Security and performance headers
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/favicon.ico",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: http://localhost:5000 http://127.0.0.1:5000 https:",
              "font-src 'self' data: https:",
              "connect-src 'self' http://localhost:5000 http://127.0.0.1:5000 https: ws: wss:",
              "frame-src 'self' https://www.google.com https://maps.google.com https://*.google.com https://www.google.com/maps/embed https://www.openstreetmap.org",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
