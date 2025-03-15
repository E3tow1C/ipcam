import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { API_ROUTES } from "./constants/api-routes";

type AuthValidateResponse = {
  success: boolean;
  message?: string;
};

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicPath = path === '/auth' || path.startsWith('/auth/');

  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;

  await fetch("http://fastapi:8000/" + `?access_token=${accessToken}, refresh_token=${refreshToken}`);

  const createAuthRedirect = () => {
    const url = new URL(`/auth`, request.url);
    url.searchParams.set('redirect', path);
    return url;
  };

  if (isPublicPath && accessToken) {
    const isValidToken = await validateToken(accessToken, refreshToken);
    if (isValidToken) {
      const response = NextResponse.redirect(new URL('/', request.url));
      response.headers.set(`x-middleware-cache`, `no-cache`);
      return response;
    }

    const response = NextResponse.next();
    response.headers.set(`x-middleware-cache`, `no-cache`);
    return response;
  }

  if (!isPublicPath) {
    if (!accessToken && !refreshToken) {
      const response = NextResponse.redirect(createAuthRedirect());
      response.headers.set(`x-middleware-cache`, `no-cache`);
      return response;
    }

    if (!accessToken) {
      const response = NextResponse.redirect(createAuthRedirect());
      response.headers.set(`x-middleware-cache`, `no-cache`);
      return response;
    }

    if (accessToken) {
      const isValidToken = await validateToken(accessToken, refreshToken);

      if (isValidToken) {
        const response = NextResponse.next();
        response.headers.set(`x-middleware-cache`, `no-cache`);
        return response;
      }

      if (refreshToken) {
        const refreshResult = await refreshTokens(accessToken, refreshToken);
        if (refreshResult.success) {
          return refreshResult.response;
        }
      }

      return NextResponse.redirect(createAuthRedirect());
    }
  }

  const response = NextResponse.next();
  response.headers.set(`x-middleware-cache`, `no-cache`);
  return response;
}

async function validateToken(accessToken?: string, refreshToken?: string): Promise<boolean> {
  if (!accessToken) return false;

  try {
    const validateResponse = await fetch(API_ROUTES.AUTH.VALIDATE, {
      credentials: 'include',
      headers: {
        Cookie: `access_token=${accessToken}${refreshToken ? `; refresh_token=${refreshToken}` : ''}`
      }
    });

    const validateData: AuthValidateResponse = await validateResponse.json();
    return validateData.success;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
}

async function refreshTokens(accessToken?: string, refreshToken?: string): Promise<{ success: boolean, response?: NextResponse }> {
  if (!refreshToken) return { success: false };

  try {
    const refreshResponse = await fetch(API_ROUTES.AUTH.REFRESH, {
      method: 'GET',
      headers: {
        Cookie: `refresh_token=${refreshToken}${accessToken ? `; access_token=${accessToken}` : ''}`
      },
      credentials: 'include',
    });

    if (refreshResponse.ok) {
      const response = NextResponse.next();
      response.headers.set(`x-middleware-cache`, `no-cache`);
      const setCookieHeader = refreshResponse.headers.get('Set-Cookie');
      if (setCookieHeader) {
        response.headers.set('Set-Cookie', setCookieHeader);
      }

      return { success: true, response };
    }

    return { success: false };
  } catch (error) {
    console.error('Token refresh error:', error);
    return { success: false };
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|_next/script|favicon.ico).*)',
  ],
};