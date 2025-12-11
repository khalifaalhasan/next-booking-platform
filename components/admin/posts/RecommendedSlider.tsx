"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Calendar } from "lucide-react";
import { Tables } from "@/types/supabase";
import { formatDateIndo } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Post = Tables<"posts">;

export default function RecommendedSlider({ posts }: { posts: Post[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 320; // Lebar card + gap
      if (direction === "left") {
        current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  if (posts.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h3 className="text-2xl font-bold text-slate-900">Mungkin Anda Tertarik</h3>
            <p className="text-sm text-slate-500">Rekomendasi artikel pilihan lainnya.</p>
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex gap-2">
          <Button onClick={() => scroll("left")} variant="outline" size="icon" className="rounded-full border-slate-200 hover:bg-slate-50">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
          <Button onClick={() => scroll("right")} variant="outline" size="icon" className="rounded-full border-slate-200 hover:bg-slate-50">
            <ArrowRight className="w-5 h-5 text-slate-600" />
          </Button>
        </div>
      </div>

      {/* Slider Container */}
      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-8 pt-2 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {posts.map((post) => (
          <Link 
            key={post.id} 
            href={`/blog/${post.slug}`}
            className="min-w-[280px] md:min-w-[320px] snap-start group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
          >
            <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                {post.thumbnail_url ? (
                    <Image src={post.thumbnail_url} alt={post.title} fill className="object-cover group-hover:scale-105 transition duration-500" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">No Image</div>
                )}
                 <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-md text-[10px] font-bold text-slate-700 shadow-sm">
                    {post.category}
                </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-2">
                    <Calendar className="w-3 h-3" /> {formatDateIndo(post.created_at)}
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-2 leading-snug group-hover:text-blue-600 transition line-clamp-2">
                    {post.title}
                </h4>
                <div className="mt-auto pt-3 border-t border-slate-50">
                     <span className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                        Baca Artikel <ArrowRight className="w-3 h-3" />
                     </span>
                </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}