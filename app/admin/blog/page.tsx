import { createClient } from "@/utils/supabase/server";
import PostManager from "@/components/admin/posts/PostManager";
import { Tables } from "@/types/supabase";
import AdminPageHeader from "@/components/admin/AdminPageheader";

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
        <AdminPageHeader
          title="Artikel & Berita"
          description="  Kelola konten blog, pengumuman, dan tips."
        />
      </div>

      <PostManager initialPosts={posts as Tables<"posts">[]} />
    </div>
  );
}
