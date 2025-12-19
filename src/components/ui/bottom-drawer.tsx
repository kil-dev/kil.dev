'use client'

import * as React from 'react'

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { cn } from '@/utils/utils'

type BottomDrawerProps = React.ComponentPropsWithoutRef<typeof Drawer>
function BottomDrawer({ direction: _ignoredDirection, ...rest }: BottomDrawerProps) {
  return <Drawer direction="bottom" {...rest} />
}
BottomDrawer.displayName = 'BottomDrawer'

type BottomDrawerContentProps = React.ComponentPropsWithoutRef<typeof DrawerContent> & {
  showHandle?: boolean
}

const BottomDrawerContent = React.forwardRef<React.ElementRef<typeof DrawerContent>, BottomDrawerContentProps>(
  ({ className, showHandle = true, ...props }, ref) => (
    <DrawerContent
      ref={ref}
      showHandle={showHandle}
      className={cn('mx-auto rounded-t-xl !border-t-0 sm:max-w-2xl', className)}
      {...props}
    />
  ),
)
BottomDrawerContent.displayName = 'BottomDrawerContent'

export {
  BottomDrawer,
  BottomDrawerContent,
  DrawerDescription as BottomDrawerDescription,
  DrawerHeader as BottomDrawerHeader,
  DrawerTitle as BottomDrawerTitle,
  DrawerTrigger as BottomDrawerTrigger,
}
