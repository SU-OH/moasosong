import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const publicRoutes = [
  "/",
  "/login",
  "/signup",
  "/callback",
  "/forgot-password",
  "/reset-password",
  "/about",
  "/how-it-works",
  "/privacy",
];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 공개 라우트 허용
  if (
    publicRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    )
  ) {
    // 인증된 사용자가 로그인/가입 페이지 접근 시 대시보드로 리다이렉트
    if (user && (pathname === "/login" || pathname === "/signup")) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const dashboardPath =
        profile?.role === "lawyer"
          ? "/lawyer/dashboard"
          : "/victim/dashboard";
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }
    return response;
  }

  // 비인증 사용자 → 로그인으로
  if (!user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 역할 기반 라우트 보호
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (pathname.startsWith("/victim") && profile?.role !== "victim") {
    return NextResponse.redirect(
      new URL("/lawyer/dashboard", request.url)
    );
  }

  if (pathname.startsWith("/lawyer") && profile?.role !== "lawyer") {
    return NextResponse.redirect(
      new URL("/victim/dashboard", request.url)
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
