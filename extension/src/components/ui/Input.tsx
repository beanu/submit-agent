import { cn } from '@/lib/cn'
import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string
	error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
	({ label, error, className, id, ...props }, ref) => {
		const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

		return (
			<div className="flex flex-col gap-1">
				{label && (
					<label htmlFor={inputId} className="text-xs font-medium text-foreground">
						{label}
					</label>
				)}
				<input
					ref={ref}
					id={inputId}
					className={cn(
						'h-9 w-full rounded-md border border-border bg-background px-3 text-sm',
						'placeholder:text-muted-foreground',
						'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
						'disabled:opacity-50',
						error && 'border-destructive focus:ring-destructive/50',
						className
					)}
					{...props}
				/>
				{error && <span className="text-xs text-destructive">{error}</span>}
			</div>
		)
	}
)

Input.displayName = 'Input'
