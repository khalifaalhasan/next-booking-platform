import React from "react";
import { createClient } from "@/utils/supabase/server";
import {
  CalendarCheck,
  Building2, // Icon untuk Organisasi
  Briefcase,
  FileText,
} from "lucide-react";

import { StatCard } from "@/components/dashboard/StatCard";
import { RecentBookingTable } from "@/components/dashboard/RecentBookingTable";
import { Database } from "@/types/supabase";
import Link from "next/link";
import AdminPageHeader from "@/components/admin/AdminPageheader";

// Definisi tipe data untuk props Tabel
type BookingWithRelations = {
  id: string;
  start_time: string;
  status: string;
  customer_name: string | null;
  services: { name: string } | null;
  profiles: { full_name: string | null; phone_number: string | null } | null;
};

// Pastikan halaman ini dirender ulang tiap request (Realtime-ish)
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // 1. Await createClient (PENTING: Perbaikan dari error sebelumnya)
  const supabase = await createClient();

  // 2. Fetching Data secara Paralel (Efisien)
  const [bookingData, teamData, serviceData, postData, recentBookingsData] =
    await Promise.all([
      // CARD 1: BOOKING MASUK (Filter status yang butuh perhatian)
      supabase
        .from("bookings")
        .select("*", { count: "exact", head: true }) // head: true = cuma ambil jumlah
        .in("status", ["waiting_verification", "pending_payment"]),

      // CARD 2: KELOLA ORGANISASI (Tabel 'teams')
      supabase.from("teams").select("*", { count: "exact", head: true }),

      // CARD 3: LAYANAN (Tabel 'services' yang aktif)
      supabase
        .from("services")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true),

      // CARD 4: BLOG (Tabel 'posts' yang published)
      supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("is_published", true),

      // TABEL BAWAH: 5 Booking Terakhir
      supabase
        .from("bookings")
        .select(
          `
        id,
        start_time,
        status,
        customer_name,
        services ( name ),
        profiles ( full_name, phone_number )
      `
        )
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  // 3. Ekstrak Data Count (Handle null dengan || 0)
  const bookingCount = bookingData.count || 0;
  const teamCount = teamData.count || 0;
  const serviceCount = serviceData.count || 0;
  const postCount = postData.count || 0;

  // Konversi data tabel (Assertion untuk TypeScript)
  const recentBookings = (recentBookingsData.data ||
    []) as unknown as BookingWithRelations[];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <AdminPageHeader
          title="Dashboard"
          description="Ringkasan aktivitas UPT Pusat Pengembangan Bisnis."
          />
        
      </div>

      {/* --- STAT CARDS (REAL DATA) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Relevan dengan menu 'Booking Masuk' */}
        <StatCard
          label="Booking Pending"
          value={bookingCount}
          subValue="Menunggu konfirmasi admin"
          icon={CalendarCheck}
          colorClass="bg-amber-50 text-amber-600"
        />

        {/* Card 2: Relevan dengan menu 'Kelola Organisasi' */}
        <StatCard
          label="Total Organisasi"
          value={teamCount}
          subValue="Tim & Struktur tercatat"
          icon={Building2}
          colorClass="bg-blue-50 text-blue-600"
        />

        {/* Card 3: Relevan dengan menu 'Kelola Layanan' */}
        <StatCard
          label="Layanan Aktif"
          value={serviceCount}
          subValue="Layanan tersedia publik"
          icon={Briefcase}
          colorClass="bg-emerald-50 text-emerald-600"
        />

        {/* Card 4: Relevan dengan menu 'Blog & Berita' */}
        <StatCard
          label="Artikel Terbit"
          value={postCount}
          subValue="Total berita dipublikasi"
          icon={FileText}
          colorClass="bg-purple-50 text-purple-600"
        />
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tabel Booking */}
        <RecentBookingTable bookings={recentBookings} />

        {/* Widget Samping */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-2">Aksi Cepat</h3>
            <p className="text-xs text-slate-400 mb-4">
              Shortcut menu manajemen
            </p>
            <div className="space-y-3">
              <Link
                href="/admin/bookings"
                className="block w-full text-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Cek Booking Masuk
              </Link>
              <a
                href="/admin/services"
                className="block w-full text-center px-4 py-2 rounded-lg bg-slate-50 text-slate-700 text-sm font-medium hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                Kelola Layanan
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
