"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import {
  CreditCard,
  FileText,
  RefreshCcw,
  Bell,
  Users,
  Mail,
  Settings,
  LogOut,
  Ticket,
  Wallet,
  ChevronRight,
  Lock,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { useProfileData } from "@/hooks/useProfileData";

export default function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  
  // Data Mockup Menu sesuai Screenshot
  const menus = [
    { label: "Pesanan Saya", href: "/dashboard/mybooking", icon: Ticket }, // Ini yang aktif utama kita
    {
      label: "Kartu Saya",
      href: "/dashboard/cards",
      icon: CreditCard,
      disabled: true,
    },
    {
      label: "Daftar Pembelian",
      href: "/dashboard/transactions",
      icon: FileText,
      disabled: true,
    },
    {
      label: "Refunds",
      href: "/dashboard/refunds",
      icon: RefreshCcw,
      disabled: true,
    },
    {
      label: "Notifikasi Harga",
      href: "/dashboard/price-alerts",
      icon: Bell,
      disabled: true,
    },
    {
      label: "Detail Penumpang",
      href: "/dashboard/passengers",
      icon: Users,
      disabled: true,
    },
    {
      label: "Pengaturan Notifikasi",
      href: "/dashboard/settings/notifications",
      icon: Mail,
      disabled: true,
    },
    {
      label: "Akun Saya",
      href: "/dashboard/profile",
      icon: Settings,
    },
  ];
  const { fullName, initials, email } = useProfileData(user);
  
  // Coba ambil provider (Google/Email) dari metadata
  const provider = user.app_metadata?.provider || "Email";

  return (
    <Card className="overflow-hidden border-gray-200 shadow-sm h-fit">
      {/* SECTION 1: PROFILE HEADER */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-12 w-12 border border-gray-100">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-gray-100 text-gray-600 font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <h3
              className="font-bold text-gray-900 truncate"
              title={user.user_metadata?.full_name}
            >
              {user.user_metadata?.full_name || "User"}
            </h3>
            <p className="text-xs text-gray-400 capitalize">{provider}</p>
          </div>
        </div>

        {/* Bronze Badge Mockup */}
        {/* <div className="bg-gradient-to-r from-[#C59D5F] to-[#A87F43] text-white text-xs font-bold py-2 px-3 rounded-md flex justify-between items-center cursor-pointer hover:opacity-90 transition">
          <div className="flex items-center gap-1">
            <span>🥉</span> Kamu adalah Bronze Priority
          </div>
          <ChevronRight className="h-3 w-3" />
        </div> */}
      </div>

      {/* SECTION 2: POINTS & WALLET */}
      {/* <div className="p-4 border-b border-gray-100 space-y-3">
        <div className="flex items-center gap-3 text-sm text-gray-700">
          <div className="w-6 flex justify-center">
            <span className="text-blue-500 font-bold">P</span>
          </div>
          <span>0 Poin</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-700">
          <div className="w-6 flex justify-center">
            <Wallet className="h-4 w-4 text-blue-500" />
          </div>
          <span>Kartu Saya</span>
        </div>
      </div> */}

      {/* SECTION 3: NAVIGATION MENU */}
      <nav className="flex flex-col py-2">
        {menus.map((menu) => {
          const isActive = pathname === menu.href;

          // Class dasar untuk semua item (baik aktif maupun disabled)
          const baseClass = `
            flex items-center gap-3 px-4 py-3 text-sm font-medium border-l-4 transition-colors relative
          `;

          // Jika DISABLED
          if (menu.disabled) {
            return (
              <div
                key={menu.href}
                className={`${baseClass} text-gray-300 border-transparent cursor-not-allowed`}
                title="Fitur ini belum tersedia"
              >
                <menu.icon className="h-5 w-5 text-gray-300" />
                {menu.label}
                {/* Optional: Icon Gembok Kecil */}
                <Lock className="h-3 w-3 absolute right-4 text-gray-300 opacity-50" />
              </div>
            );
          }

          // Jika AKTIF (Normal)
          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`
                ${baseClass}
                ${
                  isActive
                    ? "bg-blue-50 text-blue-600 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent"
                }
              `}
            >
              <menu.icon
                className={`h-5 w-5 ${
                  isActive ? "text-blue-600" : "text-gray-400"
                }`}
              />
              {menu.label}
            </Link>
          );
        })}

        {/* LOGOUT BUTTON */}
        {/* <form
          action="/auth/signout"
          method="post"
          className="mt-2 border-t border-gray-100 pt-2"
        >
          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-colors border-l-4 border-transparent">
            <LogOut className="h-5 w-5 text-gray-400 group-hover:text-red-600" />
            Log Out
          </button>
        </form> */}
      </nav>
    </Card>
  );
}
