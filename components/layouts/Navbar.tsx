import Link from "next/link";
import branding from "@/config/branding.json";
import {
  Menu,
  Building2,
  ChevronDown,
  Home,
  Info,
  Newspaper,
  TicketPercent,
  LogOut,
  ArrowRight,
  Facebook,
  Instagram,
  Phone,
} from "lucide-react";
import UserNav from "@/components/layouts/UserNav";
import LoginTrigger from "@/components/auth/LoginTrigger";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { createClient } from "@/utils/supabase/server";

// Tipe Data
type ServiceLite = {
  id: string;
  name: string;
  slug: string;
};

type CategoryWithServices = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  services: ServiceLite[];
};

export async function Navbar() {
  const supabase = await createClient();

  // 1. Fetch Data Kategori
  const { data } = await supabase
    .from("categories")
    .select(`id, name, slug, icon, services ( id, name, slug )`)
    .order("name");

  const categories = (data as unknown as CategoryWithServices[]) || [];
  const validCategories = categories.filter(
    (cat) => cat.services && cat.services.length > 0
  );

  // 2. Fetch User
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const initials = user?.email?.substring(0, 2).toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 font-sans">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full gap-2">
          {/* --- BAGIAN KIRI: HAMBURGER & LOGO --- */}
          <div className="flex items-center gap-2 md:gap-6 flex-1 md:flex-none">
            {/* 1. MOBILE MENU (SHEET) */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden -ml-2 text-slate-700 hover:bg-slate-100 shrink-0"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>

              {/* PERBAIKAN LAYOUT SHEET CONTENT */}
              <SheetContent
                side="left"
                // 1. h-full: Paksa tinggi penuh
                // 2. flex-col: Susun ke bawah
                // 3. Hapus overflow-y-auto dari sini (pindah ke nav)
                className="w-[85vw] sm:w-[350px] p-0 flex flex-col h-full border-r-0 gap-0 bg-white"
              >
                {/* HEADER MENU (FIXED TOP) */}
                <div
                  // 1. shrink-0: PENTING! Agar header tidak gepeng didesak menu
                  // 2. pt-20: Memberi jarak aman untuk tombol Close (X)
                  className="bg-gradient-to-br from-blue-700 to-blue-500 p-6 pt-20 text-white relative overflow-hidden shrink-0 z-10"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <Building2 className="w-32 h-32 text-white" />
                  </div>

                  {user ? (
                    <div className="flex items-center gap-4 relative z-10 animate-in fade-in slide-in-from-left-4 duration-500">
                      <Avatar className="h-14 w-14 border-2 border-white/30 shadow-md shrink-0">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-white text-blue-600 font-bold text-lg">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="overflow-hidden min-w-0">
                        <p className="font-bold text-lg truncate leading-tight">
                          {user.user_metadata?.full_name || "Pengguna"}
                        </p>
                        <p className="text-xs text-blue-100 truncate mt-1 opacity-80 font-medium">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <h3 className="font-bold text-2xl">Selamat Datang!</h3>
                      <p className="text-sm text-blue-100 mb-2 leading-relaxed opacity-90">
                        {branding.brand.tagline}
                      </p>
                      <SheetClose asChild>
                        <div className="w-full">
                          <LoginTrigger mode="mobile-sheet" />
                        </div>
                      </SheetClose>
                    </div>
                  )}
                </div>

                {/* NAVIGATION LINKS (SCROLLABLE AREA) */}
                <nav
                  // 1. flex-1: Mengambil sisa ruang yang ada
                  // 2. overflow-y-auto: Scroll hanya terjadi di area ini
                  className="flex-1 overflow-y-auto p-2 space-y-1 bg-slate-50/50"
                >
                  <p className="px-4 pt-4 pb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Menu Utama
                  </p>
                  <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden mx-2">
                    <SheetClose asChild>
                      <Link
                        href="/"
                        className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 text-slate-700 text-sm font-medium border-b border-slate-50"
                      >
                        <Home className="h-5 w-5 text-blue-500" /> Home
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/promo"
                        className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 text-slate-700 text-sm font-medium border-b border-slate-50"
                      >
                        <TicketPercent className="h-5 w-5 text-red-500" /> Promo
                        Spesial
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/blog"
                        className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 text-slate-700 text-sm font-medium border-b border-slate-50"
                      >
                        <Newspaper className="h-5 w-5 text-orange-500" /> Blog
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/about"
                        className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 text-slate-700 text-sm font-medium"
                      >
                        <Info className="h-5 w-5 text-green-500" /> Tentang Kami
                      </Link>
                    </SheetClose>
                  </div>

                  <p className="px-4 pt-6 pb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Kategori Layanan
                  </p>
                  <div className="bg-white rounded-xl border border-slate-100 shadow-sm mx-2 overflow-hidden">
                    <Accordion type="single" collapsible className="w-full">
                      {validCategories.map((cat) => (
                        <AccordionItem
                          key={cat.id}
                          value={cat.id}
                          className="border-b last:border-b-0"
                        >
                          <AccordionTrigger className="px-4 py-3.5 text-sm font-medium text-slate-700 hover:no-underline hover:bg-slate-50">
                            <div className="flex items-center gap-3">
                              <span className="text-lg">
                                {cat.icon || "📂"}
                              </span>
                              {cat.name}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="bg-slate-50/50 px-4 pb-4 pt-1">
                            <div className="flex flex-col gap-1 ml-8 border-l-2 border-slate-200 pl-4">
                              {cat.services.map((svc) => (
                                <SheetClose key={svc.id} asChild>
                                  <Link
                                    href={`/services/${svc.slug}`}
                                    className="text-sm text-slate-600 hover:text-blue-600 py-2 block"
                                  >
                                    {svc.name}
                                  </Link>
                                </SheetClose>
                              ))}
                              <SheetClose asChild>
                                <Link
                                  href={`/services?category=${cat.slug}`}
                                  className="text-xs font-bold text-blue-600 mt-2 block hover:underline"
                                >
                                  Lihat Semua {cat.name} →
                                </Link>
                              </SheetClose>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>

                  {/* SOSMED FOOTER */}
                  <div className="mt-6 mx-2 mb-2 p-4 rounded-xl bg-blue-50 border border-blue-100">
                    <p className="text-xs font-bold text-blue-800 mb-3 uppercase tracking-wider">
                      Hubungi Kami
                    </p>
                    <div className="flex gap-4">
                      <a
                        href={branding.socials.instagram.url}
                        target="_blank"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Instagram className="w-5 h-5" />
                      </a>
                      <a
                        href={branding.socials.facebook.url}
                        target="_blank"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Facebook className="w-5 h-5" />
                      </a>
                      <a
                        href={branding.socials.whatsapp.url}
                        target="_blank"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Phone className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                </nav>

                {/* LOGOUT (FIXED BOTTOM) */}
                {user && (
                  <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                    <form action="/auth/signout" method="post">
                      <SheetClose asChild>
                        <button className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition">
                          <LogOut className="h-4 w-4" /> Keluar
                        </button>
                      </SheetClose>
                    </form>
                  </div>
                )}
              </SheetContent>
            </Sheet>

            {/* 2. LOGO BRANDING (RESPONSIVE) */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-blue-600 p-1.5 rounded-lg text-white group-hover:bg-blue-700 transition shadow-sm shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="hidden md:block font-extrabold text-xl tracking-tight text-slate-900 leading-none">
                  {branding.brand.name}
                </span>
                <span className="md:hidden font-bold text-lg tracking-tight text-slate-900 leading-none">
                  {branding.brand.shortName}
                </span>
              </div>
            </Link>
          </div>

          {/* --- BAGIAN KANAN: MENU (DESKTOP) & LOGIN (RESPONSIVE) --- */}
          <div className="flex items-center gap-3 md:gap-6 shrink-0">
            {/* MENU UTAMA (Desktop Only) */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-slate-600">
              <Link href="/" className="hover:text-blue-600 transition">
                Home
              </Link>
              <Link href="/blog" className="hover:text-blue-600 transition">
                Blog
              </Link>
              <Link href="/about" className="hover:text-blue-600 transition">
                Tentang Kami
              </Link>
              <Link
                href="/promo"
                className="flex items-center gap-1 hover:text-blue-600 transition group"
              >
                Promo{" "}
                <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-bold group-hover:bg-red-200 transition">
                  Hot
                </span>
              </Link>
            </nav>

            <div className="hidden md:block h-6 w-px bg-gray-200"></div>

            {/* AUTH TRIGGER */}
            {user ? (
              <UserNav />
            ) : (
              <>
                <div className="hidden md:block">
                  <LoginTrigger mode="desktop" />
                </div>
                <div className="md:hidden">
                  <LoginTrigger mode="mobile" />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* --- MEGA MENU (DESKTOP) --- */}
      <div className="hidden md:block border-t border-gray-100 bg-white relative z-40">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            {validCategories.map((category) => (
              <div key={category.id} className="group relative">
                <Link
                  href={`/services?category=${category.slug}`}
                  className="flex items-center h-12 px-5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600 transition-all cursor-pointer gap-2"
                >
                  <span className="text-base opacity-70 group-hover:opacity-100 transition">
                    {category.icon || "📂"}
                  </span>
                  {category.name}
                  <ChevronDown className="h-3 w-3 transition-transform duration-300 group-hover:rotate-180 text-slate-400 group-hover:text-blue-600 ml-1" />
                </Link>
                <div className="absolute left-0 top-full pt-1 invisible opacity-0 -translate-y-2 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out z-50">
                  <div className="w-[600px] bg-white rounded-xl shadow-2xl border border-gray-100 p-2 grid grid-cols-12 gap-0 overflow-hidden mt-0">
                    <div className="col-span-4 bg-slate-50 p-5 flex flex-col justify-between rounded-l-lg border-r border-slate-100">
                      <div>
                        <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center text-3xl mb-4">
                          {category.icon || "📂"}
                        </div>
                        <h4 className="font-bold text-gray-900 text-lg mb-1">
                          {category.name}
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Temukan layanan terbaik di kategori {category.name}.
                        </p>
                      </div>
                      <Link
                        href={`/services?category=${category.slug}`}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-4 group/link"
                      >
                        Lihat Semua{" "}
                        <ArrowRight className="w-3 h-3 transition-transform group-hover/link:translate-x-1" />
                      </Link>
                    </div>
                    <div className="col-span-8 p-5">
                      <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                        Layanan Populer
                      </h5>
                      {category.services.length > 0 ? (
                        <ul className="grid grid-cols-2 gap-2">
                          {category.services.slice(0, 8).map((service) => (
                            <li key={service.id}>
                              <Link
                                href={`/services/${service.slug}`}
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-50 transition-colors group/item"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover/item:bg-blue-500 transition-colors"></div>
                                <span className="text-sm text-slate-600 group-hover/item:text-blue-700 font-medium line-clamp-1">
                                  {service.name}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm italic">
                          Belum ada layanan tersedia.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
