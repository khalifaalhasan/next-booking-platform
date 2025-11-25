// app/(main)/layout.tsx
import { Navbar } from "@/components/layouts/Navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Navbar User HANYA muncul untuk anak-anak folder (main) */}
      <Navbar />
      <main className="min-h-screen bg-white">{children}</main>
    </>
  );
}
