import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tempo",
    short_name: "Tempo",
    description: "Gestión para negocios con clientes recurrentes.",
    start_url: "/login",
    display: "standalone",
    background_color: "#101216",
    theme_color: "#6a4dff",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
