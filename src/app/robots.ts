import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.url.replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/mypage", "/saju/*/checkout", "/saju/*/report", "/saju/*/report-preview"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
