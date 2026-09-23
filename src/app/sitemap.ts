import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

const PRODUCT_SLUGS = [
  "total",
  "saju_jaemul",
  "saju_yeonae",
  "saju_health",
  "saju_janyeo",
  "saju_youare",
  "kunghap_yeonae",
  "kunghap_gyeolhon",
  "kunghap_ehon",
  "kunghap_jaehwe",
  "kunghap_janyeo",
  "kunghap_imshin",
  "kunghap_business",
  "kunghap_banryeo",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url.replace(/\/$/, "");
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/products`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...PRODUCT_SLUGS.map((slug) => ({
      url: `${base}/saju/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
  ];
}
