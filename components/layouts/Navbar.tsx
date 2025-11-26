import Link from "next/link";
import {
  Menu,
  Building2,
  ChevronRight,
  ChevronDown,
  Home,
  Info,
  Newspaper,
  TicketPercent,
  LogOut,
  UserCircle,
  Grid,
} from "lucide-react";
import UserNav from "@/components/layouts/UserNav";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  SheetClose,
  SheetFooter,
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
    .select(
      `
      id, 
      name, 
      slug, 
      icon,
      services ( id, name, slug ) 
    `
    )
    .order("name");

  const categories = (data as unknown as CategoryWithServices[]) || [];
  const validCategories = categories.filter(
    (cat) => cat.services && cat.services.length > 0
  );

  // 2. Fetch User (Untuk Profile di Mobile Menu)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const initials = user?.email?.substring(0, 2).toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm border-b border-gray-100 font-sans">
      {/* --- BARIS 1: UTAMA --- */}
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* KIRI: LOGO & HAMBURGER (MOBILE ONLY) */}
        <div className="flex items-center gap-3">
          {/* === MOBILE MENU (SHEET) === */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden -ml-2 text-slate-700 hover:bg-slate-100"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="left"
              className="w-[85vw] sm:w-[350px] p-0 overflow-y-auto flex flex-col border-r-0"
            >
              {/* 1. MOBILE HEADER: PROFILE SECTION */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white pt-12">
                {user ? (
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 border-2 border-white/30 shadow-md">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-white text-blue-600 font-bold text-lg">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden">
                      <p className="font-bold text-lg truncate leading-tight">
                        {user.user_metadata?.full_name || "Pengguna"}
                      </p>
                      <p className="text-xs text-blue-100 truncate mt-1">
                        {user.email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <h3 className="font-bold text-2xl">Selamat Datang!</h3>
                    <p className="text-sm text-blue-100 mb-2">
                      Masuk untuk akses fitur lengkap.
                    </p>
                    <SheetClose asChild>
                      <Link href="/login" className="w-full">
                        <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold shadow-sm">
                          Masuk / Daftar
                        </Button>
                      </Link>
                    </SheetClose>
                  </div>
                )}
              </div>

              {/* 2. MOBILE BODY: NAVIGATION */}
              <nav className="flex-1 p-2 space-y-1 bg-slate-50/50">
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
                      href="/blog"
                      className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 text-slate-700 text-sm font-medium border-b border-slate-50"
                    >
                      <Newspaper className="h-5 w-5 text-orange-500" /> Blog /
                      Berita
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
                            <span className="text-lg">{cat.icon || "📂"}</span>
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
              </nav>

              {/* 3. MOBILE FOOTER: LOGOUT */}
              {user && (
                <div className="p-4 bg-white border-t border-slate-100">
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

          {/* LOGO BRAND */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 p-1.5 rounded text-white group-hover:bg-blue-700 transition hidden sm:block">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-900">
              Pusat Bisnis
            </span>
          </Link>
        </div>

        {/* KANAN: MENU UTAMA & USER NAV (DESKTOP) */}
        <div className="flex items-center gap-6">
          {/* 1. MENU UTAMA (RATA KANAN) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
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
              className="flex items-center gap-1 hover:text-blue-600 transition"
            >
              Promo{" "}
              <span className="bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                Hot
              </span>
            </Link>
          </nav>

          {/* PEMISAH */}
          <div className="hidden md:block h-6 w-px bg-gray-200"></div>

          {/* 2. USER NAV */}
          <UserNav />
        </div>
      </div>

      {/* --- BARIS 2: MEGA MENU KATEGORI (DESKTOP ONLY) --- */}
      <div className="hidden md:block border-t border-gray-100 bg-white relative z-40">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            {validCategories.map((category) => (
              <div key={category.id} className="group relative">
                {/* TRIGGER */}
                <Link
                  href={`/services?category=${category.slug}`}
                  className="flex items-center h-11 px-4 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600 transition-all cursor-pointer gap-2"
                >
                  <span className="text-base">{category.icon || "📂"}</span>
                  {category.name}
                  <ChevronDown className="h-3 w-3 transition-transform duration-300 group-hover:rotate-180 text-slate-400 group-hover:text-blue-600" />
                </Link>

                {/* DROPDOWN CONTENT */}
                <div className="absolute left-0 top-full pt-1 invisible opacity-0 -translate-y-2 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out min-w-[350px] z-50">
                  <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-4 mt-0">
                    <div className="mb-3 pb-2 border-b border-gray-100 flex justify-between items-center">
                      <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                        {category.icon} {category.name}
                      </h4>
                      <Link
                        href={`/services?category=${category.slug}`}
                        className="text-xs text-blue-600 hover:underline font-medium"
                      >
                        Lihat Semua →
                      </Link>
                    </div>
                    <ul className="grid gap-1">
                      {category.services.slice(0, 5).map((service) => (
                        <li key={service.id}>
                          <Link
                            href={`/services/${service.slug}`}
                            className="block rounded-md p-2 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors font-medium"
                          >
                            {service.name}
                          </Link>
                        </li>
                      ))}
                      {category.services.length > 5 && (
                        <li className="text-center pt-2">
                          <Link
                            href={`/services?category=${category.slug}`}
                            className="text-xs text-slate-400 hover:text-blue-600 hover:underline"
                          >
                            + {category.services.length - 5} layanan lainnya
                          </Link>
                        </li>
                      )}
                      {category.services.length === 0 && (
                        <li className="text-xs text-slate-400 italic p-2">
                          Belum ada layanan.
                        </li>
                      )}
                    </ul>
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
