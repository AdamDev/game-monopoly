import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // No standalone needed — custom server.ts handles everything.
  // Static export still available via NEXT_OUTPUT=export.
  output: process.env.NEXT_OUTPUT === 'export' ? 'export' : undefined,
  trailingSlash: process.env.NEXT_OUTPUT === 'export',
}

export default nextConfig
