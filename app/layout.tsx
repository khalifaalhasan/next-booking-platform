// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "@/components/ui/sonner";

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
        <NextTopLoader color="#2563eb" showSpinner={false} />

        {/* DISINI TIDAK ADA NAVBAR */}
        {children}

        <Toaster
          position="top-center"
          richColors={true} // Wajib TRUE agar warna hijau/merah menyala
          theme="light" // Wajib LIGHT agar tidak merah gelap/hitam
          closeButton // Opsional: tombol X
          style={{
            // Opsional: Paksa font agar tidak ikut font aneh
            fontFamily: "var(--font-sans)",
          }}
        />
      </body>
    </html>
  );
}
