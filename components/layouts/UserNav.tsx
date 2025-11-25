"use client";

import { useState, useEffect } from "react"; // Hapus useCallback biar simple
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import {
  LogOut,
  CalendarDays,
  LayoutDashboard,
  BadgeCheck,
  BadgeAlert,
  Send,
} from "lucide-react";

import AuthDialog from "@/components/auth/AuthDialog";

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

export default function UserNav() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // Logic terpisah untuk cek Profile (Admin/Verified)
    // Ini jalan di background agar tidak memblokir tampilan Avatar
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
        // 1. Ambil User Auth (Cepat)
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (authUser) {
          setUser(authUser);
          // Set verified status langsung dari metadata auth (Cepat)
          setIsVerified(!!authUser.email_confirmed_at);

          // STOP LOADING SEKARANG! Jangan tunggu DB profile.
          setLoading(false);

          // 2. Baru cek DB Profile (Lambat/Async)
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

    // Listener Realtime
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        setIsVerified(!!session.user.email_confirmed_at);
        setLoading(false); // Pastikan loading mati saat auth state berubah
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

  const resendVerification = async () => {
    if (!user?.email) return;
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: user.email,
    });
    if (error) alert(error.message);
    else alert("Email verifikasi dikirim ulang!");
  };

  // --- RENDER ---

  if (loading) {
    return <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />;
  }

  if (!user) {
    return <AuthDialog />;
  }

  const initials = user.email?.substring(0, 2).toUpperCase() || "U";
  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <DropdownMenu>
      {/* Trigger Button */}
      <DropdownMenuTrigger className="relative rounded-full outline-none transition-opacity hover:opacity-80 cursor-pointer focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
        <Avatar className="h-10 w-10 border border-gray-200 shadow-sm">
          <AvatarImage src={avatarUrl} alt={user.email || ""} />
          <AvatarFallback className="bg-blue-600 text-white font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      {/* Dropdown Content */}
      <DropdownMenuContent className="w-64 z-[100]" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium leading-none truncate max-w-[150px]">
                {user.user_metadata?.full_name || "Pengguna"}
              </p>
              {isVerified ? (
                <BadgeCheck className="h-4 w-4 text-blue-500" />
              ) : (
                <BadgeAlert className="h-4 w-4 text-orange-500" />
              )}
            </div>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user.email}
            </p>

            {!isVerified && (
              <div className="mt-2 p-2 bg-orange-50 rounded border border-orange-100">
                <p className="text-[10px] text-orange-700 mb-1">
                  Email belum diverifikasi.
                </p>
                <button
                  onClick={resendVerification}
                  className="text-[10px] flex items-center text-blue-600 hover:underline font-bold"
                >
                  <Send className="h-3 w-3 mr-1" /> Kirim Ulang Link
                </button>
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {/* Perbaikan Link ke route yang benar */}
          <Link href="/dashboard/mybooking">
            <DropdownMenuItem className="cursor-pointer">
              <CalendarDays className="mr-2 h-4 w-4" />
              <span>Pesanan Saya</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>

        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <Link href="/admin/bookings">
              <DropdownMenuItem className="cursor-pointer bg-slate-50 font-bold text-slate-700">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Admin Dashboard</span>
              </DropdownMenuItem>
            </Link>
          </>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Keluar</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
