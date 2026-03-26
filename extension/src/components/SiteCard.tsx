import type { SiteData, SubmissionStatus } from '@/lib/types'
import { Badge } from './ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'

interface SiteCardProps {
	site: SiteData
	status?: SubmissionStatus
	onSelect?: (site: SiteData) => void
}

const statusConfig: Record<
	SubmissionStatus,
	{ label: string; variant: 'default' | 'success' | 'warning' | 'destructive' | 'muted' }
> = {
	not_started: { label: 'Not Started', variant: 'muted' },
	in_progress: { label: 'In Progress', variant: 'warning' },
	submitted: { label: 'Submitted', variant: 'default' },
	approved: { label: 'Approved', variant: 'success' },
	rejected: { label: 'Rejected', variant: 'destructive' },
	failed: { label: 'Failed', variant: 'destructive' },
	skipped: { label: 'Skipped', variant: 'muted' },
}

export function SiteCard({ site, status = 'not_started', onSelect }: SiteCardProps) {
	const statusInfo = statusConfig[status]

	return (
		<Card
			className="cursor-pointer hover:border-primary/50 transition-colors"
			onClick={() => onSelect?.(site)}
		>
			<CardHeader>
				<CardTitle className="truncate flex-1">{site.name}</CardTitle>
				<div className="flex items-center gap-1.5 shrink-0">
					<Badge variant="outline">DR {site.dr}</Badge>
					<Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex items-center justify-between">
					<span className="text-muted-foreground">{site.category}</span>
					<span>
						{site.link_type === 'dofollow' ? (
							<Badge variant="success">DF</Badge>
						) : (
							<Badge variant="muted">NF</Badge>
						)}
					</span>
				</div>
				{site.monthly_traffic && (
					<div className="mt-1 text-muted-foreground">{site.monthly_traffic} / mo</div>
				)}
			</CardContent>
		</Card>
	)
}
