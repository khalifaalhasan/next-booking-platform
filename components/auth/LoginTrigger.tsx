"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogIn, ArrowRight } from "lucide-react";
import AuthDialog from "@/components/auth/AuthDialog";

interface LoginTriggerProps {
  mode?:
    | "desktop-login"
    | "desktop-register"
    | "mobile-topbar"
    | "mobile-sheet";
}

export default function LoginTrigger({
  mode = "desktop-login",
}: LoginTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // State untuk Tab Awal (Login vs Register)
  // Pastikan AuthDialog menerima prop 'defaultView' ('login' | 'register')
  const [defaultView, setDefaultView] = useState<"login" | "register">("login");

  const handleOpen = (view: "login" | "register") => {
    setDefaultView(view);
    setIsOpen(true);
  };

  return (
    <>
      <AuthDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        defaultView={defaultView} // Pastikan AuthDialog support ini
      />

      {/* 1. DESKTOP: TOMBOL MASUK (Ghost) */}
      {mode === "desktop-login" && (
        <Button
          variant="ghost"
          onClick={() => handleOpen("login")}
          className="text-slate-600 hover:text-blue-600 font-bold px-4 hover:bg-blue-50 transition-colors"
        >
          Masuk
        </Button>
      )}

      {/* 2. DESKTOP: TOMBOL DAFTAR (Primary CTA) */}
      {mode === "desktop-register" && (
        <Button
          onClick={() => handleOpen("register")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg px-5 shadow-sm shadow-blue-200 transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
        >
          Daftar Sekarang
        </Button>
      )}

      {/* 3. MOBILE TOPBAR: Tombol Compact (Icon + Teks) */}
      {mode === "mobile-topbar" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleOpen("login")}
          className="flex items-center gap-2 text-slate-700 hover:text-blue-600 hover:bg-blue-50 px-3 h-9 rounded-full border border-slate-200/50 hover:border-blue-100 transition-all"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span className="text-xs font-bold">Masuk</span>
        </Button>
      )}

      {/* 4. MOBILE SHEET: Tombol Full Width */}
      {mode === "mobile-sheet" && (
        <div className="flex flex-col gap-3 w-full">
          <Button
            onClick={() => handleOpen("login")}
            className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold border border-blue-100 shadow-sm h-11"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Masuk ke Akun
          </Button>

          <div className="flex items-center justify-center gap-2 text-xs text-blue-100/80 mt-1">
            <span>Belum punya akun?</span>
            <button
              onClick={() => handleOpen("register")}
              className="font-bold text-white hover:underline underline-offset-2 flex items-center"
            >
              Daftar disini <ArrowRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
