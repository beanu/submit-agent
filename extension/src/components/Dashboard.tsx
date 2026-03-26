import type { SiteData, SubmissionRecord } from '@/lib/types'
import { getCategories } from '@/lib/sites'
import { useMemo, useState } from 'react'
import { SiteCard } from './SiteCard'
import { Select } from './ui/Select'

interface DashboardProps {
	sites: SiteData[]
	submissions: Map<string, SubmissionRecord>
	onSelectSite: (site: SiteData) => void
}

type SortField = 'dr' | 'name' | 'status'

export function Dashboard({ sites, submissions, onSelectSite }: DashboardProps) {
	const [categoryFilter, setCategoryFilter] = useState('all')
	const [sortBy, setSortBy] = useState<SortField>('dr')
	const [linkTypeFilter, setLinkTypeFilter] = useState('all')

	const categories = useMemo(() => getCategories(sites), [sites])

	const filteredSites = useMemo(() => {
		let result = sites

		if (categoryFilter !== 'all') {
			result = result.filter((s) => s.category === categoryFilter)
		}

		if (linkTypeFilter !== 'all') {
			result = result.filter((s) => s.link_type === linkTypeFilter)
		}

		result = [...result].sort((a, b) => {
			if (sortBy === 'dr') return b.dr - a.dr
			if (sortBy === 'name') return a.name.localeCompare(b.name)
			return 0
		})

		return result
	}, [sites, categoryFilter, sortBy, linkTypeFilter])

	const stats = useMemo(() => {
		let submitted = 0
		let total = sites.length
		for (const sub of submissions.values()) {
			if (sub.status === 'submitted' || sub.status === 'approved') submitted++
		}
		return { submitted, total }
	}, [sites, submissions])

	return (
		<div className="flex flex-col gap-3 h-full">
			{/* Stats bar */}
			<div className="flex items-center justify-between px-1">
				<span className="text-xs text-muted-foreground">
					{stats.submitted} / {stats.total} submitted
				</span>
				<div className="h-1.5 flex-1 mx-3 rounded-full bg-muted overflow-hidden">
					<div
						className="h-full bg-primary rounded-full transition-all"
						style={{
							width: `${stats.total > 0 ? (stats.submitted / stats.total) * 100 : 0}%`,
						}}
					/>
				</div>
			</div>

			{/* Filters */}
			<div className="flex gap-2">
				<Select
					value={categoryFilter}
					onChange={(e) => setCategoryFilter(e.target.value)}
					options={[
						{ value: 'all', label: 'All Categories' },
						...categories.map((c) => ({ value: c, label: c })),
					]}
					className="flex-1 h-7 text-xs"
				/>
				<Select
					value={linkTypeFilter}
					onChange={(e) => setLinkTypeFilter(e.target.value)}
					options={[
						{ value: 'all', label: 'All Links' },
						{ value: 'dofollow', label: 'Dofollow' },
						{ value: 'nofollow', label: 'Nofollow' },
					]}
					className="h-7 text-xs"
				/>
				<Select
					value={sortBy}
					onChange={(e) => setSortBy(e.target.value as SortField)}
					options={[
						{ value: 'dr', label: 'DR' },
						{ value: 'name', label: 'Name' },
					]}
					className="h-7 text-xs"
				/>
			</div>

			{/* Site list */}
			<div className="flex-1 overflow-y-auto space-y-2">
				{filteredSites.map((site) => (
					<SiteCard
						key={site.name}
						site={site}
						status={submissions.get(site.name)?.status ?? 'not_started'}
						onSelect={onSelectSite}
					/>
				))}
				{filteredSites.length === 0 && (
					<div className="text-center text-xs text-muted-foreground py-8">
						No sites match the current filters
					</div>
				)}
			</div>
		</div>
	)
}
