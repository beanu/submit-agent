import { handlePageControlMessage } from '@/agent/RemotePageController.background'
import { handleTabControlMessage, setupTabChangeEvents } from '@/agent/TabsController.background'

export default defineBackground(() => {
	console.log('[Submit Agent] Background service worker started')

	setupTabChangeEvents()

	chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {})

	chrome.runtime.onMessage.addListener((message, sender, sendResponse): true | undefined => {
		if (message.type === 'TAB_CONTROL') {
			return handleTabControlMessage(message, sender, sendResponse)
		} else if (message.type === 'PAGE_CONTROL') {
			return handlePageControlMessage(message, sender, sendResponse)
		} else if (message.type === 'SUBMIT_CONTROL') {
			return handleSubmitControl(message, sendResponse)
		} else {
			sendResponse({ error: 'Unknown message type' })
			return
		}
	})
})

function handleSubmitControl(
	message: { type: string; action: string; payload?: any },
	sendResponse: (response: unknown) => void
): true | undefined {
	switch (message.action) {
		case 'open_submit_page': {
			const url = message.payload as string
			if (!url) {
				sendResponse({ error: 'No URL provided' })
				return
			}
			chrome.tabs.create({ url, active: true }).then((tab) => {
				sendResponse({ ok: true, tabId: tab.id })
			})
			return true
		}
		default:
			sendResponse({ error: `Unknown SUBMIT_CONTROL action: ${message.action}` })
			return
	}
}
