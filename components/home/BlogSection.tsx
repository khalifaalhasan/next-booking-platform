"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import { Button } from "@/components/ui/button";
import { formatDateIndo } from "@/lib/utils";
import { Tables } from "@/types/supabase";
import SectionHeader from "../ui/SectionHeader";

type Post = Tables<"posts">;

export default function BlogSection({ posts }: { posts: Post[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!posts || posts.length === 0) return null;

  // Logic Scroll Button
  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      // Geser sebesar lebar kartu + gap (sekitar 350px - 400px)
      const scrollAmount = 380;

      if (direction === "left") {
        current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  return (
    <section className="py-24 bg-white border-t border-slate-100 relative overflow-hidden">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Dari Blog Kami"
          subtitle="Tips, berita, dan wawasan terbaru seputar penyewaan aset bisnis."
          badge="Artikel terbaru"
          action={{ href: "/blog", label: "Lihat Semua Artikel" }}
        />

        {/* --- SCROLLABLE CONTENT --- */}
        <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0 group">
          {/* - overflow-x-auto: Agar bisa discroll
                - scrollbar-hide: Menyembunyikan scrollbar native (biar rapi)
                - snap-x: Agar berhenti pas di tengah kartu (seperti magnet)
             */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-12 pt-4 scrollbar-hide snap-x snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }} // Fallback hide scrollbar
          >
            {posts.map((post, idx) => (
              <FadeIn
                key={post.id}
                delay={idx * 0.1}
                className="min-w-[85%] sm:min-w-[350px] md:min-w-[380px] snap-center h-full"
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="group/card flex flex-col h-full bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-500 ease-out"
                >
                  {/* IMAGE */}
                  <div className="relative h-60 w-full bg-slate-100 overflow-hidden">
                    {post.thumbnail_url ? (
                      <Image
                        src={post.thumbnail_url}
                        alt={post.title}
                        fill
                        className="object-cover group-hover/card:scale-110 transition duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                        No Image
                      </div>
                    )}

                    {/* Badge Kategori */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-slate-800 shadow-sm border border-white/50">
                      {post.category || "Umum"}
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="p-6 flex-1 flex flex-col relative">
                    {/* Tanggal */}
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">
                      <Calendar className="w-3.5 h-3.5" />{" "}
                      {formatDateIndo(post.created_at)}
                    </div>

                    {/* Judul */}
                    <h3 className="text-xl font-bold text-slate-900 mb-3 leading-snug group-hover/card:text-blue-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
                      {post.content
                        ?.replace(/<[^>]*>?/gm, "")
                        .substring(0, 100)}
                      ...
                    </p>

                    {/* Footer Card */}
                    <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 group-hover/card:text-blue-600 transition-colors">
                        Baca Artikel
                      </span>
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover/card:bg-blue-600 group-hover/card:text-white transition-all duration-300 transform group-hover/card:rotate-[-45deg]">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>

          {/* Fade Gradient (Kanan) - Memberi ilusi ada konten lebih */}
          <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none md:hidden z-10"></div>
        </div>

        {/* Tombol Mobile Only */}
        <div className="mt-2 text-center md:hidden">
          <Link href="/blog">
            <Button
              variant="outline"
              className="w-full rounded-full border-slate-300 text-slate-600"
            >
              Lihat Semua Artikel
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
