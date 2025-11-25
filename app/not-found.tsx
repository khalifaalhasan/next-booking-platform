import Link from 'next/link';
import { MapPinOff } from 'lucide-react'; // Pastikan sudah install lucide-react
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      
      {/* Icon Ilustrasi */}
      <div className="bg-blue-100 p-6 rounded-full mb-6 animate-bounce">
        <MapPinOff className="w-16 h-16 text-blue-600" />
      </div>

      <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
        404 - Halaman Tidak Ditemukan
      </h1>
      
      <p className="text-gray-500 max-w-md mb-8">
        Maaf, halaman yang Anda tuju sepertinya sudah dipindahkan atau tidak pernah ada di sistem kami.
      </p>

      <div className="flex gap-4">
        <Link href="/">
          <Button className="bg-blue-600 hover:bg-blue-700 px-8">
            Kembali ke Beranda
          </Button>
        </Link>
        <Link href="/services">
          <Button variant="outline">
            Cari Layanan Lain
          </Button>
        </Link>
      </div>

      <p className="mt-12 text-xs text-gray-400">
        Pusat Pengembangan Bisnis &copy; {new Date().getFullYear()}
      </p>
    </div>
  );
}