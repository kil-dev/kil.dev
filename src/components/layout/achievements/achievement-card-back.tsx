'use client'

import { ScrollArea } from '@/components/ui/scroll-area'

export function AchievementCardBack({
  title,
  description,
  footer,
}: {
  title: string
  description: string
  footer?: string
}) {
  return (
    <div className="absolute inset-0 m-0 overflow-hidden rounded-xl bg-transparent p-0 transition-shadow [backface-visibility:hidden] group-hover:shadow-md group-hover:ring-2 group-hover:ring-primary group-hover:ring-offset-2 group-hover:ring-offset-background">
      <div aria-hidden className="absolute inset-0 rounded-xl bg-(--card-backdrop) card-back-shadow" />
      <ScrollArea className="relative z-10 h-full">
        <div className="flex flex-col pr-2">
          <h3 className="p-6 text-lg font-semibold">{title}</h3>
          <div className="px-6 pb-4 text-sm text-foreground">{description}</div>
          <div className="px-6 pb-6 text-xs text-muted-foreground/90">
            <p>{footer}</p>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
