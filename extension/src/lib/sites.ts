import type { SiteData, SitesDatabase } from './types'

let cachedSites: SiteData[] | null = null

export async function loadSites(): Promise<SiteData[]> {
	if (cachedSites) return cachedSites

	const url = chrome.runtime.getURL('sites.json')
	const resp = await fetch(url)
	const data: SitesDatabase = await resp.json()

	// Deduplicate by name — keep the entry with highest DR
	const byName = new Map<string, SiteData>()
	for (const site of data.sites) {
		const existing = byName.get(site.name)
		if (!existing || (site.dr ?? 0) > (existing.dr ?? 0)) {
			byName.set(site.name, site)
		}
	}
	cachedSites = [...byName.values()]
	return cachedSites
}

export function sortByDR(sites: SiteData[]): SiteData[] {
	return [...sites].sort((a, b) => b.dr - a.dr)
}

export function filterByCategory(sites: SiteData[], category: string): SiteData[] {
	return sites.filter((s) => s.category === category)
}

export function filterSubmittable(sites: SiteData[]): SiteData[] {
	return sites.filter((s) => s.submit_url !== null)
}

export function getCategories(sites: SiteData[]): string[] {
	return [...new Set(sites.map((s) => s.category))]
}

export function getSiteByName(sites: SiteData[], name: string): SiteData | undefined {
	return sites.find((s) => s.name === name)
}
