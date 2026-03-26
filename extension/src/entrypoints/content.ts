import { initPageController } from '@/agent/RemotePageController.content'

export default defineContentScript({
	matches: ['<all_urls>'],
	runAt: 'document_end',

	main() {
		console.debug('[Submit Agent] Content script loaded on', window.location.href)
		initPageController()
	},
})
