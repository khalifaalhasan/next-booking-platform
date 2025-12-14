"use client";

import React, { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import Link from "next/link"; // Import Link
import {
  Bell,
  ChevronRight,
  LogOut,
  Search,
  User as UserIcon,
  Settings,
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  CalendarDays,
  Loader2,
  Laptop,
  ClipboardList, // Icon baru untuk booking
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@/components/ui/dialog";

// Tipe hasil pencarian
type SearchResult = {
  id: string;
  title: string;
  type: "service" | "team" | "booking";
  url: string;
};

export default function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);

  // STATE PENCARIAN
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // STATE NOTIFIKASI
  const [notificationCount, setNotificationCount] = useState(0);

  // 1. Ambil User & Notifikasi Awal
  useEffect(() => {
    const initData = async () => {
      // Get User
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      // Get Notification Count (Booking yang perlu verifikasi)
      fetchNotificationCount();
    };

    initData();

    // Setup Realtime Subscription (Agar angka update otomatis saat ada booking baru)
    const channel = supabase
      .channel("bookings_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => {
          fetchNotificationCount(); // Refresh count jika ada insert/update/delete
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Fungsi Fetch Jumlah Booking Pending
  const fetchNotificationCount = async () => {
    // SESUAIKAN 'status' DENGAN DATABASE ANDA
    // Asumsi status 'pending' adalah yang masuk ke tab "Perlu Verifikasi"
    const { count, error } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "waiting_verification"); // Ganti 'pending' jika Anda pakai 'waiting_payment' dll

    if (!error && count !== null) {
      setNotificationCount(count);
    }
  };

  // 2. Shortcut Keyboard Search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // 3. Logic Pencarian (Debounced)
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const { data: services } = await supabase
          .from("services")
          .select("id, name, slug")
          .ilike("name", `%${query}%`)
          .limit(3);

        const { data: teams } = await supabase
          .from("teams")
          .select("id, name, position")
          .ilike("name", `%${query}%`)
          .limit(3);

        const formattedResults: SearchResult[] = [
          ...(services?.map((s) => ({
            id: s.id,
            title: s.name,
            type: "service" as const,
            url: `/services/${s.slug}`,
          })) || []),
          ...(teams?.map((t) => ({
            id: t.id,
            title: `${t.name} (${t.position})`,
            type: "team" as const,
            url: `/admin/teams`,
          })) || []),
        ];

        setResults(formattedResults);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  const paths = pathname.split("/").filter((path) => path);
  const formatPath = (p: string) =>
    p.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-sm transition-all">
        {/* KIRI: Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="font-semibold text-slate-900 hidden sm:block">
            UPT Panel
          </span>
          {paths.map((path, idx) => {
            const isLast = idx === paths.length - 1;
            return (
              <div key={idx} className="flex items-center">
                <ChevronRight className="h-4 w-4 text-slate-400 mx-1" />
                <span
                  className={`${
                    isLast
                      ? "font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md"
                      : ""
                  } capitalize`}
                >
                  {formatPath(path)}
                </span>
              </div>
            );
          })}
        </div>

        {/* KANAN: Search, Notif, Profile */}
        <div className="flex items-center gap-4">
          {/* SEARCH TRIGGER */}
          <Button
            variant="outline"
            className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2 text-slate-500 border-slate-200 bg-slate-50 hover:bg-white"
            onClick={() => setOpen(true)}
          >
            <Search className="h-4 w-4 xl:mr-2" />
            <span className="hidden xl:inline-flex">Cari sesuatu...</span>
            <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>

          {/* NOTIFIKASI BELL DENGAN DROPDOWN */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-slate-500 hover:bg-slate-100"
              >
                {/* 1. Icon Bell SELALU dirender (jangan dimasukkan ke dalam logika if/else) */}
                <Bell className="h-5 w-5" />

                {/* 2. Badge Angka (Overlay Absolute) */}
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notificationCount > 0 ? (
                <Link href="/admin/bookings">
                  <DropdownMenuItem className="cursor-pointer py-3 bg-blue-50/50">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                        <ClipboardList className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-sm">
                          Booking Masuk
                        </span>
                        <span className="text-xs text-slate-500">
                          {notificationCount} pesanan perlu verifikasi
                          pembayaran.
                        </span>
                      </div>
                    </div>
                  </DropdownMenuItem>
                </Link>
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  Tidak ada notifikasi baru
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>

          {/* USER PROFILE */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="pl-2 pr-4 h-10 gap-3 hover:bg-slate-50 rounded-full sm:rounded-md border border-transparent hover:border-slate-200"
              >
                <Avatar className="h-8 w-8 border border-slate-200">
                  <AvatarImage
                    src={
                      user?.user_metadata?.avatar_url ||
                      "https://github.com/shadcn.png"
                    }
                  />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-xs hidden sm:flex">
                  <span className="font-bold text-slate-700">
                    {user?.email?.split("@")[0] || "Admin"}
                  </span>
                  <span className="text-slate-400">Super Admin</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/admin/profile">
                <DropdownMenuItem className="cursor-pointer">
                  <UserIcon className="mr-2 h-4 w-4" /> Profil
                </DropdownMenuItem>
              </Link>
              <Link href="/admin/settings">
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" /> Pengaturan
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* GLOBAL SEARCH COMMAND */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <DialogTitle className="sr-only">Pencarian</DialogTitle>
        <CommandInput
          placeholder="Ketik untuk mencari layanan, tim, atau menu..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {loading ? (
              <span className="flex items-center justify-center py-4">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </span>
            ) : (
              "Tidak ditemukan."
            )}
          </CommandEmpty>

          {results.length > 0 && (
            <CommandGroup heading="Hasil Database">
              {results.map((result) => (
                <CommandItem
                  key={`${result.type}-${result.id}`}
                  value={result.title}
                  onSelect={() => runCommand(() => router.push(result.url))}
                >
                  {result.type === "service" ? (
                    <Briefcase className="mr-2 h-4 w-4 text-blue-500" />
                  ) : (
                    <Users className="mr-2 h-4 w-4 text-green-500" />
                  )}
                  <span>{result.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandSeparator />

          <CommandGroup heading="Navigasi Menu">
            <CommandItem
              onSelect={() => runCommand(() => router.push("/admin"))}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/admin/bookings"))}
            >
              <CalendarDays className="mr-2 h-4 w-4" /> Booking Masuk
            </CommandItem>
            {/* Tambahkan menu lain sesuai kebutuhan */}
            <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
              <Laptop className="mr-2 h-4 w-4" /> Lihat Website Utama
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
