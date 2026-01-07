"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Briefcase,
  Tags,
  FileText,
  Layers,
  Globe,
  LogOut,
  NotebookPen,
  CalendarPlus2,
  BadgePercent,
} from "lucide-react";

// 1. Definisikan tipe Props
interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className = "" }: SidebarProps) => {
  const pathname = usePathname();

  const menuGroups = [
    {
      title: "MENU UTAMA",
      items: [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard },

        {
          label: "Kelola Promosi",
          href: "/admin/promotions",
          icon: BadgePercent,
        },
        { label: "Kelola Organisasi", href: "/admin/teams", icon: Users },
        { label: "Kelola Katalog", href: "/admin/catalogs", icon: NotebookPen },
        {
          label: "Kelola Kegiatan",
          href: "/admin/events",
          icon: CalendarPlus2,
        },
      ],
    },
    {
      title: "MENU BOOKING",
      items: [
        { label: "Booking Masuk", href: "/admin/bookings", icon: CalendarDays },
      ],
    },
    {
      title: "MENU LAYANAN",
      items: [
        { label: "Kelola Layanan", href: "/admin/services", icon: Briefcase },
        {
          label: "Kategori Layanan",
          href: "/admin/service-categories",
          icon: Tags,
        },
      ],
    },
    {
      title: "MENU BLOG",
      items: [
        { label: "Blog & Berita", href: "/admin/blog", icon: FileText },
        {
          label: "Kategori Blog",
          href: "/admin/blog-categories",
          icon: Layers,
        },
      ],
    },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white shadow-sm transition-transform ${className}`}
    >
      {/* Header Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-100/80">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/20">
          <LayoutDashboard size={20} strokeWidth={2} />
        </div>
        <div className="flex flex-col overflow-hidden">
          <h1 className="text-base font-bold text-slate-800 leading-tight">
            Admin Panel
          </h1>
          <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-slate-500 mt-0.5">
            UPT Pengembangan Bisnis
          </p>
        </div>
      </div>

      {/* Menu List */}
      <div className="h-full overflow-y-auto px-4 pb-20 custom-scrollbar">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="mb-6">
            <h3 className="mb-2 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {group.title}
            </h3>
            <ul className="space-y-1">
              {group.items.map((item, itemIdx) => {
                // --- LOGIC PERBAIKAN START ---
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);
                // --- LOGIC PERBAIKAN END ---

                return (
                  <li key={itemIdx}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <item.icon size={19} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {/* Footer System */}
        <div className="mt-8 border-t border-slate-100 pt-6">
          <h3 className="mb-2 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Sistem
          </h3>
          <div className="space-y-1">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              <Globe size={19} />
              Lihat Website
            </Link>
            <button className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50">
              <LogOut size={19} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
