import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  redirects: async () => [
    { source: "/saju/saju_ehon/:path*", destination: "/saju/kunghap_ehon/:path*", permanent: true },
    { source: "/saju/saju_gyeolhon/:path*", destination: "/saju/kunghap_gyeolhon/:path*", permanent: true },
    { source: "/saju/saju_imshin/:path*", destination: "/saju/kunghap_imshin/:path*", permanent: true },
    { source: "/saju/jeongtong/:path*", destination: "/saju/saju_jeongtong/:path*", permanent: true },
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
  headers: async () => [
    {
      source: "/media/:path*",
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    },
  ],
};

export default config;
