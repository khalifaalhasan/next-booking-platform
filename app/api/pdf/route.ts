import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return new NextResponse("URL PDF tidak ditemukan", { status: 400 });
  }

  try {
    // 1. Server Next.js mengambil file dari Supabase (Bypass CORS)
    const response = await fetch(targetUrl);

    if (!response.ok) {
      throw new Error(`Gagal mengambil file: ${response.statusText}`);
    }

    // 2. Ambil data binary (buffer)
    const arrayBuffer = await response.arrayBuffer();

    // 3. Kirim balik ke browser sebagai file PDF yang valid
    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        // Cache agar performa cepat saat dibuka lagi
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("PDF Proxy Error:", error);
    return new NextResponse("Terjadi kesalahan saat memuat PDF", {
      status: 500,
    });
  }
}
