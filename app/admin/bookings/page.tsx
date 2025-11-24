import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
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

export default async function AdminBookingsPage() {
  const supabase = await createClient();

  const { data: bookings } = await supabase
    .from('bookings')
    .select(`*, service:services(name), profile:profiles(full_name, email)`)
    .order('created_at', { ascending: false });

  // Helper Badge Color
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid': return 'default'; // Hitam/Primary
      case 'partial': return 'secondary'; // Abu
      case 'unpaid': return 'destructive'; // Merah
      default: return 'outline';
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
                <TableHead>Status Pembayaran</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings?.map((booking: any) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    {new Date(booking.created_at).toLocaleDateString('id-ID')}
                  </TableCell>
                  <TableCell className="font-medium">{booking.service?.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{booking.customer_name}</span>
                      <span className="text-xs text-muted-foreground">{booking.customer_email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(booking.payment_status)}>
                      {booking.payment_status?.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/bookings/${booking.id}`}>
                      <Button size="sm" variant="outline">Detail & Verifikasi</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}