import {
  Banknote,
  Briefcase,
  Bus,
  Car,
  CreditCard,
  DollarSign,
  Dumbbell,
  Gamepad2,
  Gift,
  GraduationCap,
  HeartPulse,
  HelpCircle,
  Home,
  Landmark,
  Laptop,
  PiggyBank,
  Plane,
  Receipt,
  Repeat,
  ShoppingCart,
  Shirt,
  TrendingUp,
  Utensils,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import type { CategoryIconName } from '@/features/categories/category-icon-options'

const icons = {
  Banknote,
  Briefcase,
  Bus,
  Car,
  CreditCard,
  DollarSign,
  Dumbbell,
  Gamepad2,
  Gift,
  GraduationCap,
  HeartPulse,
  HelpCircle,
  Home,
  Landmark,
  Laptop,
  PiggyBank,
  Plane,
  Receipt,
  Repeat,
  ShoppingCart,
  Shirt,
  TrendingUp,
  Utensils,
  Wallet,
} satisfies Record<CategoryIconName, LucideIcon>

function isCategoryIconName(value: string | null | undefined): value is CategoryIconName {
  return value !== null && value !== undefined && value in icons
}

export function CategoryIcon({
  name,
  className,
}: {
  name: string | null | undefined
  className?: string
}) {
  const Icon = isCategoryIconName(name) ? icons[name] : HelpCircle
  return <Icon className={cn('size-4', className)} />
}
