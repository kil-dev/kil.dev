import { ImATeapotContent } from '@/components/layout/im-a-teapot/_content'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "418 | I'm a Teapot",
}

export const experimental_ppr = true

export default function Page() {
  return <ImATeapotContent />
}
