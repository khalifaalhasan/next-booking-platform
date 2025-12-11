"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, ArrowRight, BookOpen, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tables } from "@/types/supabase";
import { formatDateIndo } from "@/lib/utils";

type Post = Tables<"posts">;
type BlogCategory = Tables<"blog_categories">;

interface BlogDetailSidebarProps {
  relatedPosts: Post[];
  categories: BlogCategory[]; // Tambahan Props
}

export default function BlogDetailSidebar({
  relatedPosts,
  categories,
}: BlogDetailSidebarProps) {
  return (
    <div className="space-y-8">
      {/* 1. Search Widget */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24 z-10">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-600" /> Cari Topik
        </h3>
        <form action="/blog" method="GET" className="relative">
          <Input
            name="q"
            placeholder="Ketik kata kunci..."
            className="pl-10 pr-4 py-6 rounded-xl border-slate-200 bg-slate-50 focus:bg-white transition-all"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        </form>
      </div>

      {/* 2. Related News Widget */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" /> Baca Juga
        </h3>

        <div className="flex flex-col gap-6">
          {relatedPosts.length === 0 ? (
            <p className="text-sm text-slate-400 italic">
              Belum ada artikel terkait.
            </p>
          ) : (
            relatedPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex gap-4 items-start"
              >
                {/* Thumbnail Kecil */}
                <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-100">
                  {post.thumbnail_url ? (
                    <Image
                      src={post.thumbnail_url}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-110 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-300">
                      No Img
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mb-1 inline-block">
                    {post.category}
                  </span>
                  <h4 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-blue-600 transition line-clamp-2 mb-1">
                    {post.title}
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    {formatDateIndo(post.created_at)}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* 3. Category Widget (NEW) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-[200px]">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Tag className="w-5 h-5 text-blue-600" /> Kategori Topik
        </h3>
        <div className="space-y-2">
          <Link href="/blog">
            <div className="flex justify-between items-center p-3 rounded-lg transition cursor-pointer hover:bg-slate-50 text-slate-600 group">
              <span className="text-sm font-medium group-hover:text-blue-600 transition-colors">
                Semua Artikel
              </span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-blue-600" />
            </div>
          </Link>
          {categories?.map((cat) => (
            <Link key={cat.id} href={`/blog?cat=${cat.name}`}>
              <div className="flex justify-between items-center p-3 rounded-lg transition cursor-pointer hover:bg-slate-50 text-slate-600 group">
                <span className="text-sm font-medium group-hover:text-blue-600 transition-colors">
                  {cat.name}
                </span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-blue-600" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
