import type {
	AgentActivity,
	AgentStatus,
	ExecutionResult,
	HistoricalEvent,
} from '@page-agent/core'
import { useCallback, useRef, useState } from 'react'

import { SubmitAgent } from '@/agent/SubmitAgent'
import { getLLMConfig } from '@/lib/storage'
import type { ProductProfile, SiteData } from '@/lib/types'

export interface UseSubmitAgentResult {
	status: AgentStatus
	history: HistoricalEvent[]
	activity: AgentActivity | null
	startSubmission: (site: SiteData, product: ProductProfile) => Promise<ExecutionResult>
	stop: () => void
}

export function useSubmitAgent(): UseSubmitAgentResult {
	const agentRef = useRef<SubmitAgent | null>(null)
	const [status, setStatus] = useState<AgentStatus>('idle')
	const [history, setHistory] = useState<HistoricalEvent[]>([])
	const [activity, setActivity] = useState<AgentActivity | null>(null)

	const startSubmission = useCallback(
		async (site: SiteData, product: ProductProfile): Promise<ExecutionResult> => {
			if (!site.submit_url) {
				throw new Error(`No submit URL for site: ${site.name}`)
			}

			// Dispose previous agent if any
			agentRef.current?.dispose()

			const llmConfig = await getLLMConfig()
			if (!llmConfig.apiKey && !llmConfig.baseUrl) {
				throw new Error('LLM not configured. Please set your API key in Settings.')
			}

			const agent = new SubmitAgent({
				baseURL: llmConfig.baseUrl,
				model: llmConfig.model,
				apiKey: llmConfig.apiKey || undefined,
				product,
				siteName: site.name,
				includeInitialTab: true,
			})

			agentRef.current = agent

			// Wire events
			const handleStatusChange = () => {
				const newStatus = agent.status as AgentStatus
				setStatus(newStatus)
				if (newStatus === 'idle' || newStatus === 'completed' || newStatus === 'error') {
					setActivity(null)
				}
			}

			const handleHistoryChange = () => {
				setHistory([...agent.history])
			}

			const handleActivity = (e: Event) => {
				setActivity((e as CustomEvent).detail as AgentActivity)
			}

			agent.addEventListener('statuschange', handleStatusChange)
			agent.addEventListener('historychange', handleHistoryChange)
			agent.addEventListener('activity', handleActivity)

			setStatus('running')
			setHistory([])
			setActivity({ type: 'thinking' })

			const task = [
				`Go to ${site.submit_url} and fill out the product submission form.`,
				`Site: ${site.name}`,
				`Product: ${product.name} (${product.url})`,
				'Fill all form fields with the product data from your context.',
				'Rewrite descriptions to be unique for this site.',
				'Do NOT click the final submit button. Stop after filling and report the form status.',
			].join('\n')

			try {
				const result = await agent.execute(task)
				return result
			} finally {
				agent.removeEventListener('statuschange', handleStatusChange)
				agent.removeEventListener('historychange', handleHistoryChange)
				agent.removeEventListener('activity', handleActivity)
			}
		},
		[]
	)

	const stop = useCallback(() => {
		agentRef.current?.stop()
	}, [])

	return {
		status,
		history,
		activity,
		startSubmission,
		stop,
	}
}
