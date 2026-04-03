import type {
	AgentActivity,
	AgentStatus,
	ExecutionResult,
	HistoricalEvent,
} from '@page-agent/core'
import { useCallback, useRef, useState } from 'react'

import { SubmitAgent, buildProductContext } from '@/agent/SubmitAgent'
import { getLanguage, getLLMConfig } from '@/lib/storage'
import type { ProductProfile, SiteData } from '@/lib/types'

export interface UseSubmitAgentResult {
	status: AgentStatus
	history: HistoricalEvent[]
	activity: AgentActivity | null
	startSubmission: (site: SiteData, product: ProductProfile) => Promise<ExecutionResult>
	startSubmissionOnCurrentTab: (product: ProductProfile, tabUrl: string) => Promise<ExecutionResult>
	stop: () => void
	reset: () => void
}

async function buildAgent(product: ProductProfile, siteName: string, includeInitialTab = false): Promise<SubmitAgent> {
	const [llmConfig, lang] = await Promise.all([getLLMConfig(), getLanguage()])
	if (!llmConfig.baseUrl) throw new Error('LLM not configured. Please set the Base URL in Settings.')
	if (!llmConfig.model) throw new Error('Model not configured. Please set the model name in Settings.')
	const baseURL = llmConfig.baseUrl.replace(/\/+$/, '')
	const language = lang === 'zh' ? 'zh-CN' : 'en-US'
	return new SubmitAgent({
		baseURL,
		model: llmConfig.model,
		apiKey: llmConfig.apiKey || undefined,
		product,
		siteName,
		includeInitialTab,
		language,
	})
}

export function useSubmitAgent(): UseSubmitAgentResult {
	const agentRef = useRef<SubmitAgent | null>(null)
	const [status, setStatus] = useState<AgentStatus>('idle')
	const [history, setHistory] = useState<HistoricalEvent[]>([])
	const [activity, setActivity] = useState<AgentActivity | null>(null)

	function wireEvents(agent: SubmitAgent) {
		agent.addEventListener('statuschange', () => setStatus(agent.status as AgentStatus))
		agent.addEventListener('historychange', () => setHistory([...agent.history]))
		agent.addEventListener('activity', (e) => setActivity((e as CustomEvent).detail))
	}

	const startSubmission = useCallback(
		async (site: SiteData, product: ProductProfile): Promise<ExecutionResult> => {
			if (!site.submit_url) throw new Error(`No submit URL for site: ${site.name}`)

			agentRef.current?.dispose()
			const agent = await buildAgent(product, site.name)
			agentRef.current = agent
			wireEvents(agent)

			console.log('[SubmitAgent] Starting submission', { site: site.name })

			const task = [
				`Submit ${product.name} to ${site.name}.`,
				`Open the submission page: ${site.submit_url}`,
				'',
				'Known product information:',
				buildProductContext(product),
				'',
				'Constraints:',
				'- Rewrite descriptions to be unique for this site.',
				'- Report any fields you cannot fill (e.g. file uploads).',
				'- Do NOT click the final submit button. Let the user review and submit manually.',
			].join('\n')

			try {
				const result = await agent.execute(task)
				console.log('[SubmitAgent] Execution completed', { success: result.success })
				return result
			} catch (error) {
				console.error('[SubmitAgent] Execution failed', error)
				throw error
			}
		},
		[]
	)

	const startSubmissionOnCurrentTab = useCallback(
		async (product: ProductProfile, tabUrl: string): Promise<ExecutionResult> => {
			agentRef.current?.dispose()

			const siteName = (() => { try { return new URL(tabUrl).hostname } catch { return tabUrl } })()
			const agent = await buildAgent(product, siteName, true)
			agentRef.current = agent
			wireEvents(agent)

			console.log('[SubmitAgent] Starting float-fill on current tab', { siteName, tabUrl })

			const task = [
				`Fill the submission form on ${siteName} for ${product.name}.`,
				'',
				'Known product information:',
				buildProductContext(product),
				'',
				'Constraints:',
				'- Rewrite descriptions to be unique for this site.',
				'- Report any fields you cannot fill (e.g. file uploads).',
				'- Do NOT click the final submit button. Let the user review and submit manually.',
			].join('\n')

			try {
				const result = await agent.execute(task)
				chrome.runtime.sendMessage({ type: 'FLOAT_FILL', action: 'done' }).catch(() => {})
				return result
			} catch (error) {
				console.error('[SubmitAgent] Float-fill failed', error)
				chrome.runtime.sendMessage({ type: 'FLOAT_FILL', action: 'error' }).catch(() => {})
				throw error
			}
		},
		[]
	)

	const stop = useCallback(() => {
		agentRef.current?.stop()
	}, [])

	const reset = useCallback(() => {
		agentRef.current?.dispose()
		agentRef.current = null
		setStatus('idle')
		setHistory([])
		setActivity(null)
	}, [])

	return {
		status,
		history,
		activity,
		startSubmission,
		startSubmissionOnCurrentTab,
		stop,
		reset,
	}
}
