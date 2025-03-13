import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { API_ROUTES } from "./constants/api-routes";

type authValidateResponse = {
  success: boolean;
  message?: string;
};

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicPath = path === '/auth' || path.startsWith('/auth/');

  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;

  if (isPublicPath && accessToken) {
    try {
      const validateResponse = await fetch(API_ROUTES.AUTH.VALIDATE, {
        method: "GET",
        credentials: "include",
      });

      const validateData: authValidateResponse = await validateResponse.json();

      if (validateData.success) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch {}
  }

  if (!isPublicPath && !accessToken && !refreshToken) {
    const url = new URL(`/auth`, request.url);
    url.searchParams.set('redirect', path);

    return NextResponse.redirect(url);
  }

  if (!isPublicPath && accessToken) {
    try {
      const validateResponse = await fetch(API_ROUTES.AUTH.VALIDATE, {
        method: 'GET',
        credentials: 'include',
        headers: {
          Cookie: `access_token=${accessToken}; refresh_token=${refreshToken}`
        }
      });

      const validateData: authValidateResponse = await validateResponse.json();

      if (validateData.success) {
        return NextResponse.next();
      }

      if (refreshToken) {
        const refreshResponse = await fetch(API_ROUTES.AUTH.REFRESH, {
          method: 'POST',
          headers: {
            Cookie: `access_token=${accessToken}; refresh_token=${refreshToken}`
          },
          credentials: 'include',
        });

        if (refreshResponse.ok) {
          const setCookieHeader = refreshResponse.headers.get('Set-Cookie');
          const response = NextResponse.next();

          if (setCookieHeader) {
            response.headers.set('Set-Cookie', setCookieHeader);
          }

          return response;
        }
      }

      const url = new URL(`/auth`, request.url);
      url.searchParams.set('redirect', path);

      return NextResponse.redirect(url);

    } catch {
      const url = new URL(`/auth`, request.url);
      url.searchParams.set('redirect', path);

      return NextResponse.redirect(url);
    }
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|_next/script|favicon.ico).*)',
  ],
}