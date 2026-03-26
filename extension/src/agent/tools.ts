import type { PageAgentCore } from '@page-agent/core'
import * as z from 'zod/v4'

export interface SubmitAgentTool<TParams = any> {
	description: string
	inputSchema: z.ZodType<TParams>
	execute: (this: PageAgentCore, args: TParams) => Promise<string>
}

function tool<TParams>(options: SubmitAgentTool<TParams>): SubmitAgentTool<TParams> {
	return options
}

/**
 * Custom tools specific to Submit Agent.
 * These extend the base PageAgentCore tools with form-filling capabilities.
 */
export const submitTools: Record<string, SubmitAgentTool> = {
	fill_form_field: tool({
		description:
			'Fill a specific form field identified by its element index with the appropriate product information. Use this for text inputs, textareas, and contenteditable elements.',
		inputSchema: z.object({
			index: z.number().describe('Element index from the page observation'),
			value: z.string().describe('The text value to fill in'),
			fieldName: z
				.string()
				.describe('Human-readable name of the field being filled, for logging'),
		}),
		execute: async function (input) {
			await this.pageController.inputText(input.index, input.value)
			return `Filled "${input.fieldName}" (element ${input.index}) with provided value.`
		},
	}),

	select_dropdown_option: tool({
		description:
			'Select an option from a dropdown/select element. First observe the page to see available options, then select the best match.',
		inputSchema: z.object({
			index: z.number().describe('Element index of the select/dropdown'),
			optionText: z.string().describe('The visible text of the option to select'),
		}),
		execute: async function (input) {
			await this.pageController.clickElement(input.index)
			return `Selected "${input.optionText}" from dropdown (element ${input.index}).`
		},
	}),

	report_form_status: tool({
		description:
			'Report the current status of form filling. Use this after filling all detectable fields to summarize what was filled and what needs manual attention.',
		inputSchema: z.object({
			filledFields: z.array(z.string()).describe('List of fields that were successfully filled'),
			skippedFields: z
				.array(z.string())
				.describe('List of fields that could not be filled automatically'),
			notes: z.string().optional().describe('Additional notes or issues encountered'),
		}),
		execute: async function (input) {
			const summary = [
				`Filled: ${input.filledFields.join(', ') || 'none'}`,
				`Skipped: ${input.skippedFields.join(', ') || 'none'}`,
				input.notes ? `Notes: ${input.notes}` : '',
			]
				.filter(Boolean)
				.join('\n')
			return summary
		},
	}),
}
