"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  CalendarDays,
  Building2,
  Tags,
  FileText,
  LogOut,
  Globe,
  Settings,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

// Konfigurasi Menu (Mudah ditambah)
const NAV_ITEMS = [
//   { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Booking Masuk", href: "/admin/bookings", icon: CalendarDays },
  { label: "Kelola Layanan", href: "/admin/services", icon: Building2 },
  { label: "Kategori Layanan", href: "/admin/categories", icon: Tags },
  { label: "Blog & Berita", href: "/admin/posts", icon: FileText },
  { label: "Kategori Blog", href: "/admin/blog-categories", icon: Settings },
];

export default function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className={cn("pb-12 min-h-screen bg-white border-r border-slate-200", className)}>
      <div className="space-y-4 py-4">
        
        {/* HEADER SIDEBAR */}
        <div className="px-6 py-2">
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <span className="bg-blue-600 text-white p-1 rounded-md">
                <LayoutDashboard className="w-5 h-5" />
            </span>
            Admin Panel
          </h2>
          <p className="text-xs text-slate-500 mt-1">UPT Pusat Pengembangan Bisnis</p>
        </div>

        {/* MENU UTAMA */}
        <div className="px-3 py-2">
          <h3 className="mb-2 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Menu Utama
          </h3>
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link key={item.href} href={item.href} passHref>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 font-medium",
                      isActive 
                        ? "bg-blue-50 text-blue-700 hover:bg-blue-100" 
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", isActive ? "text-blue-600" : "text-slate-400")} />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* MENU SYSTEM */}
        <div className="px-3 py-2">
          <h3 className="mb-2 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Sistem
          </h3>
          <div className="space-y-1">
             <Link href="/" target="_blank">
                <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600">
                    <Globe className="h-4 w-4 text-slate-400" />
                    Lihat Website
                </Button>
             </Link>
             <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
             >
                <LogOut className="h-4 w-4" />
                Logout
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}