"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import AuthDialog from "@/components/auth/AuthDialog"; // Pastikan path sesuai

interface LoginTriggerProps {
  mode?: "desktop" | "mobile" | "mobile-sheet";
}

export default function LoginTrigger({ mode = "desktop" }: LoginTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <AuthDialog open={isOpen} onOpenChange={setIsOpen} />

      {/* --- TAMPILAN DESKTOP (NAVBAR ATAS) --- */}
      {mode === "desktop" && (
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-slate-900 text-white hover:bg-slate-800 font-bold rounded-full px-6 shadow-md shadow-slate-200 transition-all active:scale-95"
        >
          Masuk / Daftar
        </Button>
      )}

      {/* --- TAMPILAN MOBILE (NAVBAR MENU) --- */}
      {mode === "mobile" && (
         <Button
         variant="ghost"
         size="icon"
         onClick={() => setIsOpen(true)}
         className="text-slate-700"
       >
         <LogIn className="w-6 h-6" />
       </Button>
      )}

      {/* --- TAMPILAN DI DALAM SHEET MOBILE --- */}
      {mode === "mobile-sheet" && (
        <Button 
            onClick={() => setIsOpen(true)}
            className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold shadow-sm"
        >
            Masuk / Daftar
        </Button>
      )}
    </>
  );
}