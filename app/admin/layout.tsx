import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminMobileHeader from "@/components/admin/AdminMobileHeader";
import AdminHeader from "@/components/admin/AdminHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // 1. Cek User Login
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 2. Cek Role Admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900 flex flex-col md:flex-row">
      {/* SIDEBAR DESKTOP (Hidden di Mobile) */}
      <aside className="hidden md:block w-64 fixed inset-y-0 z-50">
        <AdminSidebar />
      </aside>

      {/* HEADER MOBILE (Hidden di Desktop) */}
      <AdminMobileHeader />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 md:ml-64 min-h-screen transition-all duration-300 ease-in-out">
        <AdminHeader />
        <div className="container max-w-7xl mx-auto p-4 md:p-8 pt-6">
          {children}
        </div>
      </main>
    </div>
  );
}
