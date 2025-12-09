import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowRight, Search, Tag, Star } from "lucide-react";
import { formatDateIndo } from "@/lib/utils";
import FadeIn from "@/components/ui/FadeIn";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Blog & Berita",
  description: "Informasi terbaru seputar layanan UIN.",
};

// Props untuk menangkap Query Params (Search & Category)
interface BlogPageProps {
  searchParams: { q?: string; cat?: string };
}

export default async function Blog({ searchParams }: BlogPageProps) {
  const supabase = await createClient();
  const params = await searchParams;
  const query = params.q || "";
  const categoryFilter = params.cat || "all";

  // 1. Fetch Categories (Untuk Sidebar)
  const { data: categories } = await supabase
    .from("blog_categories")
    .select("*")
    .order("name");

  // 2. Build Query Posts
  let postQuery = supabase
    .from("posts")
    .select("*")
    .eq("is_published", true)
    .order("is_featured", { ascending: false }) // Unggulan di atas
    .order("created_at", { ascending: false });

  // Filter by Search
  if (query) {
    postQuery = postQuery.ilike("title", `%${query}%`);
  }

  // Filter by Category
  if (categoryFilter !== "all") {
    postQuery = postQuery.eq("category", categoryFilter);
  }

  const { data: posts } = await postQuery;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <div className="container max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* --- KONTEN UTAMA (Kiri) --- */}
          <div className="lg:col-span-8 space-y-8">
            {/* Search Bar Mobile Only */}
            <div className="lg:hidden mb-6">
              <SearchForm initialQuery={query} />
            </div>

            {!posts || posts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                <p className="text-slate-400">Tidak ada artikel ditemukan.</p>
                {query && (
                  <Link
                    href="/blog"
                    className="text-blue-600 text-sm font-bold mt-2 block hover:underline"
                  >
                    Reset Pencarian
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post, idx) => (
                  <FadeIn key={post.id} delay={idx * 0.1}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="group flex flex-col h-full bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                        {post.thumbnail_url ? (
                          <Image
                            src={post.thumbnail_url}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            No Image
                          </div>
                        )}
                        <div className="absolute top-3 left-3 flex gap-2">
                          <Badge className="bg-white/90 text-slate-700 hover:bg-white shadow-sm backdrop-blur">
                            {post.category}
                          </Badge>
                          {post.is_featured && (
                            <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-500 shadow-sm border-none">
                              <Star className="w-3 h-3 mr-1 fill-current" />{" "}
                              Unggulan
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                          <Calendar className="w-3 h-3" />{" "}
                          {formatDateIndo(post.created_at)}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition leading-snug line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-3 flex-grow">
                          {post.content
                            ?.replace(/<[^>]*>?/gm, "")
                            .substring(0, 120)}
                          ...
                        </p>
                        <span className="mt-auto text-sm font-bold text-blue-600 group-hover:underline flex items-center gap-1">
                          Baca Selengkapnya <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </Link>
                  </FadeIn>
                ))}
              </div>
            )}
          </div>

          {/* --- SIDEBAR (Kanan) --- */}
          <div className="lg:col-span-4 space-y-8">
            {/* Search Widget */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hidden lg:block sticky top-24">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-600" /> Pencarian
              </h3>
              <SearchForm initialQuery={query} />
            </div>

            {/* Category Widget */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-[200px]">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-600" /> Kategori Topik
              </h3>
              <div className="space-y-2">
                <Link href="/blog">
                  <div
                    className={`flex justify-between items-center p-3 rounded-lg transition cursor-pointer ${
                      categoryFilter === "all"
                        ? "bg-blue-50 text-blue-700 font-bold"
                        : "hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <span className="text-sm">Semua Artikel</span>
                    {categoryFilter === "all" && (
                      <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    )}
                  </div>
                </Link>
                {categories?.map((cat) => (
                  <Link key={cat.id} href={`/blog?cat=${cat.name}`}>
                    <div
                      className={`flex justify-between items-center p-3 rounded-lg transition cursor-pointer ${
                        categoryFilter === cat.name
                          ? "bg-blue-50 text-blue-700 font-bold"
                          : "hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      <span className="text-sm">{cat.name}</span>
                      {categoryFilter === cat.name && (
                        <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-Component: Search Form Client Side
function SearchForm({ initialQuery }: { initialQuery: string }) {
  return (
    <form action="/blog" method="GET" className="relative">
      <Input
        name="q"
        defaultValue={initialQuery}
        placeholder="Cari artikel..."
        className="pl-10 pr-4 py-6 rounded-xl border-slate-200 bg-slate-50 focus:bg-white transition-all"
      />
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
      <button type="submit" className="hidden"></button>
    </form>
  );
}
