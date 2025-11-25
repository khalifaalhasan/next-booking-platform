'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  
  useEffect(() => {
    // Log error ke console (atau service log seperti Sentry)
    console.error('Runtime Error:', error);
  }, [error]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white px-4 text-center">
      
      <div className="bg-red-50 p-6 rounded-full mb-6">
        <AlertTriangle className="w-16 h-16 text-red-500" />
      </div>

      <h2 className="text-3xl font-bold text-gray-900 mb-2">
        Ups! Terjadi Kesalahan
      </h2>
      
      <p className="text-gray-500 max-w-md mb-8">
        Kami mengalami kendala saat memproses permintaan Anda. Tim teknis kami mungkin sudah mengetahuinya.
      </p>

      {/* Tampilkan pesan error teknis (Hanya di Dev Mode biar aman) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-8 p-4 bg-gray-100 rounded text-xs font-mono text-red-600 max-w-lg overflow-auto text-left">
          {error.message || 'Unknown Error'}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={reset} // Fungsi bawaan Next.js untuk coba reload komponen yang error saja
          className="bg-gray-900 hover:bg-black text-white"
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          Coba Lagi
        </Button>
        
        <Link href="/">
          <Button variant="outline">
            Kembali ke Home
          </Button>
        </Link>
      </div>
    </div>
  );
}