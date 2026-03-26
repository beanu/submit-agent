import { cn } from '@/lib/cn'
import type { TextareaHTMLAttributes } from 'react'
import { forwardRef } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
	label?: string
	error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ label, error, className, id, ...props }, ref) => {
		const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

		return (
			<div className="flex flex-col gap-1">
				{label && (
					<label htmlFor={textareaId} className="text-xs font-medium text-foreground">
						{label}
					</label>
				)}
				<textarea
					ref={ref}
					id={textareaId}
					className={cn(
						'w-full rounded-md border border-border bg-background px-3 py-2 text-sm',
						'placeholder:text-muted-foreground resize-y min-h-[80px]',
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

Textarea.displayName = 'Textarea'
