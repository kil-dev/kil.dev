import { cn } from '@/utils/utils'

type SectionLabelProps = {
  children: string
  className?: string
  as?: 'p' | 'span' | 'div' | 'h2' | 'h3'
}

export function SectionLabel({ children, className = '', as = 'p' }: SectionLabelProps) {
  const Tag = as
  return <Tag className={cn('text-lg font-semibold text-primary md:text-xl', className)}>{children}</Tag>
}
