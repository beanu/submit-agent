import { cn } from '@/lib/cn'
import type { ButtonHTMLAttributes } from 'react'

type Variant = 'default' | 'outline' | 'ghost' | 'destructive' | 'success'
type Size = 'sm' | 'md' | 'lg' | 'icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: Variant
	size?: Size
}

const variantStyles: Record<Variant, string> = {
	default: 'bg-primary text-primary-foreground hover:bg-primary/90',
	outline: 'border border-border bg-transparent hover:bg-muted',
	ghost: 'hover:bg-muted',
	destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
	success: 'bg-success text-success-foreground hover:bg-success/90',
}

const sizeStyles: Record<Size, string> = {
	sm: 'h-7 px-2.5 text-xs',
	md: 'h-9 px-4 text-sm',
	lg: 'h-11 px-6 text-base',
	icon: 'h-8 w-8',
}

export function Button({ variant = 'default', size = 'md', className, ...props }: ButtonProps) {
	return (
		<button
			className={cn(
				'inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors',
				'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
				'disabled:pointer-events-none disabled:opacity-50',
				'cursor-pointer',
				variantStyles[variant],
				sizeStyles[size],
				className
			)}
			{...props}
		/>
	)
}
