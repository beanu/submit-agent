import { type AgentConfig, PageAgentCore } from '@page-agent/core'
import type { ProductProfile } from '@/lib/types'

import { RemotePageController } from './RemotePageController'
import { TabsController } from './TabsController'
import SUBMIT_PROMPT from './submit-prompt.md?raw'
import { createTabTools } from './tabTools'
import { submitTools } from './tools'

export interface SubmitAgentConfig extends AgentConfig {
	product: ProductProfile
	siteName: string
	includeInitialTab?: boolean
}

function detectLanguage(): 'en-US' | 'zh-CN' {
	const lang = navigator.language || navigator.languages?.[0] || 'en-US'
	return lang.startsWith('zh') ? 'zh-CN' : 'en-US'
}

/**
 * SubmitAgent extends PageAgentCore for automated form submission.
 *
 * Follows the same runtime pattern as MultiPageAgent:
 * - Constructs RemotePageController + TabsController internally
 * - Heartbeat + mask lifecycle via storage polling
 * - Tab tools for multi-tab navigation
 * - Product-specific system prompt and form-filling tools
 */
export class SubmitAgent extends PageAgentCore {
	readonly product: ProductProfile
	readonly siteName: string

	constructor(config: SubmitAgentConfig) {
		const tabsController = new TabsController()
		const pageController = new RemotePageController(tabsController)
		const tabTools = createTabTools(tabsController)

		const language = config.language ?? detectLanguage()
		const targetLanguage = language === 'zh-CN' ? '中文' : 'English'
		const systemPrompt =
			SUBMIT_PROMPT.replace(
				/Default working language: \*\*.*?\*\*/,
				`Default working language: **${targetLanguage}**`
			)

		const includeInitialTab = config.includeInitialTab ?? true

		let heartBeatInterval: null | number = null

		super({
			...config,
			pageController: pageController as any,
			customTools: { ...tabTools, ...submitTools },
			customSystemPrompt: systemPrompt,
			maxSteps: config.maxSteps ?? 30,

			onBeforeTask: async (agent) => {
				await tabsController.init(includeInitialTab)

				heartBeatInterval = window.setInterval(() => {
					chrome.storage.local.set({ agentHeartbeat: Date.now() })
				}, 1_000)

				await chrome.storage.local.set({ isAgentRunning: true })
			},

			onAfterTask: async () => {
				if (heartBeatInterval) {
					window.clearInterval(heartBeatInterval)
					heartBeatInterval = null
				}
				await chrome.storage.local.set({ isAgentRunning: false })
			},

			onBeforeStep: async () => {
				if (!tabsController.currentTabId) return
				await tabsController.waitUntilTabLoaded(tabsController.currentTabId!)
			},

			onDispose: () => {
				if (heartBeatInterval) {
					window.clearInterval(heartBeatInterval)
					heartBeatInterval = null
				}
				chrome.storage.local.set({ isAgentRunning: false })
				tabsController.dispose()
			},
		})

		this.product = config.product
		this.siteName = config.siteName
	}
}

export function buildProductContext(product: ProductProfile): string {
	const lines = [
		'## Product Data',
		'',
		`**Name:** ${product.name}`,
		`**URL:** ${product.url}`,
		`**Tagline:** ${product.tagline}`,
		'',
		'**Short Description:**',
		product.shortDesc,
		'',
		'**Long Description:**',
		product.longDesc,
		'',
		`**Categories:** ${product.categories.join(', ')}`,
	]

	if (product.founderName) {
		lines.push(`**Founder:** ${product.founderName}`)
	}
	if (product.founderEmail) {
		lines.push(`**Email:** ${product.founderEmail}`)
	}

	const socialEntries = Object.entries(product.socialLinks).filter(([_, v]) => v)
	if (socialEntries.length > 0) {
		lines.push('', '**Social Links:**')
		for (const [platform, url] of socialEntries) {
			lines.push(`- ${platform}: ${url}`)
		}
	}

	return lines.join('\n')
}
