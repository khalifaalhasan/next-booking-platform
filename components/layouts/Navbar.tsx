"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import Image from "next/image";

type ServiceLite = { id: string; name: string; slug: string };
type CategoryWithServices = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  services: ServiceLite[];
};

export function Navbar() {
  const pathname = usePathname();
  const supabase = createClient();

  const [categories, setCategories] = useState<CategoryWithServices[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const getCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select(`id, name, slug, icon, services ( id, name, slug )`)
        .order("name");
      if (data) setCategories(data as unknown as CategoryWithServices[]);
    };

    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getCategories();
    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      authListener.subscription.unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [supabase]);

  const validCategories = categories.filter(
    (cat) => cat.services && cat.services.length > 0
  );
  const initials = user?.email?.substring(0, 2).toUpperCase() || "U";
  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `relative text-sm font-medium transition-colors duration-300 hover:text-blue-600 ${
      isActive ? "text-blue-600 font-bold" : "text-slate-600"
    } after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:bg-blue-600 after:transition-all after:duration-300 ${
      isActive ? "after:w-full" : "after:w-0 hover:after:w-full"
    }`;
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white border-b transition-all duration-300 ${
        isScrolled ? "border-gray-200 shadow-sm" : "border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20">
        <div className="flex items-center justify-between h-full gap-4">
          {/* --- KIRI: MENU MOBILE & LOGO --- */}
          <div className="flex items-center gap-3 lg:gap-8 flex-1 md:flex-none">
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

              <SheetContent
                side="left"
                className="w-[85vw] sm:w-[350px] p-0 flex flex-col h-full border-r-0 gap-0 bg-white"
              >
                <div className="bg-gradient-to-br from-blue-700 to-blue-600 p-6 pt-20 text-white relative overflow-hidden shrink-0 z-10 shadow-lg">
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
                      <div className="w-full">
                        <LoginTrigger mode="mobile-sheet" />
                      </div>
                    </div>
                  )}
                </div>

                <nav className="flex-1 overflow-y-auto p-2 space-y-1 bg-slate-50/50">
                  <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden mx-2 mt-4">
                    <SheetClose asChild>
                      <Link
                        href="/"
                        className={`flex items-center gap-3 px-4 py-3.5 text-sm font-medium border-b border-slate-50 ${
                          pathname === "/"
                            ? "text-blue-600 bg-blue-50/50"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <Home className="h-5 w-5 text-blue-500" /> Home
                      </Link>
                    </SheetClose>
                    <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-50 opacity-70 cursor-not-allowed">
                      <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                        <TicketPercent className="h-5 w-5 text-slate-400" />{" "}
                        Promo
                      </div>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
                        SOON
                      </span>
                    </div>
                    <SheetClose asChild>
                      <Link
                        href="/blog"
                        className={`flex items-center gap-3 px-4 py-3.5 text-sm font-medium border-b border-slate-50 ${
                          pathname === "/blog"
                            ? "text-blue-600 bg-blue-50/50"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <Newspaper className="h-5 w-5 text-orange-500" /> Blog
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/about"
                        className={`flex items-center gap-3 px-4 py-3.5 text-sm font-medium ${
                          pathname === "/about"
                            ? "text-blue-600 bg-blue-50/50"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
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

                  {user && (
                    <div className="p-4 bg-white border-t border-slate-100 shrink-0 mt-6 mx-2 mb-2 rounded-xl">
                      <form action="/auth/signout" method="post">
                        <SheetClose asChild>
                          <button className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition">
                            <LogOut className="h-4 w-4" /> Keluar
                          </button>
                        </SheetClose>
                      </form>
                    </div>
                  )}
                </nav>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center gap-2 group">
              <div>
                <Image
                  src="/images/logoppbisnis.png"
                  alt="Logo Pusat Bisnis"
                  width={120}
                  height={120}
                />
              </div>
            </Link>
          </div>

          {/* --- KANAN: MENU DESKTOP & AUTH --- */}
          <div className="flex items-center gap-3 lg:gap-6 shrink-0">
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className={getLinkClass("/")}>
                Home
              </Link>
              <Link href="/blog" className={getLinkClass("/blog")}>
                Blog
              </Link>
              <Link href="/about" className={getLinkClass("/about")}>
                Tentang Kami
              </Link>
              <div
                className="flex items-center gap-2 cursor-not-allowed opacity-60"
                title="Segera Hadir"
              >
                <span className="text-sm font-medium text-slate-400">
                  Promo
                </span>
                <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded border border-slate-200 font-bold">
                  SOON
                </span>
              </div>
            </nav>

            <div className="hidden md:block h-6 w-px bg-slate-200"></div>

            {user ? (
              <UserNav />
            ) : (
              <div className="flex items-center gap-2">
                {/* Mobile: Tombol Compact */}
                <div className="md:hidden">
                  <LoginTrigger mode="mobile-topbar" />
                </div>
                {/* Desktop: Split Login & Register */}
                <div className="hidden md:flex items-center gap-3">
                  <LoginTrigger mode="desktop-login" />
                  <LoginTrigger mode="desktop-register" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MEGA MENU DESKTOP */}
      <div className="hidden md:block border-t border-gray-100 bg-white relative z-40 shadow-[0_2px_3px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8 h-12">
            {validCategories.map((category) => {
              const isActiveCategory =
                pathname.includes(`/services`) &&
                pathname.includes(category.slug);
              return (
                <div
                  key={category.id}
                  className="group relative h-full flex items-center"
                >
                  <Link
                    href={`/services?category=${category.slug}`}
                    className={`flex items-center text-sm font-medium transition-all cursor-pointer gap-2 ${
                      isActiveCategory
                        ? "text-blue-600 font-bold"
                        : "text-slate-600 group-hover:text-blue-600"
                    }`}
                  >
                    <span className="text-base opacity-70 group-hover:opacity-100 transition">
                      {category.icon || "📂"}
                    </span>
                    {category.name}
                    <ChevronDown
                      className={`h-3 w-3 transition-transform duration-300 text-slate-400 group-hover:text-blue-600 ${
                        isActiveCategory
                          ? "rotate-180 text-blue-600"
                          : "group-hover:rotate-180"
                      }`}
                    />
                  </Link>
                  <div className="absolute left-0 top-full pt-0 invisible opacity-0 -translate-y-2 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out z-50">
                    <div className="w-[600px] bg-white rounded-xl shadow-2xl border border-gray-100 p-0 grid grid-cols-12 overflow-hidden mt-0.5 ring-1 ring-black/5">
                      <div className="col-span-4 bg-slate-50 p-6 flex flex-col justify-between border-r border-slate-100">
                        <div>
                          <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-3xl mb-4 border border-slate-100">
                            {category.icon || "📂"}
                          </div>
                          <h4 className="font-bold text-gray-900 text-lg mb-1 leading-tight">
                            {category.name}
                          </h4>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Eksplorasi pilihan terbaik untuk kategori ini.
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
                      <div className="col-span-8 p-5 bg-white">
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
                          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm italic bg-slate-50/50 rounded-lg">
                            Belum ada layanan.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
