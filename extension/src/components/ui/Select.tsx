import { cn } from '@/lib/cn'
import type { SelectHTMLAttributes } from 'react'
import { forwardRef } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
	label?: string
	options: { value: string; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
	({ label, options, className, id, ...props }, ref) => {
		const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

		return (
			<div className="flex flex-col gap-1">
				{label && (
					<label htmlFor={selectId} className="text-xs font-medium text-foreground">
						{label}
					</label>
				)}
				<select
					ref={ref}
					id={selectId}
					className={cn(
						'h-9 w-full rounded-md border border-border bg-background px-3 text-sm',
						'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
						'disabled:opacity-50',
						className
					)}
					{...props}
				>
					{options.map((opt) => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
				</select>
			</div>
		)
	}
)

Select.displayName = 'Select'
