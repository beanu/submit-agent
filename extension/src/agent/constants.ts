import type { LLMSettings } from '@/lib/types'

export const DEFAULT_LLM_CONFIG: LLMSettings = {
	apiKey: '',
	baseUrl: 'https://api.openai.com/v1',
	model: 'gpt-4o',
}
