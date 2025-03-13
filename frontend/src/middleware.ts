import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { API_ROUTES } from "./constants/api-routes";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicPath = path === '/auth' || path.startsWith('/auth/');
  
  // Get both tokens
  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;
  
  // If on public path with tokens, validate and redirect if valid
  if (isPublicPath && accessToken) {
    console.log('public path with tokens');
    try {
      const validateResponse = await fetch(API_ROUTES.AUTH.VALIDATE, {
        method: "GET",
        credentials: "include",
      });
      
      const validateData = await validateResponse.json();
      
      if (validateData.success) {
        console.log('token valid, redirecting to home');
        // Token is valid, redirect to home
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch {
        console.log('token invalid or expired');
    }
  }
  
  // If not on public path and no tokens, redirect to login
  if (!isPublicPath && !accessToken && !refreshToken) {
    console.log('no tokens');

    const url = new URL(`/auth`, request.url);
    url.searchParams.set('redirect', path);
    return NextResponse.redirect(url);
  }
  
  // If not on public path, validate access token
  if (!isPublicPath && accessToken) {
    console.log('protected path with access token');
    try {
      // Validate the token using server endpoint
      const validateResponse = await fetch(API_ROUTES.AUTH.VALIDATE, {
        method: 'GET',
        credentials: 'include',
      });
      
      const validateData = await validateResponse.json();
      
      if (validateData.success) {
        // Token is valid, continue
        return NextResponse.next();
      }
      
      // If token is invalid but we have a refresh token, try to refresh
      if (refreshToken) {
        console.log('Opps token invalid, trying to refresh');
        // Use the refresh endpoint from your server
        const refreshResponse = await fetch(API_ROUTES.AUTH.REFRESH, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
          credentials: 'include',
        });
        
        if (refreshResponse.ok) {
          console.log('Token refreshed successfully');
          // Token refreshed successfully, continue
          return NextResponse.next();
        }
      }
      
      // If validation and refresh both failed, redirect to login
      console.log('refresh failed, redirecting to login');
      const url = new URL(`/auth`, request.url);
      url.searchParams.set('redirect', path);
      return NextResponse.redirect(url);
      
    } catch {
      // If any error occurs during validation/refresh, redirect to login
      const url = new URL(`/auth`, request.url);
      url.searchParams.set('redirect', path);
      return NextResponse.redirect(url);
    }
  }
  
  // Continue normally for all other cases
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|_next/script|favicon.ico).*)',
  ],
}