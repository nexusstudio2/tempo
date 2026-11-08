import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // En desarrollo el navegador habla con el mismo origen y Next reenvía al backend.
  // Así las cookies de sesión (HttpOnly) viajan sin CORS ni tokens en JavaScript.
  async rewrites() {
    const target = process.env.API_PROXY_TARGET ?? "http://localhost:8080";
    return [{ source: "/api/v1/:path*", destination: `${target}/api/v1/:path*` }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // La cámara se usa para escanear QR; el resto queda bloqueado.
          { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default config;
