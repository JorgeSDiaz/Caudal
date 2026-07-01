import * as React from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

function BentoCard({ className, ...props }: React.ComponentProps<typeof Card>) {
  return <Card className={cn('gap-5 rounded-lg py-5', className)} {...props} />
}

function BentoCardHeader({ className, ...props }: React.ComponentProps<typeof CardHeader>) {
  return <CardHeader className={cn('gap-1 px-5', className)} {...props} />
}

function BentoCardContent({ className, ...props }: React.ComponentProps<typeof CardContent>) {
  return <CardContent className={cn('px-5', className)} {...props} />
}

const BentoCardDescription = CardDescription
const BentoCardTitle = CardTitle

export {
  BentoCard,
  BentoCardContent,
  BentoCardDescription,
  BentoCardHeader,
  BentoCardTitle,
}
