"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import {
  LogOut,
  CalendarDays,
  LayoutDashboard,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  User as UserIcon,
  AlertCircle,
  Frown,
  Headset,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import LoginTrigger from "../auth/LoginTrigger";
import EmailVerificationDialog from "../auth/EmailVerificationDialog";
import { toast } from "sonner";
import Link from "next/link";

// Helper
const getInitials = (name: string | undefined, email: string | undefined) => {
  if (name && name.trim().length > 0) {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  return email?.substring(0, 2).toUpperCase() || "U";
};

export default function UserNav() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [isVerified, setIsVerified] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // State Reaktif (HAPUS 'initials' DARI STATE)
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    const fetchProfileData = async (userId: string) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", userId)
        .single();

      if (profile) {
        if (profile.role === "admin") setIsAdmin(true);
        if (profile.full_name) setFullName(profile.full_name);
      }
    };

    const initSession = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (authUser) {
        setUser(authUser);

        const metaName = authUser.user_metadata?.full_name || "";
        setFullName(metaName);
        setAvatarUrl(authUser.user_metadata?.avatar_url || "");

        const isGoogle = authUser.app_metadata.provider === "google";
        const isCustom = authUser.user_metadata?.email_verified_custom === true;
        setIsVerified(isGoogle || isCustom);

        fetchProfileData(authUser.id);
      }
      setLoading(false);
    };

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);

        const metaName = session.user.user_metadata?.full_name || "";
        setFullName(metaName);
        setAvatarUrl(session.user.user_metadata?.avatar_url || "");

        const isGoogle = session.user.app_metadata.provider === "google";
        const isCustom =
          session.user.user_metadata?.email_verified_custom === true;
        setIsVerified(isGoogle || isCustom);

        fetchProfileData(session.user.id);
      } else {
        setUser(null);
        setIsAdmin(false);
        setIsVerified(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  // PERBAIKAN: Gunakan Derived State (Hitung langsung)
  // Tidak perlu useEffect. Setiap kali fullName/user berubah, ini otomatis terhitung ulang.
  const initials = getInitials(fullName, user?.email);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowLogoutConfirm(false);
    router.push("/");
    router.refresh();
    toast.info("Anda telah keluar. Sampai jumpa lagi! 👋");
  };

  const handleVerificationSuccess = () => {
    setIsVerified(true);
    router.refresh();
  };

  if (loading) {
    return (
      <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse border border-slate-200" />
    );
  }

  if (!user) {
    return <LoginTrigger mode="desktop" />;
  }

  return (
    <>
      {user.email && (
        <EmailVerificationDialog
          open={showVerification}
          onOpenChange={setShowVerification}
          email={user.email}
          onSuccess={handleVerificationSuccess}
        />
      )}

      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="sm:max-w-sm text-center p-6">
          <div className="mx-auto bg-slate-100 p-4 rounded-full mb-2">
            <Frown className="w-10 h-10 text-slate-500" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              Yakin mau pergi?
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              Kami sedih melihat Anda pergi. Pastikan semua pesanan Anda sudah
              aman sebelum keluar. 🥺
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-4">
            <Button
              onClick={() => setShowLogoutConfirm(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 font-bold"
            >
              Gajadi deh, tetap disini
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 font-medium"
            >
              Tetap Keluar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-10 w-10 rounded-full p-0 border border-slate-200 hover:ring-2 hover:ring-blue-100 transition-all focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Avatar className="h-full w-full overflow-hidden rounded-full">
              <AvatarImage
                src={avatarUrl}
                alt={user.email || ""}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>

            {!isVerified ? (
              <span
                className="absolute -top-0.5 -right-0.5 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-white z-10"
                title="Belum Verifikasi"
              ></span>
            ) : (
              <span
                className="absolute -top-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-green-500 ring-2 ring-white z-10"
                title="Terverifikasi"
              >
                <span className="text-[8px] font-bold text-white">✓</span>
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-72 z-[100] p-0 rounded-xl shadow-xl border-slate-100 mt-2"
          align="end"
          forceMount
        >
          <div className="bg-slate-50/80 p-4 border-b border-slate-100 flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-white shadow-sm">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="bg-blue-600 text-white text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-slate-800 truncate">
                {fullName || "Pengguna"}
              </span>
              <span className="text-xs text-slate-500 truncate font-medium">
                {user.email}
              </span>
            </div>
          </div>

          {!isVerified && (
            <div className="bg-amber-50 p-3 border-b border-amber-100">
              <div className="flex items-start gap-2 text-amber-800 mb-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p className="text-[11px] leading-tight font-medium">
                  Akun belum terverifikasi. Wajib verifikasi untuk booking.
                </p>
              </div>
              <button
                onClick={() => setShowVerification(true)}
                className="w-full bg-amber-200/50 hover:bg-amber-200 text-amber-900 text-[10px] font-bold py-1.5 rounded transition"
              >
                Verifikasi Email Sekarang
              </button>
            </div>
          )}

          <div className="p-2">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-slate-400 font-normal px-2 py-1 uppercase tracking-wider">
                Akun Saya
              </DropdownMenuLabel>

              {isAdmin && (
                <Link href="/admin/bookings">
                  <DropdownMenuItem className="cursor-pointer mb-1 bg-blue-50 text-blue-700 focus:bg-blue-100 focus:text-blue-800 font-medium">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Admin Dashboard</span>
                    <Sparkles className="ml-auto h-3 w-3 text-blue-500" />
                  </DropdownMenuItem>
                </Link>
              )}

              <Link href="/dashboard/mybooking">
                <DropdownMenuItem className="cursor-pointer h-10 focus:bg-slate-50">
                  <CalendarDays className="mr-2 h-4 w-4 text-slate-500" />
                  <span>Pesanan Saya</span>
                </DropdownMenuItem>
              </Link>

              <Link href="/help">
                <DropdownMenuItem className="cursor-pointer h-10 focus:bg-slate-50">
                  <Headset className="mr-2 h-4 w-4 text-slate-500" />
                  <span>Pusat Bantuan</span>
                </DropdownMenuItem>
              </Link>

              <Link href="/dashboard/profile">
                <DropdownMenuItem className="cursor-pointer h-10 focus:bg-slate-50">
                  <UserIcon className="mr-2 h-4 w-4 text-slate-500" />
                  <span>Profil & Pengaturan</span>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="my-2 bg-slate-100" />

            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setShowLogoutConfirm(true);
              }}
              className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 h-10 font-medium"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Keluar Aplikasi</span>
            </DropdownMenuItem>
          </div>

          <div className="bg-slate-50 p-2 text-center border-t border-slate-100 rounded-b-xl">
            <div className="flex justify-center items-center gap-1.5 text-[10px] text-slate-400">
              {isVerified ? (
                <>
                  <ShieldCheck className="w-3 h-3 text-green-500" />
                  <span className="text-green-600 font-medium">
                    Akun Terverifikasi
                  </span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3 h-3 text-amber-500" />
                  <span>Keamanan Terbatas</span>
                </>
              )}
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
