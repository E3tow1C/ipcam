import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isPublicPath = path === '/auth' || path.startsWith('/auth/')  
  const token = request.cookies.get('access_token')?.value || ''
  
  if (!isPublicPath && !token) {
    const url = new URL(`/auth`, request.url)
    url.searchParams.set('redirect', path)
    return NextResponse.redirect(url)
  }
  
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}