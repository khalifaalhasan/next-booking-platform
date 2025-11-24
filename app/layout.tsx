import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layouts/Navbar"; // Import Navbar
import NextTopLoader from "nextjs-toploader"; // Loader yg kemarin kita pasang

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pusat Pengembangan Bisnis",
  description: "Platform booking gedung dan aset bisnis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {/* 1. Loader di paling atas */}
        <NextTopLoader color="#2563eb" showSpinner={false} />

        {/* 2. Navbar menempel di atas */}
        <Navbar />

        {/* 3. Konten Halaman */}
        <main className="min-h-screen bg-white">{children}</main>
      </body>
    </html>
  );
}
