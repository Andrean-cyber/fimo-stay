import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FimoStay — Temukan Kos yang Tepat untukmu.",
  description:
    "Cari dan booking kos terverifikasi di tempat favoritmu. Aman, mudah, dan cepat bersama FimoStay.",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
