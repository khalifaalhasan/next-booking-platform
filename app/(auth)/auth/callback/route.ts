import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // 1. Ambil parameter dari URL
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/";

  if (code) {
    // 2. Buat client Supabase (Server Side)
    const supabase = await createClient();

    // 3. Tukar "Code" menjadi "Session" (Login otomatis)
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 4. Jika sukses, redirect ke halaman tujuan (misal: /update-password)
      // Kita gunakan requestUrl.origin untuk memastikan domainnya benar (localhost atau production)
      return NextResponse.redirect(`${requestUrl.origin}${next}`);
    } else {
      console.error("Auth Callback Error:", error.message);
    }
  }

  // 5. Jika gagal atau tidak ada code, kembalikan ke login dengan pesan error
  // Tambahkan parameter ?error=auth untuk menampilkan pesan di UI (opsional)
  return NextResponse.redirect(
    `${requestUrl.origin}/login?error=auth_callback_failed`
  );
}
