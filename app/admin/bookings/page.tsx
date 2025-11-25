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

// 1. Helper Format Rupiah (Didefinisikan di sini)
const formatRupiah = (num: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num);

export default async function AdminBookingsPage() {
  const supabase = await createClient();

  const { data: bookings } = await supabase
    .from("bookings")
    .select(`*, service:services(name), profile:profiles(full_name, email)`)
    .order("created_at", { ascending: false });

  // 2. Helper Badge Color (Update Logic)
  const getBadgeVariant = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "paid":
        return "default"; // Hitam (Lunas)
      case "partial":
        return "secondary"; // Abu-abu/Biru Muda (DP / Cicilan) -> INI YANG BARU
      case "unpaid":
        return "destructive"; // Merah (Belum Bayar)
      default:
        return "outline";
    }
  };

  // Helper Label Status
  const getStatusLabel = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "paid":
        return "LUNAS";
      case "partial":
        return "DP / CICILAN";
      case "unpaid":
        return "BELUM BAYAR";
      default:
        return paymentStatus.toUpperCase();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Booking Masuk</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Pemesan</TableHead>
                <TableHead>Total Harga</TableHead>
                <TableHead>Sudah Bayar</TableHead>
                <TableHead>Status Pembayaran</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings?.map((booking: any) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    {new Date(booking.created_at).toLocaleDateString("id-ID")}
                  </TableCell>
                  <TableCell className="font-medium">
                    {booking.service?.name}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {booking.customer_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {booking.customer_email}
                      </span>
                    </div>
                  </TableCell>

                  {/* 3. Tampilkan Nominal Uang */}
                  <TableCell>{formatRupiah(booking.total_price)}</TableCell>
                  <TableCell className="font-bold text-green-600">
                    {formatRupiah(booking.total_paid || 0)}
                  </TableCell>

                  {/* 4. Badge Status dengan DP */}
                  <TableCell>
                    <Badge variant={getBadgeVariant(booking.payment_status)}>
                      {getStatusLabel(booking.payment_status)}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <Link href={`/admin/bookings/${booking.id}`}>
                      <Button size="sm" variant="outline">
                        Detail & Verifikasi
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}

              {bookings?.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-10 text-gray-500"
                  >
                    Belum ada data booking.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
