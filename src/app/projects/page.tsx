import { ProjectsContent } from '@/components/layout/projects/_content'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Projects | Kilian Tyler',
  description: 'A selection of websites and other projects I have worked on.',
}

export const experimental_ppr = true
export const dynamic = 'error'

export default function ProjectsPage() {
  return <ProjectsContent />
}
