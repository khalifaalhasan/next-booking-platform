import { Suspense } from "react";
import AuthForm from "@/components/auth/AuthForm";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 py-12">
      {/* Optional: Logo di atas form */}
      <Link href="/" className="mb-8 hover:opacity-80 transition-opacity">
        <Image
          src="/images/logoppbisnis.png" // Sesuaikan path logo
          alt="Logo Pusat Bisnis"
          width={150}
          height={50}
          className="h-12 w-auto"
        />
      </Link>

      <div className="w-full max-w-[450px] shadow-2xl rounded-2xl ring-1 ring-slate-900/5 overflow-hidden">
        <Suspense
          fallback={<div className="bg-white p-10 text-center">Loading...</div>}
        >
          <AuthForm defaultView="login" />
        </Suspense>
      </div>

      <p className="mt-8 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} Pusat Pengembangan Bisnis. All rights
        reserved.
      </p>
    </div>
  );
}
