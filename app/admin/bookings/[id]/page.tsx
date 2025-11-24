'use client';

import { useState, useEffect, use } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Tables } from '@/types/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminBookingDetail({ params }: PageProps) {
  const { id } = use(params);
  const supabase = createClient();
  const router = useRouter();
  
  const [booking, setBooking] = useState<any>(null);
  const [payments, setPayments] = useState<Tables<'payments'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      const { data: bData } = await supabase
        .from('bookings')
        .select(`*, service:services(*)`)
        .eq('id', id)
        .single();
      setBooking(bData);

      const { data: pData } = await supabase
        .from('payments')
        .select('*')
        .eq('booking_id', id)
        .order('created_at', { ascending: false });
      setPayments(pData || []);
      setLoading(false);
    };
    fetchData();
  }, [id, supabase]);

  // Handle Verify
  const handleVerify = async (paymentId: string, status: 'verified' | 'rejected') => {
    setProcessingId(paymentId);
    
    const { error } = await supabase
      .from('payments')
      .update({ status: status, verified_at: new Date().toISOString() })
      .eq('id', paymentId);

    if (error) {
        alert('Error: ' + error.message);
    } else {
        router.refresh();
        window.location.reload();
    }
    setProcessingId(null);
  };

  const formatRupiah = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!booking) return <div>Data not found</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/bookings">
            <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Verifikasi Pembayaran</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card Info Booking */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Pesanan</CardTitle>
            <CardDescription>ID: {booking.id}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="text-lg font-bold">{booking.service.name}</div>
             <div className="text-sm text-muted-foreground">
                {new Date(booking.start_time).toLocaleDateString()} - {new Date(booking.end_time).toLocaleDateString()}
             </div>
             <Separator />
             <div className="flex justify-between">
                <span>Total Tagihan:</span>
                <span className="font-bold">{formatRupiah(booking.total_price)}</span>
             </div>
             <div className="flex justify-between text-green-600">
                <span>Sudah Masuk (Verified):</span>
                <span className="font-bold">{formatRupiah(booking.total_paid || 0)}</span>
             </div>
             <div className="flex justify-between">
                <span>Status System:</span>
                <Badge variant="outline">{booking.status}</Badge>
             </div>
          </CardContent>
        </Card>

        {/* Card Info User */}
        <Card>
          <CardHeader>
            <CardTitle>Data Pemesan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="grid grid-cols-3 gap-1 text-sm">
                <span className="text-muted-foreground">Nama:</span>
                <span className="col-span-2 font-medium">{booking.customer_name}</span>
                
                <span className="text-muted-foreground">Email:</span>
                <span className="col-span-2">{booking.customer_email}</span>
                
                <span className="text-muted-foreground">HP:</span>
                <span className="col-span-2">{booking.customer_phone}</span>
                
                <span className="text-muted-foreground">Catatan:</span>
                <span className="col-span-2 italic">{booking.notes || '-'}</span>
             </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-bold mt-8">Riwayat Bukti Transfer</h2>
      
      <div className="space-y-4">
        {payments.map((payment) => (
          <Card key={payment.id} className={payment.status === 'pending' ? 'border-blue-200 bg-blue-50/50' : ''}>
            <CardContent className="p-6 flex flex-col md:flex-row gap-6">
                
                {/* Bukti Gambar */}
                <div className="w-full md:w-1/3 aspect-video bg-muted rounded-md overflow-hidden border relative group">
                    {payment.payment_proof_url ? (
                        <a href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${payment.payment_proof_url}`} target="_blank">
                            <img 
                                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${payment.payment_proof_url}`} 
                                className="w-full h-full object-cover transition group-hover:scale-105" 
                                alt="Bukti"
                            />
                        </a>
                    ) : (
                        <div className="flex items-center justify-center h-full text-xs text-muted-foreground">No Image</div>
                    )}
                </div>

                {/* Info & Action */}
                <div className="flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-2xl font-bold">{formatRupiah(payment.amount)}</div>
                                <div className="text-sm text-muted-foreground">{new Date(payment.created_at).toLocaleString()}</div>
                                <div className="text-sm mt-1 font-medium text-slate-700">Via {payment.payment_type}</div>
                            </div>
                            <Badge variant={payment.status === 'verified' ? 'default' : payment.status === 'rejected' ? 'destructive' : 'secondary'}>
                                {payment.status.toUpperCase()}
                            </Badge>
                        </div>
                    </div>

                    {/* Tombol Aksi (Hanya muncul jika Pending) */}
                    {payment.status === 'pending' && (
                        <div className="flex gap-3 mt-6">
                            <Button 
                                onClick={() => handleVerify(payment.id, 'verified')}
                                disabled={!!processingId}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {processingId === payment.id ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <CheckCircle className="mr-2 h-4 w-4"/>}
                                Terima (Approve)
                            </Button>
                            
                            <Button 
                                onClick={() => handleVerify(payment.id, 'rejected')}
                                disabled={!!processingId}
                                variant="destructive"
                            >
                                <XCircle className="mr-2 h-4 w-4"/>
                                Tolak
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
          </Card>
        ))}
        {payments.length === 0 && <p className="text-muted-foreground text-center py-10">Belum ada pembayaran masuk.</p>}
      </div>
    </div>
  );
}