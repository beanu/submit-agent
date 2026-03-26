import { cn } from '@/lib/cn'
import type { HTMLAttributes } from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'destructive' | 'outline' | 'muted'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
	variant?: BadgeVariant
}

const variantStyles: Record<BadgeVariant, string> = {
	default: 'bg-primary/10 text-primary',
	success: 'bg-success/10 text-success',
	warning: 'bg-warning/10 text-warning',
	destructive: 'bg-destructive/10 text-destructive',
	outline: 'border border-border text-foreground',
	muted: 'bg-muted text-muted-foreground',
}

export function Badge({ variant = 'default', className, ...props }: BadgeProps) {
	return (
		<span
			className={cn(
				'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
				variantStyles[variant],
				className
			)}
			{...props}
		/>
	)
}
