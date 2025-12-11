import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Calendar, User, ArrowLeft, Share2, Eye } from "lucide-react";
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

// --- PERBAIKAN DISINI (Tambahkan await di createClient) ---
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient(); // <--- TAMBAH AWAIT

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
  const supabase = await createClient(); // Di sini sudah benar ada await
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Header Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-6 sticky top-20 z-30 shadow-sm">
        <div className="container max-w-7xl mx-auto px-4 flex items-center gap-2 text-sm text-slate-500 overflow-hidden">
          <Link href="/" className="hover:text-blue-600 shrink-0">
            Home
          </Link>{" "}
          /
          <Link href="/blog" className="hover:text-blue-600 shrink-0">
            Blog
          </Link>{" "}
          /
          <span className="text-slate-900 font-medium truncate">
            {post.title}
          </span>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* --- KONTEN UTAMA (LEBAR 8) --- */}
          <div className="lg:col-span-8">
            <FadeIn>
              <article className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden p-6 md:p-10 mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 text-sm">
                    {post.category}
                  </Badge>
                  <span className="text-slate-400 text-xs flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {post.views_count || 0} Dilihat
                  </span>
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
                  {post.title}
                </h1>

                <div className="flex items-center gap-4 mb-8 text-sm text-slate-500 border-b border-slate-100 pb-8">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-slate-500" />
                    </div>
                    <span className="font-medium text-slate-700">
                      {post.profiles?.full_name || "Admin"}
                    </span>
                  </div>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDateIndo(post.created_at)}
                  </div>
                </div>

                {post.thumbnail_url && (
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-10 shadow-md">
                    <Image
                      src={post.thumbnail_url}
                      alt={post.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                )}

                <div
                  className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-600 prose-a:text-blue-600 prose-img:rounded-xl prose-strong:text-slate-800"
                  dangerouslySetInnerHTML={{ __html: post.content || "" }}
                />

                <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center">
                  <Link href="/blog">
                    <Button variant="outline" className="gap-2">
                      <ArrowLeft className="w-4 h-4" /> Kembali ke Blog
                    </Button>
                  </Link>
                  {/* Tombol Share Dummy */}
                  <Button
                    variant="ghost"
                    className="gap-2 text-slate-500 hover:text-blue-600"
                  >
                    <Share2 className="w-4 h-4" /> Bagikan
                  </Button>
                </div>
              </article>

              {/* --- BOTTOM SLIDER REKOMENDASI --- */}
              <div className="mt-12 pt-8 border-t border-slate-200">
                <RecommendedSlider posts={recommendedPosts || []} />
              </div>
            </FadeIn>
          </div>

          {/* --- SIDEBAR (LEBAR 4) --- */}
          <div className="lg:col-span-4">
            {/* Pass relatedPosts DAN categories ke sidebar */}
            <BlogDetailSidebar
              relatedPosts={relatedPosts || []}
              categories={categories || []}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
