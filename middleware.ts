import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin') ?? ''
  const allowedOrigin = process.env.ALLOWED_ORIGIN ?? origin

  const corsHeaders: Record<string, string> = allowedOrigin
    ? {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    : {}

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: { ...corsHeaders, 'Access-Control-Max-Age': '86400' },
    })
  }

  const response = NextResponse.next()
  Object.entries(corsHeaders).forEach(([k, v]) => response.headers.set(k, v))
  return response
}

export const config = {
  matcher: '/api/:path*',
}
