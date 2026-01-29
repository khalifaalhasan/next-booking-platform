"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

import UserNav from "@/components/layouts/UserNav";
import LoginTrigger from "@/components/auth/LoginTrigger";

// Import komponen hasil refactor
import { MobileMenu } from "./mobile-menu";
import { DesktopNav } from "./desktop-nav";
import { CategoryBar } from "./category-bar";
import { CategoryWithServices } from "./types";

export function Navbar() {
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
      },
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
            
            {/* Component Menu Mobile */}
            <MobileMenu user={user} categories={categories} />

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
            
            {/* Component Menu Desktop (Link + Dropdown) */}
            <DesktopNav />

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

      {/* --- MEGA MENU DESKTOP (CATEGORY BAR) --- */}
      <CategoryBar categories={categories} />
      
    </header>
  );
}