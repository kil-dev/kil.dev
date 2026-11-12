import type { NextConfig } from 'next'

import './src/env.js'

const config: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  cacheComponents: true,
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  images: {
    minimumCacheTTL: 31536000, // 1 year
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    localPatterns: [
      {
        pathname: '/api/image/**',
      },
      {
        pathname: '/api/local-image/**',
      },
      {
        pathname: '/ogi/headshot.jpg',
      },
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fjuww9floqc2ihpu.public.blob.vercel-storage.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'utfs.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.ufs.sh',
        pathname: '/**',
      },
    ],
  },
  // About, Experience and Projects are sections of the single-page home; old links keep working.
  async redirects() {
    return ['about', 'experience', 'projects'].map(section => ({
      source: `/${section}`,
      destination: `/#${section}`,
      permanent: true,
    }))
  },
  async rewrites() {
    return [
      {
        source: '/vibecheck/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/vibecheck/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
    ]
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
}

export default config
