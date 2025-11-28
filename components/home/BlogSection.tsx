"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import { Button } from "@/components/ui/button";

const dummyPosts = [
  {
    id: 1,
    title: "Tips Memilih Gedung Pernikahan yang Tepat di Palembang",
    excerpt: "Menentukan lokasi pernikahan adalah langkah awal yang krusial. Simak tips berikut agar tidak salah pilih.",
    date: "28 Nov 2025",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=800&auto=format&fit=crop",
    category: "Tips & Trik"
  },
  {
    id: 2,
    title: "Prosedur Peminjaman Kendaraan Operasional UIN",
    excerpt: "Panduan lengkap bagi civitas akademika yang ingin meminjam kendaraan dinas untuk kegiatan resmi.",
    date: "25 Nov 2025",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800&auto=format&fit=crop",
    category: "Panduan"
  },
  {
    id: 3,
    title: "Fasilitas Baru di Auditorium Utama",
    excerpt: "Kami baru saja memperbarui sound system dan pencahayaan di Auditorium Utama untuk pengalaman acara yang lebih baik.",
    date: "20 Nov 2025",
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=800&auto=format&fit=crop",
    category: "Berita"
  }
];

export default function BlogSection() {
  return (
    <section className="py-24 bg-white border-t border-slate-100">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <FadeIn className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Artikel Terbaru</h2>
            <p className="text-slate-500">Informasi dan berita seputar kegiatan kampus.</p>
          </div>
          <Link href="/blog" className="hidden md:flex items-center gap-2 text-blue-600 font-bold hover:underline">
            Lihat Semua <ArrowRight className="w-4 h-4" />
          </Link>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {dummyPosts.map((post, idx) => (
            <FadeIn key={post.id} delay={idx * 0.1} className="h-full">
              <Link href={`/blog/${post.id}`} className="group flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
                <div className="relative h-56 w-full rounded-2xl overflow-hidden mb-5 bg-slate-100 shadow-sm border border-slate-100">
                  <Image 
                    src={post.image} 
                    alt={post.title} 
                    fill 
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-blue-700 shadow-sm">
                    {post.category}
                  </div>
                </div>
                <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                        <Calendar className="w-3 h-3" /> {post.date}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition leading-tight">
                        {post.title}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-3">
                        {post.excerpt}
                    </p>
                    <span className="mt-auto text-sm font-bold text-blue-600 group-hover:underline flex items-center gap-1">
                        Baca Selengkapnya <ArrowRight className="w-4 h-4" />
                    </span>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
        
        <div className="mt-10 text-center md:hidden">
             <Link href="/blog">
                <Button variant="outline" className="w-full">Lihat Semua Artikel</Button>
             </Link>
        </div>

      </div>
    </section>
  );
}