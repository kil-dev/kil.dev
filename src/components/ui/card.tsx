import * as React from 'react'

import { cn } from '@/utils/utils'

function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(
        'relative bg-card text-card-foreground flex flex-col gap-6 rounded-xl py-6 shadow-sm border border-primary',
        className,
      )}
      {...props}
    />
  )
}

export { Card }
