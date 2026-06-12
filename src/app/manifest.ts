import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "홍연당",
    short_name: "홍연당",
    start_url: "/",
    display: "standalone",
    background_color: "#e2231a", // 로고 테두리 빨강 (스플래시 배경)
    theme_color: "#e2231a",
    icons: [
      { src: "/icon.png", sizes: "192x192", type: "image/png" },
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
