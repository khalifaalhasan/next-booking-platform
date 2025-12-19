"use client";

import React, { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
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
  CalendarDays,
  Loader2,
  Laptop,
  ClipboardList,
  BookOpen,
  Tags,
  Newspaper,
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

// --- TIPE DATA ---
type SearchResult = {
  id: string;
  title: string;
  type: "service" | "team" | "catalog" | "menu";
  url: string;
  description?: string;
};

// --- DAFTAR MENU STATIS ---
const STATIC_MENUS: SearchResult[] = [
  {
    id: "nav-1",
    title: "Dashboard",
    type: "menu",
    url: "/admin",
    description: "Ringkasan statistik",
  },
  {
    id: "nav-2",
    title: "Kelola Organisasi",
    type: "menu",
    url: "/admin/teams",
    description: "Manajemen tim & struktur",
  },
  {
    id: "nav-3",
    title: "Kelola Katalog",
    type: "menu",
    url: "/admin/catalogs",
    description: "Upload PDF & Majalah Digital",
  },
  {
    id: "nav-4",
    title: "Booking Masuk",
    type: "menu",
    url: "/admin/bookings",
    description: "Verifikasi pesanan masuk",
  },
  {
    id: "nav-5",
    title: "Kelola Layanan",
    type: "menu",
    url: "/admin/services",
    description: "Daftar produk & jasa",
  },
  {
    id: "nav-6",
    title: "Kategori Layanan",
    type: "menu",
    url: "/admin/service-categories",
    description: "Grouping layanan",
  },
  {
    id: "nav-7",
    title: "Blog & Berita",
    type: "menu",
    url: "/admin/blogs",
    description: "Artikel & konten berita",
  },
  {
    id: "nav-8",
    title: "Kategori Blog",
    type: "menu",
    url: "/admin/blog-categories",
    description: "Grouping artikel",
  },
  {
    id: "nav-9",
    title: "Lihat Website",
    type: "menu",
    url: "/",
    description: "Halaman depan publik",
  },
];

export default function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuResults, setMenuResults] = useState<SearchResult[]>([]);
  const [dbResults, setDbResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  // 1. FIX ESLINT: Bungkus fetchNotificationCount dengan useCallback
  const fetchNotificationCount = useCallback(async () => {
    const { count, error } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "waiting_verification");

    if (!error && count !== null) {
      setNotificationCount(count);
    }
  }, [supabase]);

  // 2. Init Data User & Realtime Subscription
  useEffect(() => {
    const initData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      fetchNotificationCount();
    };
    initData();

    const channel = supabase
      .channel("bookings_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => {
          fetchNotificationCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchNotificationCount]); // Dependencies aman sekarang

  // 3. Shortcut Keyboard
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

  // 4. LOGIKA PENCARIAN
  useEffect(() => {
    if (!query) {
      setMenuResults([]);
      setDbResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();

    // Filter Menu Statis
    const filteredMenus = STATIC_MENUS.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.description?.toLowerCase().includes(lowerQuery)
    );
    setMenuResults(filteredMenus);

    // Filter Database
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

        // --- FIX TYPESCRIPT ERROR DI SINI ---
        // Kita tambahkan 'pdf_url' di select agar tidak error saat di-map
        const { data: catalogs } = await supabase
          .from("catalogs")
          .select("id, title, pdf_url")
          .ilike("title", `%${query}%`)
          .limit(3);

        const formattedDbResults: SearchResult[] = [
          ...(services?.map((s) => ({
            id: s.id,
            title: s.name,
            type: "service" as const,
            url: `/services/${s.slug}`,
            description: "Layanan / Produk",
          })) || []),
          ...(teams?.map((t) => ({
            id: t.id,
            title: `${t.name} (${t.position})`,
            type: "team" as const,
            url: `/admin/teams`,
            description: "Anggota Tim",
          })) || []),
          ...(catalogs?.map((c) => ({
            id: c.id,
            title: c.title,
            type: "catalog" as const,
            // Sekarang aman karena pdf_url sudah di-select
            url: c.pdf_url ? c.pdf_url : "/admin/catalogs",
            description: "Katalog Digital",
          })) || []),
        ];

        setDbResults(formattedDbResults);
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

  const getMenuIcon = (url: string) => {
    if (url.includes("dashboard") || url === "/admin")
      return <LayoutDashboard className="mr-2 h-4 w-4" />;
    if (url.includes("bookings"))
      return <CalendarDays className="mr-2 h-4 w-4" />;
    if (url.includes("catalogs")) return <BookOpen className="mr-2 h-4 w-4" />;
    if (url.includes("teams")) return <Users className="mr-2 h-4 w-4" />;
    if (url.includes("services")) return <Briefcase className="mr-2 h-4 w-4" />;
    if (url.includes("blog")) return <Newspaper className="mr-2 h-4 w-4" />;
    if (url.includes("categories")) return <Tags className="mr-2 h-4 w-4" />;
    return <ChevronRight className="mr-2 h-4 w-4" />;
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-sm transition-all">
        {/* KIRI: Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="font-semibold text-slate-900 hidden sm:block">
            UPT Panel
          </span>
          {paths.map((path, idx) => (
            <div key={idx} className="flex items-center">
              <ChevronRight className="h-4 w-4 text-slate-400 mx-1" />
              <span
                className={`${
                  idx === paths.length - 1
                    ? "font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md"
                    : ""
                } capitalize`}
              >
                {formatPath(path)}
              </span>
            </div>
          ))}
        </div>

        {/* KANAN: Search, Notif, Profile */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2 text-slate-500 border-slate-200 bg-slate-50 hover:bg-white"
            onClick={() => setOpen(true)}
          >
            <Search className="h-4 w-4 xl:mr-2" />
            <span className="hidden xl:inline-flex">
              Cari menu atau data...
            </span>
            <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>

          {/* NOTIFICATION */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-slate-500 hover:bg-slate-100"
              >
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
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
                          {notificationCount} pesanan menunggu verifikasi.
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

          {/* FIX TAILWIND: w-[1px] -> w-px */}
          <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>

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
                {/* FIX TAILWIND: Conflict hidden/flex */}
                <div className="flex-col items-start text-xs hidden sm:flex">
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

      {/* --- GLOBAL SEARCH COMMAND --- */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <DialogTitle className="sr-only">Pencarian Global</DialogTitle>
        <CommandInput
          placeholder="Ketik 'Katalog', 'Booking', atau nama layanan..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {loading ? (
              <span className="flex items-center justify-center py-4 text-slate-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sedang mencari
                di database...
              </span>
            ) : query ? (
              "Tidak ditemukan hasil."
            ) : (
              "Ketik sesuatu untuk mencari..."
            )}
          </CommandEmpty>

          {menuResults.length > 0 && (
            <CommandGroup heading="Halaman & Menu">
              {menuResults.map((menu) => (
                <CommandItem
                  key={menu.id}
                  value={menu.title}
                  onSelect={() => runCommand(() => router.push(menu.url))}
                  className="cursor-pointer"
                >
                  {getMenuIcon(menu.url)}
                  <div className="flex flex-col">
                    <span>{menu.title}</span>
                    {menu.description && (
                      <span className="text-[10px] text-slate-400">
                        {menu.description}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {menuResults.length > 0 && dbResults.length > 0 && (
            <CommandSeparator />
          )}

          {dbResults.length > 0 && (
            <CommandGroup heading="Data Database">
              {dbResults.map((result) => (
                <CommandItem
                  key={`${result.type}-${result.id}`}
                  value={result.title}
                  onSelect={() =>
                    runCommand(() => {
                      if (
                        result.type === "catalog" &&
                        result.url.startsWith("http")
                      ) {
                        window.open(result.url, "_blank");
                      } else {
                        router.push(result.url);
                      }
                    })
                  }
                  className="cursor-pointer"
                >
                  {result.type === "service" && (
                    <Briefcase className="mr-2 h-4 w-4 text-blue-500" />
                  )}
                  {result.type === "team" && (
                    <Users className="mr-2 h-4 w-4 text-green-500" />
                  )}
                  {result.type === "catalog" && (
                    <BookOpen className="mr-2 h-4 w-4 text-orange-500" />
                  )}

                  <div className="flex flex-col">
                    <span>{result.title}</span>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {result.description}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {!query && (
            <CommandGroup heading="Akses Cepat">
              {STATIC_MENUS.slice(0, 4).map((menu) => (
                <CommandItem
                  key={menu.id}
                  value={menu.title}
                  onSelect={() => runCommand(() => router.push(menu.url))}
                >
                  {getMenuIcon(menu.url)}
                  {menu.title}
                </CommandItem>
              ))}
              <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
                <Laptop className="mr-2 h-4 w-4" /> Lihat Website
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
