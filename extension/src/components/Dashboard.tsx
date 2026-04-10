import type { SiteData, SubmissionRecord } from '@/lib/types'
import { useMemo, useRef, useState } from 'react'
import { useT } from '@/hooks/useLanguage'
import { SiteCard } from './SiteCard'

export type Tab = 'all' | 'ai' | 'startup' | 'seo' | 'community' | 'github'

interface DashboardProps {
	sites: SiteData[]
	submissions: Map<string, SubmissionRecord>
	onSelectSite: (site: SiteData) => void
	activeTab: Tab
	onTabChange: (tab: Tab) => void
}

/** Map raw site category → consolidated tab group */
const CATEGORY_GROUP: Record<string, Tab> = {
	'AI Directories': 'ai',
	'Chinese AI Directories': 'ai',
	'Startup & Product Directories': 'startup',
	'Web Directories (SEO)': 'seo',
	'Chinese General Directories': 'seo',
	'Communities & Forums': 'community',
	'Reddit': 'community',
	'GitHub Awesome Lists': 'github',
}

const TAB_DEFS: { id: Tab; labelKey: string }[] = [
	{ id: 'all', labelKey: 'dashboard.tab.all' },
	{ id: 'ai', labelKey: 'dashboard.tab.ai' },
	{ id: 'startup', labelKey: 'dashboard.tab.startup' },
	{ id: 'seo', labelKey: 'dashboard.tab.seo' },
	{ id: 'community', labelKey: 'dashboard.tab.community' },
	{ id: 'github', labelKey: 'dashboard.tab.github' },
]

function getGroup(category: string | undefined): Tab | null {
	if (!category) return null
	return CATEGORY_GROUP[category] ?? null
}

export function Dashboard({ sites, submissions, onSelectSite, activeTab, onTabChange }: DashboardProps) {
	const t = useT()
	const [search, setSearch] = useState('')
	const tabScrollRef = useRef<HTMLDivElement>(null)

	// Only alive sites with submit_url
	const aliveSites = useMemo(
		() => sites.filter((s) => s.status === 'alive' && !!s.submit_url),
		[sites]
	)

	// Per-tab counts (for badges)
	const tabCounts = useMemo(() => {
		const c: Record<string, number> = { all: aliveSites.length }
		for (const s of aliveSites) {
			const g = getGroup(s.category)
			if (g) c[g] = (c[g] ?? 0) + 1
		}
		return c
	}, [aliveSites])

	// Stats
	const stats = useMemo(() => {
		let submitted = 0
		for (const sub of submissions.values()) {
			if (sub.status === 'submitted' || sub.status === 'approved') submitted++
		}
		return { submitted, total: aliveSites.length }
	}, [aliveSites.length, submissions])

	// Filter by tab
	let filtered = activeTab === 'all'
		? aliveSites
		: aliveSites.filter((s) => getGroup(s.category) === activeTab)

	// Filter by search
	const q = search.trim().toLowerCase()
	if (q) {
		filtered = filtered.filter(
			(s) => s.name.toLowerCase().includes(q) || (s.category ?? '').toLowerCase().includes(q)
		)
	}

	// Sort by DR descending
	filtered.sort((a, b) => (b.dr ?? 0) - (a.dr ?? 0))

	const pct = stats.total > 0 ? Math.round((stats.submitted / stats.total) * 100) : 0

	function handleTabClick(id: Tab) {
		onTabChange(id)
		const btn = tabScrollRef.current?.querySelector<HTMLElement>(`[data-tab="${id}"]`)
		btn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
	}

	return (
		<div className="flex flex-col gap-2 h-full">
			{/* Progress */}
			<div className="px-1 space-y-1">
				<div className="flex items-center justify-between">
					<span className="text-xs font-medium">
						{t('dashboard.submitted', { submitted: stats.submitted, total: stats.total })}
					</span>
					<span className="text-xs text-muted-foreground">{pct}%</span>
				</div>
				<div className="h-1.5 rounded-full bg-muted overflow-hidden">
					<div
						className="h-full rounded-full bg-primary transition-all"
						style={{ width: `${pct}%` }}
					/>
				</div>
			</div>

			{/* Category tabs — horizontally scrollable */}
			<div
				ref={tabScrollRef}
				className="flex border-b overflow-x-auto"
				style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
			>
				{TAB_DEFS.map((def) => (
					<button
						key={def.id}
						data-tab={def.id}
						type="button"
						onClick={() => handleTabClick(def.id)}
						className={`shrink-0 px-3 py-1.5 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
							activeTab === def.id
								? 'border-primary text-foreground'
								: 'border-transparent text-muted-foreground hover:text-foreground'
						}`}
					>
						{t(def.labelKey as any)}
						<span className="ml-1 text-[10px] text-muted-foreground">
							{tabCounts[def.id] ?? 0}
						</span>
					</button>
				))}
			</div>

			{/* Search */}
			<input
				type="text"
				placeholder={t('dashboard.searchPlaceholder')}
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				className="w-full px-2.5 py-1.5 text-xs rounded border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
			/>

			{/* Site list */}
			<div className="flex-1 overflow-y-auto space-y-1.5">
				{filtered.map((site) => (
					<SiteCard
						key={site.name}
						site={site}
						status={submissions.get(site.name)?.status ?? 'not_started'}
						onSelect={onSelectSite}
					/>
				))}
				{filtered.length === 0 && (
					<div className="text-center text-xs text-muted-foreground py-8">
						{t('dashboard.emptyAll')}
					</div>
				)}
			</div>
		</div>
	)
}
