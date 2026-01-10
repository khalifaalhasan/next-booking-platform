import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Calendar, User, ArrowLeft, Share2, Eye, Clock } from "lucide-react"; // Tambah Icon Clock
import { formatDateIndo } from "@/lib/utils";
import FadeIn from "@/components/ui/FadeIn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tables } from "@/types/supabase";

// Import Komponen Baru
import BlogDetailSidebar from "@/components/admin/posts/BlogDetailSidebar";
import RecommendedSlider from "@/components/admin/posts/RecommendedSlider";

type PostWithAuthor = Tables<"posts"> & {
  profiles: { full_name: string } | null;
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("title, content")
    .eq("slug", slug)
    .single();

  if (!post) return { title: "Artikel Tidak Ditemukan" };

  return {
    title: post.title,
    description:
      post.content?.substring(0, 150).replace(/<[^>]*>?/gm, "") + "...",
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const supabase = await createClient();
  const { slug } = await params;

  // 1. Fetch Post Utama
  const { data: postData, error } = await supabase
    .from("posts")
    .select(`*, profiles(full_name)`)
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !postData) notFound();
  const post = postData as unknown as PostWithAuthor;

  // 2. Fetch Related Posts (Sidebar)
  const { data: relatedPosts } = await supabase
    .from("posts")
    .select("*")
    .eq("is_published", true)
    .eq("category", post.category || "")
    .neq("id", post.id)
    .limit(4)
    .order("created_at", { ascending: false });

  // 3. Fetch Recommended Posts (Bottom Slider)
  const { data: recommendedPosts } = await supabase
    .from("posts")
    .select("*")
    .eq("is_published", true)
    .neq("id", post.id)
    .limit(6);

  const { data: categories } = await supabase
    .from("blog_categories")
    .select("*")
    .order("name");

  // Increment view count (RPC)
  await supabase.rpc("increment_post_view", { post_id: post.id });

  // Estimasi waktu baca (kasar: 200 kata per menit)
  const wordCount = post.content?.split(/\s+/).length || 0;
  const readTime = Math.ceil(wordCount / 200);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 font-sans">
      {/* Header Breadcrumb */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-sm backdrop-blur-md bg-white/90">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex items-center gap-2 text-sm text-slate-500 overflow-hidden">
          <Link
            href="/"
            className="hover:text-blue-600 transition-colors shrink-0"
          >
            Home
          </Link>
          <span className="text-slate-300">/</span>
          <Link
            href="/blog"
            className="hover:text-blue-600 transition-colors shrink-0"
          >
            Blog
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-medium truncate max-w-[200px] sm:max-w-md">
            {post.title}
          </span>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* --- KONTEN UTAMA (LEBAR 8) --- */}
          <div className="lg:col-span-8">
            <FadeIn>
              <article className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden p-6 md:p-8 lg:p-10 mb-10">
                {/* Meta Header */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <Badge className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs uppercase tracking-wider rounded-md">
                    {post.category}
                  </Badge>
                  <span className="text-slate-400 text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {readTime} Menit Baca
                  </span>
                  <span className="text-slate-300 text-xs">•</span>
                  
                </div>

                {/* Judul yang lebih proporsional */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 leading-[1.2] tracking-tight">
                  {post.title}
                </h1>

                {/* Author & Date */}
                <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center border border-blue-100">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {post.profiles?.full_name || "Admin P2B"}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="w-3 h-3" />
                        {formatDateIndo(post.created_at)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Featured Image */}
                {post.thumbnail_url && (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-10 shadow-sm border border-slate-100 group">
                    <Image
                      src={post.thumbnail_url}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      priority
                    />
                  </div>
                )}

                {/* Content Body dengan Typography yang lebih bagus */}
                <div
                  className="
                    prose prose-lg max-w-none 
                    prose-headings:font-bold prose-headings:text-slate-900 prose-headings:tracking-tight 
                    prose-p:text-slate-600 prose-p:leading-relaxed 
                    prose-a:text-blue-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                    prose-img:rounded-xl prose-img:shadow-md 
                    prose-strong:text-slate-800 prose-strong:font-bold
                    prose-ul:list-disc prose-ul:pl-5 prose-li:text-slate-600 prose-li:marker:text-blue-500
                    prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:text-slate-700 prose-blockquote:italic
                  "
                  dangerouslySetInnerHTML={{ __html: post.content || "" }}
                />

                {/* Share & Back */}
                <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <Link href="/blog">
                    <Button
                      variant="outline"
                      className="gap-2 rounded-full border-slate-300 text-slate-600 hover:text-slate-900 hover:border-slate-400"
                    >
                      <ArrowLeft className="w-4 h-4" /> Kembali ke Blog
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="gap-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                  >
                    <Share2 className="w-4 h-4" /> Bagikan Artikel
                  </Button>
                </div>
              </article>

              {/* --- BOTTOM SLIDER REKOMENDASI --- */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900">
                    Mungkin Anda Tertarik
                  </h3>
                </div>
                <RecommendedSlider posts={recommendedPosts || []} />
              </div>
            </FadeIn>
          </div>

          {/* --- SIDEBAR (LEBAR 4) --- */}
          <div className="lg:col-span-4 space-y-8">
            <div className="sticky top-32">
              <BlogDetailSidebar
                relatedPosts={relatedPosts || []}
                categories={categories || []}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}