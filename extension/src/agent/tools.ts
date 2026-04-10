import type { PageAgentCore } from '@page-agent/core'
import * as z from 'zod/v4'

export interface SubmitAgentTool<TParams = any> {
	description: string
	inputSchema: z.ZodType<TParams>
	execute: (this: PageAgentCore, args: TParams) => Promise<string>
}

export function tool<TParams>(options: SubmitAgentTool<TParams>): SubmitAgentTool<TParams> {
	return options
}

/**
 * Custom tools specific to Submit Agent.
 *
 * NOTE: The base PageAgentCore already provides input_text, click_element_by_index,
 * select_dropdown_option, scroll, wait, done, and ask_user. Do NOT duplicate them here.
 * Only add tools that provide genuinely new capabilities.
 */
export const submitTools: Record<string, SubmitAgentTool> = {}
