'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, RefreshCcw, Loader2 } from 'lucide-react';
import { toast } from "sonner";

export default function AdminScanPage() {
  const supabase = createClient();
  
  // State
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(true); // Kontrol kamera

  // Fungsi saat QR terbaca
  const handleScan = async (text: string) => {
    if (!text || loading) return;
    
    // Matikan scanner sementara biar gak scan berkali-kali
    setIsScanning(false);
    setLoading(true);
    setScannedResult(text);

    try {
      // 1. Cek ke Database berdasarkan ID dari QR
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          service:services (name),
          profile:profiles (full_name)
        `)
        .eq('id', text) // Asumsi QR isinya UUID Booking
        .single();

      if (error || !data) {
        throw new Error("Data booking tidak ditemukan!");
      }

      setBookingData(data);
      
      // Feedback Visual
      if (data.status === 'confirmed') {
        toast.success("Tiket Valid!");
      } else {
        toast.error("Tiket Tidak Valid / Belum Lunas");
      }

    } catch (err: any) {
      toast.error(err.message);
      setBookingData(null);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi Reset untuk scan lagi
  const handleReset = () => {
    setScannedResult(null);
    setBookingData(null);
    setIsScanning(true);
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Scan E-Tiket</h1>
        {bookingData && (
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Scan Lagi
          </Button>
        )}
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0 relative bg-black min-h-[300px] flex items-center justify-center">
          
          {/* AREA KAMERA */}
          {isScanning ? (
            <Scanner 
              onResult={(result) => handleScan(result)}
              onError={(error) => console.log(error?.message)}
              options={{
                delayBetweenScanAttempts: 500,
                constraints: { facingMode: 'environment' } // Pakai kamera belakang
              }}
              styles={{
                container: { width: '100%', height: '100%' }
              }}
            />
          ) : (
            <div className="text-white text-center p-6">
                {loading ? (
                    <div className="flex flex-col items-center">
                        <Loader2 className="h-10 w-10 animate-spin mb-2 text-blue-500"/>
                        <p>Memverifikasi...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <p className="text-gray-400 mb-2">Hasil Scan:</p>
                        <p className="font-mono text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded">{scannedResult}</p>
                    </div>
                )}
            </div>
          )}
          
          {/* Overlay Garis Scan (Hiasan) */}
          {isScanning && (
             <div className="absolute inset-0 border-2 border-blue-500/50 m-12 rounded-lg pointer-events-none animate-pulse"></div>
          )}
        </CardContent>
      </Card>

      {/* HASIL VERIFIKASI */}
      {bookingData && (
        <Card className={`border-l-4 ${bookingData.status === 'confirmed' ? 'border-l-green-500' : 'border-l-red-500'}`}>
          <CardHeader className="bg-gray-50/50 pb-2">
            <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Hasil Verifikasi</CardTitle>
                {bookingData.status === 'confirmed' ? (
                    <Badge className="bg-green-600 text-white hover:bg-green-700">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> VALID
                    </Badge>
                ) : (
                    <Badge variant="destructive">
                        <XCircle className="w-3 h-3 mr-1" /> {bookingData.status.toUpperCase()}
                    </Badge>
                )}
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div>
                <p className="text-xs text-gray-500 uppercase">Nama Layanan</p>
                <p className="font-bold text-gray-900">{bookingData.service.name}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-xs text-gray-500 uppercase">Tamu</p>
                    <p className="font-medium">{bookingData.customer_name}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 uppercase">Tanggal</p>
                    <p className="font-medium">{new Date(bookingData.start_time).toLocaleDateString('id-ID')}</p>
                </div>
            </div>
            
            {/* Tombol Check-in (Opsional) */}
            {bookingData.status === 'confirmed' && (
                <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                    ✅ Konfirmasi Check-in Tamu
                </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}