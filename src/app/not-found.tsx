import { NotFoundContent } from '@/components/layout/not-found/_content'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 | Page Not Found',
}

export const dynamic = 'error'

export default function NotFound() {
  return <NotFoundContent />
}
