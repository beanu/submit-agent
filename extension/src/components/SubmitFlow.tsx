import type { ProductProfile, SiteData, SubmissionRecord, SubmissionStatus } from '@/lib/types'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'

interface SubmitFlowProps {
	site: SiteData
	product: ProductProfile | null
	submission?: SubmissionRecord
	onStartSubmit: () => void
	onSkip: () => void
	onBack: () => void
}

export function SubmitFlow({
	site,
	product,
	submission,
	onStartSubmit,
	onSkip,
	onBack,
}: SubmitFlowProps) {
	const status: SubmissionStatus = submission?.status ?? 'not_started'

	return (
		<div className="flex flex-col h-full">
			<header className="flex items-center justify-between border-b px-3 py-2">
				<span className="text-sm font-semibold truncate">{site.name}</span>
				<Button variant="ghost" size="sm" onClick={onBack}>
					Back
				</Button>
			</header>

			<div className="flex-1 overflow-y-auto p-3 space-y-3">
				{/* Site info */}
				<Card>
					<CardHeader>
						<CardTitle>Site Details</CardTitle>
						<Badge variant="outline">DR {site.dr}</Badge>
					</CardHeader>
					<CardContent className="space-y-1">
						<div className="flex justify-between">
							<span>Category</span>
							<span>{site.category}</span>
						</div>
						<div className="flex justify-between">
							<span>Traffic</span>
							<span>{site.monthly_traffic}</span>
						</div>
						<div className="flex justify-between">
							<span>Link Type</span>
							<span>{site.link_type === 'dofollow' ? 'Dofollow' : 'Nofollow'}</span>
						</div>
						<div className="flex justify-between">
							<span>Pricing</span>
							<span>{site.pricing}</span>
						</div>
						{site.notes && (
							<div className="pt-1 text-muted-foreground italic">{site.notes}</div>
						)}
					</CardContent>
				</Card>

				{/* Product check */}
				{!product && (
					<Card className="border-warning">
						<CardContent className="text-warning text-xs py-2">
							No product profile selected. Please create one in the Options page first.
						</CardContent>
					</Card>
				)}

				{product && (
					<Card>
						<CardHeader>
							<CardTitle>Product</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="font-medium text-foreground">{product.name}</div>
							<div className="mt-1">{product.tagline}</div>
						</CardContent>
					</Card>
				)}

				{/* Submission status */}
				{submission && (
					<Card>
						<CardHeader>
							<CardTitle>Submission</CardTitle>
							<Badge
								variant={
									status === 'submitted' || status === 'approved'
										? 'success'
										: status === 'failed' || status === 'rejected'
											? 'destructive'
											: status === 'in_progress'
												? 'warning'
												: 'muted'
								}
							>
								{status}
							</Badge>
						</CardHeader>
						{submission.notes && <CardContent>{submission.notes}</CardContent>}
					</Card>
				)}
			</div>

			{/* Actions */}
			<footer className="border-t p-3 space-y-2">
				{site.submit_url && (
					<Button
						className="w-full"
						disabled={!product || status === 'in_progress'}
						onClick={onStartSubmit}
					>
						{status === 'not_started' || status === 'failed'
							? 'Start Auto-Submit'
							: 'Re-Submit'}
					</Button>
				)}
				{!site.submit_url && (
					<div className="text-xs text-muted-foreground text-center py-1">
						No direct submit URL available for this site
					</div>
				)}
				<div className="flex gap-2">
					{site.submit_url && (
						<Button
							variant="outline"
							size="sm"
							className="flex-1"
							onClick={() => window.open(site.submit_url!, '_blank')}
						>
							Open Manually
						</Button>
					)}
					<Button variant="ghost" size="sm" className="flex-1" onClick={onSkip}>
						Skip
					</Button>
				</div>
			</footer>
		</div>
	)
}
