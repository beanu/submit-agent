import { cn } from '@/lib/cn'
import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode
}

export function Card({ className, children, ...props }: CardProps) {
	return (
		<div
			className={cn('rounded-lg border border-border bg-card p-3', className)}
			{...props}
		>
			{children}
		</div>
	)
}

export function CardHeader({ className, children, ...props }: CardProps) {
	return (
		<div className={cn('flex items-center justify-between mb-2', className)} {...props}>
			{children}
		</div>
	)
}

export function CardTitle({
	className,
	children,
	...props
}: HTMLAttributes<HTMLHeadingElement> & { children: ReactNode }) {
	return (
		<h3 className={cn('text-sm font-semibold', className)} {...props}>
			{children}
		</h3>
	)
}

export function CardContent({ className, children, ...props }: CardProps) {
	return (
		<div className={cn('text-xs text-muted-foreground', className)} {...props}>
			{children}
		</div>
	)
}
