import { useState } from 'react'
import type { SiteData } from '@/lib/types'
import { Dashboard } from '@/components/Dashboard'
import { SubmitFlow } from '@/components/SubmitFlow'
import { SettingsPanel } from '@/components/SettingsPanel'
import { Button } from '@/components/ui/Button'
import { useProduct } from '@/hooks/useProduct'
import { useSites } from '@/hooks/useSites'
import { useSubmitAgent } from '@/hooks/useSubmitAgent'

type View =
	| { name: 'dashboard' }
	| { name: 'site-detail'; site: SiteData }
	| { name: 'settings' }

export default function App() {
	const [view, setView] = useState<View>({ name: 'dashboard' })
	const { sites, submissions, loading: sitesLoading, markSubmitted, markSkipped } = useSites()
	const { activeProduct, loading: productLoading } = useProduct()
	const { startSubmission } = useSubmitAgent()

	if (view.name === 'settings') {
		return <SettingsPanel onClose={() => setView({ name: 'dashboard' })} />
	}

	if (view.name === 'site-detail') {
		const site = view.site
		const submission = submissions.get(site.name)

		return (
			<SubmitFlow
				site={site}
				product={activeProduct}
				submission={submission}
				onStartSubmit={() => {
					if (activeProduct) {
						startSubmission(site, activeProduct).then(() => {
							markSubmitted(site.name, activeProduct.id)
						})
					}
				}}
				onSkip={() => {
					if (activeProduct) {
						markSkipped(site.name, activeProduct.id)
					}
					setView({ name: 'dashboard' })
				}}
				onBack={() => setView({ name: 'dashboard' })}
			/>
		)
	}

	// Dashboard view
	const isLoading = sitesLoading || productLoading

	return (
		<div className="flex flex-col h-screen bg-background">
			{/* Header */}
			<header className="flex items-center justify-between border-b px-3 py-2">
				<div className="flex items-center gap-2">
					<span className="text-sm font-semibold">Submit Agent</span>
					{activeProduct && (
						<span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
							{activeProduct.name}
						</span>
					)}
				</div>
				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => chrome.runtime.openOptionsPage()}
					>
						Product
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setView({ name: 'settings' })}
					>
						Settings
					</Button>
				</div>
			</header>

			{/* Main content */}
			<main className="flex-1 overflow-hidden p-3">
				{isLoading ? (
					<div className="flex items-center justify-center h-full text-xs text-muted-foreground">
						Loading...
					</div>
				) : !activeProduct ? (
					<div className="flex flex-col items-center justify-center h-full gap-3 text-center">
						<div className="text-sm text-muted-foreground">No product profile yet</div>
						<Button size="sm" onClick={() => chrome.runtime.openOptionsPage()}>
							Create Product Profile
						</Button>
					</div>
				) : (
					<Dashboard
						sites={sites}
						submissions={submissions}
						onSelectSite={(site) => setView({ name: 'site-detail', site })}
					/>
				)}
			</main>
		</div>
	)
}
