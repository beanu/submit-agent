import type { LLMSettings } from '@/lib/types'
import { useCallback, useEffect, useState } from 'react'
import { getLLMConfig, setLLMConfig, getLanguage, setLanguage } from '@/lib/storage'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Select } from './ui/Select'

interface SettingsPanelProps {
	onClose: () => void
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
	const [llm, setLlm] = useState<LLMSettings>({
		apiKey: '',
		baseUrl: 'https://api.openai.com/v1',
		model: 'gpt-4o',
	})
	const [lang, setLang] = useState<'en' | 'zh'>('en')
	const [saving, setSaving] = useState(false)
	const [loaded, setLoaded] = useState(false)

	useEffect(() => {
		Promise.all([getLLMConfig(), getLanguage()]).then(([llmConfig, language]) => {
			setLlm(llmConfig)
			setLang(language)
			setLoaded(true)
		})
	}, [])

	const handleSave = useCallback(async () => {
		setSaving(true)
		try {
			await setLLMConfig(llm)
			await setLanguage(lang)
			onClose()
		} finally {
			setSaving(false)
		}
	}, [llm, lang, onClose])

	if (!loaded) {
		return <div className="p-4 text-xs text-muted-foreground">Loading settings...</div>
	}

	return (
		<div className="flex flex-col h-full">
			<header className="flex items-center justify-between border-b px-3 py-2">
				<span className="text-sm font-semibold">Settings</span>
				<Button variant="ghost" size="sm" onClick={onClose}>
					Back
				</Button>
			</header>

			<div className="flex-1 overflow-y-auto p-3 space-y-4">
				<div className="text-xs font-semibold">LLM Configuration</div>

				<Input
					label="API Key"
					type="password"
					placeholder="sk-..."
					value={llm.apiKey}
					onChange={(e) => setLlm((prev) => ({ ...prev, apiKey: e.target.value }))}
				/>

				<Input
					label="Base URL"
					placeholder="https://api.openai.com/v1"
					value={llm.baseUrl}
					onChange={(e) => setLlm((prev) => ({ ...prev, baseUrl: e.target.value }))}
				/>

				<Input
					label="Model"
					placeholder="gpt-4o"
					value={llm.model}
					onChange={(e) => setLlm((prev) => ({ ...prev, model: e.target.value }))}
				/>

				<div className="border-t border-border pt-4">
					<Select
						label="Language"
						value={lang}
						onChange={(e) => setLang(e.target.value as 'en' | 'zh')}
						options={[
							{ value: 'en', label: 'English' },
							{ value: 'zh', label: '中文' },
						]}
					/>
				</div>
			</div>

			<footer className="border-t p-3">
				<Button onClick={handleSave} disabled={saving} className="w-full">
					{saving ? 'Saving...' : 'Save Settings'}
				</Button>
			</footer>
		</div>
	)
}
