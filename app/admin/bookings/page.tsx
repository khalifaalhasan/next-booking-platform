import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, Clock, Banknote } from "lucide-react";
import { Tables } from "@/types/supabase";
import AdminPageHeader from "@/components/admin/AdminPageheader";

// Definisikan Tipe Data Booking dengan Relasi
type BookingWithRelations = Tables<"bookings"> & {
  service: { name: string } | null;
  profile: { full_name: string; email: string; phone_number: string } | null;
};

// Helper Format Rupiah
const formatRupiah = (num: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num);

// Sub-Component: Status Badge (Dipisah keluar)
function StatusBadge({ status, payment }: { status: string; payment: string }) {
  if (status === "waiting_verification") {
    return (
      <Badge className="bg-orange-500 hover:bg-orange-600">
        <Clock className="w-3 h-3 mr-1" /> Cek Bukti
      </Badge>
    );
  }
  if (status === "confirmed") {
    if (payment === "paid")
      return (
        <Badge className="bg-green-600 hover:bg-green-700">
          <CheckCircle2 className="w-3 h-3 mr-1" /> Lunas
        </Badge>
      );
    if (payment === "partial")
      return (
        <Badge
          variant="secondary"
          className="bg-blue-100 text-blue-700 hover:bg-blue-200"
        >
          <Banknote className="w-3 h-3 mr-1" /> DP (Cicilan)
        </Badge>
      );
  }
  if (status === "pending_payment") {
    return (
      <Badge variant="outline" className="text-slate-500">
        Belum Bayar
      </Badge>
    );
  }
  if (status === "cancelled") {
    return <Badge variant="destructive">Batal</Badge>;
  }
  return <Badge variant="secondary">{status}</Badge>;
}

// Sub-Component: Booking Table (Dipisah keluar)
const BookingTable = ({ data }: { data: BookingWithRelations[] }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>ID & Tanggal</TableHead>
        <TableHead>Layanan</TableHead>
        <TableHead>Pemesan</TableHead>
        <TableHead>Tagihan</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="text-right">Aksi</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.length === 0 ? (
        <TableRow>
          <TableCell colSpan={6} className="text-center py-8 text-slate-500">
            Tidak ada data booking.
          </TableCell>
        </TableRow>
      ) : (
        data.map((booking) => (
          <TableRow key={booking.id}>
            <TableCell>
              <div className="flex flex-col">
                <span className="font-mono text-xs text-slate-500">
                  #{booking.id.slice(0, 8)}
                </span>
                <span className="text-sm">
                  {booking.created_at
                    ? new Date(booking.created_at).toLocaleDateString("id-ID")
                    : "-"}
                </span>
              </div>
            </TableCell>
            <TableCell className="font-medium">
              {booking.service?.name}
              <div className="text-xs text-slate-500 mt-0.5">
                {new Date(booking.start_time).toLocaleDateString()} -{" "}
                {new Date(booking.end_time).toLocaleDateString()}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span className="font-medium text-sm">
                  {booking.customer_name}
                </span>
                <span className="text-xs text-slate-500">
                  {booking.customer_phone}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span className="font-bold text-slate-800">
                  {formatRupiah(booking.total_price)}
                </span>
                {booking.payment_status === "partial" && (
                  <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 rounded w-fit">
                    Sisa:{" "}
                    {formatRupiah(
                      booking.total_price - (booking.total_paid || 0)
                    )}
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell>
              <StatusBadge
                // Kalo status null, anggap aja "pending"
                status={booking.status ?? "pending"}
                // Kalo payment status null, anggap aja "pending"
                payment={booking.payment_status ?? "pending"}
              />
            </TableCell>
            <TableCell className="text-right">
              <Link href={`/admin/bookings/${booking.id}`}>
                <Button
                  size="sm"
                  variant={
                    booking.status === "waiting_verification"
                      ? "default"
                      : "outline"
                  }
                  className="h-8 text-xs"
                >
                  {booking.status === "waiting_verification"
                    ? "Verifikasi"
                    : "Detail"}
                </Button>
              </Link>
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  </Table>
);

export default async function AdminBookingsPage() {
  const supabase = await createClient();

  // Fetch Booking dengan Relasi Profile & Service
  const { data: bookings } = await supabase
    .from("bookings")
    .select(
      `*, service:services(name), profile:profiles(full_name, email, phone_number)`
    )
    .order("created_at", { ascending: false });

  // Filter Data untuk Tabs
  const allBookings = (bookings as unknown as BookingWithRelations[]) || [];

  const waitingVerification = allBookings.filter(
    (b) => b.status === "waiting_verification"
  );
  const pendingPayment = allBookings.filter(
    (b) => b.status === "pending_payment"
  );
  const confirmed = allBookings.filter(
    (b) => b.status === "confirmed" || b.status === "completed"
  );

  return (
    <div className="space-y-6">
      <div>
        <AdminPageHeader
          title="Kelola Booking Masuk"
          description=" Kelola pesanan dan verifikasi pembayaran."
        />
      </div>

      {/* TABS NAVIGATION */}
      <Tabs defaultValue="waiting" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="waiting" className="relative">
            Perlu Verifikasi
            {waitingVerification.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">
                {waitingVerification.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending">Belum Bayar</TabsTrigger>
          <TabsTrigger value="confirmed">Selesai/Lunas</TabsTrigger>
          <TabsTrigger value="all">Semua</TabsTrigger>
        </TabsList>

        {/* TAB CONTENT: WAITING VERIFICATION */}
        <TabsContent value="waiting" className="mt-4">
          <Card className="border-orange-200 bg-orange-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <AlertCircle className="w-5 h-5" /> Menunggu Verifikasi
                Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-white rounded-b-xl border-t border-orange-100 pt-0 px-0">
              <BookingTable data={waitingVerification} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB CONTENT: PENDING PAYMENT */}
        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Menunggu Pembayaran User</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <BookingTable data={pendingPayment} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB CONTENT: CONFIRMED */}
        <TabsContent value="confirmed" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Booking Selesai</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <BookingTable data={confirmed} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB CONTENT: ALL */}
        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Semua Transaksi</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <BookingTable data={allBookings} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
