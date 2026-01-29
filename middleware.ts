import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // 1. Ambil User
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. Definisi Route
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isLoginPage = request.nextUrl.pathname === "/login";

  // --- LOGIKA PROTEKSI ---

  // KASUS A: Akses Admin tapi BELUM Login
  // -> Lempar ke Login
  if (isAdminRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // KASUS B: Akses Admin, SUDAH Login, tapi BUKAN Admin
  // -> Lempar ke Forbidden
  // ... kode sebelumnya ...

  // KASUS B: Akses Admin, SUDAH Login, tapi BUKAN Admin
  if (isAdminRoute && user) {
    // Ambil role langsung dari session (metadata)
    // Tidak perlu fetch database lagi (Cepat & Hemat Resource)
    const userRole = user.user_metadata?.role;

    console.log("User Role:", userRole); // Debugging (Opsional)

    if (userRole !== "admin" && userRole !== "superadmin") {
      const url = request.nextUrl.clone();
      url.pathname = "/forbidden";
      return NextResponse.redirect(url);
    }
  }

  // ... kode selanjutnya ...

  // KASUS C: Sudah Login tapi buka halaman Login
  // -> Lempar ke Admin (jika admin) atau Home (jika user)
  if (isLoginPage && user) {
    const userRole = user.user_metadata?.role;
    const url = request.nextUrl.clone();

    if (userRole === "admin") {
      url.pathname = "/admin";
    } else {
      url.pathname = "/";
    }
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (public images)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
