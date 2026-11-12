import type { NavigationItem } from '@/types/navigation-item'
import { Briefcase, Dog, Folder, Home, User } from 'lucide-react'

export const NAVIGATION: NavigationItem[] = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'About', href: '/#about', icon: User },
  { label: 'Pets', href: '/#pets', icon: Dog },
  { label: 'Experience', href: '/#experience', icon: Briefcase },
  { label: 'Projects', href: '/#projects', icon: Folder },
]
