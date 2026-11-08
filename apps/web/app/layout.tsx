import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { RegisterSW } from "@/components/pwa/register-sw";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: { default: "Tempo", template: "%s | Tempo" },
  description: "Gestión para negocios con clientes recurrentes.",
  applicationName: "Tempo",
  appleWebApp: { capable: true, title: "Tempo", statusBarStyle: "default" },
  icons: { icon: "/icons/icon.svg", apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#6a4dff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${outfit.variable}`}>
      <body className="font-sans text-[15px] leading-normal antialiased">
        <Providers>{children}</Providers>
        <RegisterSW />
      </body>
    </html>
  );
}
