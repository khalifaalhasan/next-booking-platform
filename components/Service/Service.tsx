import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import Image from 'next/image';

// Helper untuk format Rupiah
const formatRupiah = (number: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
};

export default async function ServicesPage() {
  const supabase = await createClient();

  // Fetch data services
  const { data: services, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    return <div className="p-10 text-center text-red-500">Error loading services</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Layanan & Fasilitas Kami</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Temukan gedung, ruang pertemuan, dan aset terbaik untuk kebutuhan acara atau bisnis Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services?.map((service) => (
          <Link 
            href={`/services/${service.slug}`} 
            key={service.id}
            className="group bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 overflow-hidden flex flex-col"
          >
            {/* Image Section */}
            <div className="relative h-48 w-full bg-gray-200">
              {service.images && service.images.length > 0 ? (
                // Gunakan next/image, pastikan domain supabase storage diizinkan di next.config.js
                <img 
                  src={service.images[0]} 
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No Image
                </div>
              )}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-semibold text-blue-600">
                {service.unit === 'per_day' ? 'Harian' : 'Per Jam'}
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition">
                {service.name}
              </h3>
              <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow">
                {service.description}
              </p>
              
              <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                <div className="text-lg font-bold text-gray-900">
                  {formatRupiah(service.price)}
                </div>
                <span className="text-sm text-blue-600 font-medium group-hover:underline">
                  Lihat Detail →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {services?.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          Belum ada layanan yang tersedia saat ini.
        </div>
      )}
    </div>
  );
}