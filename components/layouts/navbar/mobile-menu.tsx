"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import branding from "@/config/branding.json";
import { mainNavItems } from "@/config/menu"; // Import data terpusat
import {
  Menu,
  Building2,
  LogOut,
  ChevronDown, // Icon
} from "lucide-react";
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
import { CategoryWithServices } from "./types";
import { User } from "@supabase/supabase-js";

interface MobileMenuProps {
  user: User | null;
  categories: CategoryWithServices[];
}

export function MobileMenu({ user, categories }: MobileMenuProps) {
  const pathname = usePathname();
  const initials = user?.email?.substring(0, 2).toUpperCase() || "U";

  // Filter kategori layanan (dari database)
  const validCategories = categories.filter(
    (cat) => cat.services && cat.services.length > 0,
  );

  return (
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
        {/* --- HEADER PROFILE --- */}
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

        {/* --- SCROLLABLE NAV --- */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1 bg-slate-50/50">
          {/* 1. MAIN MENU (Dari JSON) */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden mx-2 mt-4">
            <Accordion type="single" collapsible className="w-full">
              {mainNavItems.map((item, idx) => {
                // A. Jika Dropdown (punya children) -> Render Accordion
                if (item.children && item.children.length > 0) {
                  return (
                    <AccordionItem
                      key={idx}
                      value={`item-${idx}`}
                      className="border-b last:border-b-0 border-slate-50"
                    >
                      <AccordionTrigger className="px-4 py-3.5 text-sm font-medium text-slate-700 hover:no-underline hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          {item.icon && (
                            <item.icon className="h-5 w-5 text-blue-500" />
                          )}
                          {item.title}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="bg-slate-50/50 px-4 pb-3 pt-1">
                        <div className="flex flex-col ml-8 border-l-2 border-slate-200 pl-4 gap-1">
                          {item.children.map((child, cIdx) => (
                            <SheetClose key={cIdx} asChild>
                              <Link
                                href={child.href}
                                className="text-sm text-slate-600 hover:text-blue-600 py-2 block"
                              >
                                {child.title}
                              </Link>
                            </SheetClose>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                }

                // B. Jika Link Biasa -> Render Link
                return (
                  <SheetClose key={idx} asChild>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3.5 text-sm font-medium border-b border-slate-50 last:border-0 ${
                        pathname === item.href
                          ? "text-blue-600 bg-blue-50/50"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {item.icon && (
                        <item.icon className="h-5 w-5 text-blue-500" />
                      )}
                      {item.title}
                    </Link>
                  </SheetClose>
                );
              })}
            </Accordion>
          </div>

          {/* 2. KATEGORI LAYANAN (Database) */}
          <p className="px-4 pt-6 pb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            Layanan Kami
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

          {/* 3. LOGOUT (Jika Login) */}
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
  );
}
