import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  CalendarDays,
  Building2,
  Globe,
  LogOut,
  Tags,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // 1. Cek User Login & Role
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  return (
    <div className="min-h-screen flex bg-muted/40 font-sans text-slate-900">
      {/* SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-10 w-64 border-r bg-white hidden md:block">
        <div className="flex h-16 items-center border-b px-6">
          <h2 className="text-lg font-bold tracking-tight">ADMIN PANEL</h2>
        </div>
        <nav className="flex flex-col gap-2 p-4">
          {/* MENU BARU: KATEGORI */}
          <Link href="/admin/categories">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Tags className="h-4 w-4" />
              Kelola Kategori
            </Button>
          </Link>
          <Link href="/admin/bookings">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <CalendarDays className="h-4 w-4" />
              Kelola Booking
            </Button>
          </Link>
          <Link href="/admin/services">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Building2 className="h-4 w-4" />
              Kelola Service
            </Button>
          </Link>

          <div className="my-2 border-t" />

          <Link href="/">
            <Button variant="outline" className="w-full justify-start gap-2">
              <Globe className="h-4 w-4" />
              Lihat Website
            </Button>
          </Link>

          <form action="/auth/signout" method="post">
            <Button
              variant="destructive"
              className="w-full justify-start gap-2 mt-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </form>
        </nav>
      </aside>

      {/* CONTENT AREA */}
      <main className="flex-1 md:ml-64 p-8">{children}</main>
    </div>
  );
}
