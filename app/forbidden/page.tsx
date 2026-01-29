import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Akses Ditolak (403)",
  description: "Anda tidak memiliki izin untuk mengakses halaman ini.",
};

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100 max-w-lg w-full">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 ring-8 ring-red-50">
          <ShieldAlert className="w-10 h-10 text-red-600" />
        </div>

        {/* Text Content */}
        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          Akses Dibatasi
        </h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
          Maaf, akun Anda tidak memiliki izin <strong>Administrator</strong>{" "}
          untuk mengakses halaman ini. Silakan kembali atau hubungi Super Admin
          jika ini adalah kesalahan.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="outline" className="h-12 border-slate-200">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Link>
          </Button>

          <Button asChild className="h-12 bg-blue-600 hover:bg-blue-700">
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Ke Beranda
            </Link>
          </Button>
        </div>

        {/* Footer info */}
        <p className="mt-8 text-xs text-slate-400 font-mono">
          Error Code: 403_FORBIDDEN
        </p>
      </div>
    </div>
  );
}
