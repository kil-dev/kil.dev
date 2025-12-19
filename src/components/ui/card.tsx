import * as React from 'react'

import { cn } from '@/utils/utils'

function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(
        'relative flex flex-col gap-6 rounded-xl border border-primary bg-card py-6 text-card-foreground shadow-sm',
        className,
      )}
      {...props}
    />
  )
}

export { Card }
