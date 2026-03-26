import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'wxt'
import { mkdirSync } from 'node:fs'

const chromeProfile = '.wxt/chrome-data'
mkdirSync(chromeProfile, { recursive: true })

export default defineConfig({
	srcDir: 'src',
	modules: ['@wxt-dev/module-react'],
	webExt: {
		chromiumProfile: chromeProfile,
		keepProfileChanges: true,
		chromiumArgs: ['--hide-crash-restore-bubble'],
	},
	vite: () => ({
		plugins: [tailwindcss()],
		define: {
			__VERSION__: JSON.stringify('0.1.0'),
		},
		build: {
			minify: false,
			chunkSizeWarningLimit: 2000,
		},
	}),
	zip: {
		artifactTemplate: 'submit-agent-{{version}}-{{browser}}.zip',
	},
	manifest: {
		name: 'Submit Agent',
		description: 'AI-powered auto-submission for product directories and backlink sites',
		permissions: ['tabs', 'tabGroups', 'sidePanel', 'storage', 'activeTab'],
		host_permissions: ['<all_urls>'],
		icons: {
			16: 'assets/icon-16.png',
			48: 'assets/icon-48.png',
			128: 'assets/icon-128.png',
		},
		action: {
			default_title: 'Submit Agent',
		},
		side_panel: {
			default_path: 'sidepanel/index.html',
		},
	},
})
