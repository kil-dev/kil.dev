import { AboutContent } from '@/components/layout/about/_content'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About | Kilian Tyler',
  description: 'Learn more about Kilian Tyler, a Site Reliability and DevOps Engineer based in Cleveland, Ohio.',
}

export const experimental_ppr = true
export const dynamic = 'error'

export default function AboutPage() {
  return <AboutContent />
}
