"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import AuthForm from "./AuthForm";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultView?: "login" | "register";
}

export default function AuthDialog({
  open,
  onOpenChange,
  defaultView = "login",
}: AuthDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-0 gap-0 bg-transparent border-0 shadow-2xl rounded-2xl ring-1 ring-slate-900/5">
        {/* Panggil komponen AuthForm di sini */}
        <AuthForm 
          defaultView={defaultView} 
          onSuccess={() => onOpenChange(false)} // Tutup dialog jika sukses
        />
      </DialogContent>
    </Dialog>
  );
}