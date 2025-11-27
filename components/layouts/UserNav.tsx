"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import {
  LogOut,
  CalendarDays,
  LayoutDashboard,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  User as UserIcon,
  Loader2,
  MailWarning,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; // Opsional: Untuk notifikasi lebih cantik
import LoginTrigger from "../auth/LoginTrigger"; // Sesuaikan path jika perlu

export default function UserNav() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [resending, setResending] = useState(false);

  // --- LOGIC (Sama seperti sebelumnya) ---
  useEffect(() => {
    const fetchProfileData = async (userId: string) => {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .single();

        if (profile?.role === "admin") setIsAdmin(true);
        else setIsAdmin(false);
      } catch (err) {
        console.error("Gagal cek profile", err);
      }
    };

    const initSession = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (authUser) {
          setUser(authUser);
          setIsVerified(!!authUser.email_confirmed_at);
          setLoading(false);
          fetchProfileData(authUser.id);
        } else {
          setUser(null);
          setLoading(false);
        }
      } catch (error) {
        console.error("Auth Error:", error);
        setLoading(false);
      }
    };

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        setIsVerified(!!session.user.email_confirmed_at);
        setLoading(false);
        fetchProfileData(session.user.id);
      } else {
        setUser(null);
        setIsAdmin(false);
        setIsVerified(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const resendVerification = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user?.email) return;

    setResending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: user.email,
    });

    setResending(false);

    if (error) {
      toast.error("Gagal mengirim email", { description: error.message });
    } else {
      toast.success("Email Terkirim!", {
        description: "Cek inbox/spam email Anda.",
      });
    }
  };

  // --- RENDER ---

  if (loading) {
    return (
      <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse border border-slate-200" />
    );
  }

  if (!user) {
    return <LoginTrigger mode="desktop" />;
  }

  const initials = user.email?.substring(0, 2).toUpperCase() || "U";
  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <DropdownMenu>
      {/* Trigger Button */}
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full p-0 overflow-hidden border border-slate-200 hover:ring-2 hover:ring-blue-100 transition-all focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Avatar className="h-full w-full">
            <AvatarImage
              src={avatarUrl}
              alt={user.email || ""}
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      {/* Dropdown Content */}
      <DropdownMenuContent
        className="w-72 z-[100] p-0 rounded-xl shadow-xl border-slate-100 mt-2"
        align="end"
        forceMount
      >
        {/* SECTION 1: USER INFO HEADER */}
        <div className="bg-slate-50/80 p-4 border-b border-slate-100 flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-white shadow-sm">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="bg-blue-600 text-white text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-bold text-slate-800 truncate">
              {user.user_metadata?.full_name || "Pengguna"}
            </span>
            <span className="text-xs text-slate-500 truncate font-medium">
              {user.email}
            </span>
          </div>
        </div>

        {/* SECTION 2: VERIFICATION BANNER (Jika belum verif) */}
        {!isVerified && (
          <div className="bg-amber-50 px-4 py-2 flex flex-col gap-1 border-b border-amber-100">
            <div className="flex items-center gap-2 text-amber-700">
              <MailWarning className="w-3 h-3" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Akun Belum Aktif
              </span>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[10px] text-amber-600 leading-tight pr-2">
                Silakan cek email untuk verifikasi.
              </p>
              <button
                onClick={resendVerification}
                disabled={resending}
                className="text-[10px] font-bold text-amber-700 bg-amber-200/50 px-2 py-1 rounded hover:bg-amber-200 transition disabled:opacity-50"
              >
                {resending ? "Mengirim..." : "Kirim Ulang"}
              </button>
            </div>
          </div>
        )}

        {/* SECTION 3: MENU ITEMS */}
        <div className="p-2">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs text-slate-400 font-normal px-2 py-1 uppercase tracking-wider">
              Akun Saya
            </DropdownMenuLabel>

            {/* Admin Menu (Hanya muncul jika admin) */}
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

            {/* Placeholder Profile (Bisa diaktifkan nanti) */}
            <DropdownMenuItem
              className="cursor-pointer h-10 focus:bg-slate-50"
              disabled
            >
              <UserIcon className="mr-2 h-4 w-4 text-slate-500" />
              <span>Profil & Pengaturan</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="my-2 bg-slate-100" />

          {/* SECTION 4: LOGOUT */}
          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 h-10 font-medium"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Keluar Aplikasi</span>
          </DropdownMenuItem>
        </div>

        {/* SECTION 5: FOOTER INFO */}
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
  );
}
