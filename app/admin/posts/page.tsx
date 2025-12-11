import { createClient } from "@/utils/supabase/server";
import PostManager from "@/components/admin/posts/PostManager";
import { Tables } from "@/types/supabase";

export default async function AdminPostsPage() {
  const supabase = await createClient();

  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="p-8 text-red-500">Gagal memuat data artikel.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Artikel & Berita
        </h1>
        <p className="text-slate-500 text-sm">
          Kelola konten blog, pengumuman, dan tips.
        </p>
      </div>

      <PostManager initialPosts={posts as Tables<"posts">[]} />
    </div>
  );
}
