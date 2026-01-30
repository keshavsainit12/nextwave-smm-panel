/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nextwavesmm.com",
      },
      {
        protocol: "https",
        hostname: "*.nextwavesmm.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
    ],
  },
  
  // Redirect domain configuration
  redirects: async () => {
    return [
      // Redirect www to non-www (fixed redirect destination)
      {
        source: "/:path*",
        destination: "https://nextwavesmm.com/:path*",
        permanent: true,
        has: [
          {
            type: "host",
            value: "www.nextwavesmm.com",
          },
        ],
      },
    ]
  },

  // Environment variables to make available to browser
  env: {
    NEXT_PUBLIC_APP_NAME: "NextWave SMM",
    NEXT_PUBLIC_DOMAIN: "nextwavesmm.com",
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "https://nextwavesmm.com/api",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "https://nextwavesmm.com",
  },

  // Headers for security and API
  headers: async () => {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type,Authorization" },
          { key: "Access-Control-Max-Age", value: "86400" },
        ],
      },
    ]
  },
}

export default nextConfig
