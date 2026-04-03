import type { LLMSettings, ProductProfile } from './types'
import { getLLMConfig } from './storage'

export type GeneratedProfile = Omit<ProductProfile, 'id' | 'createdAt' | 'updatedAt' | 'screenshots' | 'founderName' | 'founderEmail' | 'socialLinks' | 'logoSquare' | 'logoBanner'>

export type GenerateProgressStep =
	| 'fetching'
	| 'parsing'
	| 'analyzing'
	| 'generating'
	| 'done'

const SYSTEM_PROMPT = `You are a product analyst. Given a product's webpage content, generate a structured profile for directory submission.

Return ONLY valid JSON with these exact fields:
{
  "name": "Product Name",
  "url": "the canonical product URL",
  "tagline": "One concise sentence describing the product",
  "shortDesc": "A 40-60 word description suitable for directory listings",
  "longDesc": "A 120-180 word detailed description covering what the product does, who it's for, and key benefits",
  "categories": ["Category1", "Category2", "Category3"]
}

Rules:
- name: The official product/brand name (from the page title or og:title, not the domain)
- tagline: Max one sentence, punchy and clear
- shortDesc: Written for SEO-friendly directory listings, natural tone
- longDesc: Detailed but not salesy, covers features, target audience, and value proposition
- categories: 2-5 relevant categories (e.g. "AI", "Productivity", "Developer Tools", "SaaS", "Marketing")
- All text in English
- Base your analysis on the actual page content provided, not assumptions
- Return ONLY the JSON object, no markdown fences, no explanation`

/** Extract useful text from raw HTML without a DOM parser */
function extractPageText(html: string, pageUrl: string): string {
	const parts: string[] = [`URL: ${pageUrl}`]

	// og:title
	const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
		?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i)
	if (ogTitle) parts.push(`OG Title: ${ogTitle[1]}`)

	// og:description
	const ogDesc = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)
		?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i)
	if (ogDesc) parts.push(`OG Description: ${ogDesc[1]}`)

	// og:site_name
	const ogSite = html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i)
		?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:site_name["']/i)
	if (ogSite) parts.push(`Site Name: ${ogSite[1]}`)

	// <title>
	const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)
	if (title) parts.push(`Page Title: ${title[1].trim()}`)

	// meta description
	const metaDesc = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
		?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)
	if (metaDesc) parts.push(`Meta Description: ${metaDesc[1]}`)

	// Strip scripts, styles, and HTML tags to get body text
	let bodyText = html
		.replace(/<script[\s\S]*?<\/script>/gi, ' ')
		.replace(/<style[\s\S]*?<\/style>/gi, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/\s+/g, ' ')
		.trim()

	if (bodyText.length > 3000) bodyText = bodyText.slice(0, 3000)
	if (bodyText) parts.push(`Page Content:\n${bodyText}`)

	return parts.join('\n\n')
}

/** Fetch page HTML via background service worker (bypasses CORS/CSP) */
async function fetchPageHtml(url: string): Promise<string | null> {
	try {
		const response = await chrome.runtime.sendMessage({ type: 'FETCH_PAGE_CONTENT', url })
		if (response?.ok && response.html) return response.html as string
		console.warn('[profile-generator] Failed to fetch page:', response?.error)
		return null
	} catch (err) {
		console.warn('[profile-generator] fetchPageHtml error:', err)
		return null
	}
}

function parseJsonResponse(text: string): GeneratedProfile {
	let cleaned = text.trim()
	const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/)
	if (fenceMatch) {
		cleaned = fenceMatch[1].trim()
	}

	try {
		return JSON.parse(cleaned)
	} catch {
		const objectMatch = cleaned.match(/\{[\s\S]*\}/)
		if (objectMatch) {
			return JSON.parse(objectMatch[0])
		}
		throw new Error(
			'The AI model returned an unexpected format. This usually means the model doesn\'t support structured JSON output well. Try a different model in Settings.'
		)
	}
}

export async function generateProfile(
	url: string,
	signal?: AbortSignal,
	llmConfig?: LLMSettings,
	onProgress?: (step: GenerateProgressStep) => void,
): Promise<GeneratedProfile> {
	const config = llmConfig ?? await getLLMConfig()

	if (!config.baseUrl) {
		throw new Error('LLM not configured. Please set up your LLM in Settings.')
	}

	// Step 1: Fetch webpage content
	onProgress?.('fetching')
	const html = await fetchPageHtml(url)

	// Step 2: Parse and extract useful text
	onProgress?.('parsing')
	const pageContent = html ? extractPageText(html, url) : `URL: ${url}\n(Could not fetch page content — please ensure the URL is accessible)`

	// Step 3: Send to LLM
	onProgress?.('analyzing')
	const baseUrl = config.baseUrl.replace(/\/+$/, '')
	const endpoint = `${baseUrl}/chat/completions`

	const response = await fetch(endpoint, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
		},
		body: JSON.stringify({
			model: config.model,
			messages: [
				{ role: 'system', content: SYSTEM_PROMPT },
				{
					role: 'user',
					content: `Generate a directory submission profile from this webpage content:\n\n${pageContent}`,
				},
			],
			temperature: 0.7,
			max_tokens: 1024,
		}),
		signal,
	})

	if (!response.ok) {
		const errorText = await response.text().catch(() => '')
		if (response.status === 401 || response.status === 403) {
			throw new Error('Authentication failed — please check your API Key in Settings.')
		}
		if (response.status === 404) {
			throw new Error('API endpoint not found — please check the Base URL in Settings.')
		}
		if (response.status === 429) {
			throw new Error('Rate limited by the API provider. Please wait a moment and try again.')
		}
		const lower = errorText.toLowerCase()
		if (response.status === 400 && lower.includes('model') && (lower.includes('not found') || lower.includes('not exist'))) {
			throw new Error(`Model "${config.model}" was not found. Please check the model name in Settings.`)
		}
		throw new Error(`API error (${response.status}): ${errorText || 'Unknown error'}. Check your LLM configuration in Settings.`)
	}

	// Step 4: Parse response
	onProgress?.('generating')
	const data = await response.json()
	const content = data.choices?.[0]?.message?.content
	if (!content) {
		throw new Error('The AI model returned an empty response. Try again or switch to a different model in Settings.')
	}

	const profile = parseJsonResponse(content)
	onProgress?.('done')
	return profile
}
