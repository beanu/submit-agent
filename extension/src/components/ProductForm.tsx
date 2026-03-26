import type { ProductProfile } from '@/lib/types'
import { useCallback, useState } from 'react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Textarea } from './ui/Textarea'

type FormData = Omit<ProductProfile, 'id' | 'createdAt' | 'updatedAt'>

interface ProductFormProps {
	initial?: ProductProfile
	onSave: (data: FormData) => Promise<void>
	onCancel?: () => void
}

const EMPTY_FORM: FormData = {
	name: '',
	url: '',
	tagline: '',
	shortDesc: '',
	longDesc: '',
	categories: [],
	screenshots: [],
	founderName: '',
	founderEmail: '',
	socialLinks: {},
}

export function ProductForm({ initial, onSave, onCancel }: ProductFormProps) {
	const [form, setForm] = useState<FormData>(initial ?? EMPTY_FORM)
	const [saving, setSaving] = useState(false)

	const update = useCallback(
		<K extends keyof FormData>(key: K, value: FormData[K]) => {
			setForm((prev) => ({ ...prev, [key]: value }))
		},
		[]
	)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setSaving(true)
		try {
			await onSave(form)
		} finally {
			setSaving(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="text-sm font-semibold">
				{initial ? 'Edit Product' : 'New Product Profile'}
			</div>

			<Input
				label="Product Name"
				placeholder="My AI Tool"
				value={form.name}
				onChange={(e) => update('name', e.target.value)}
				required
			/>

			<Input
				label="Website URL"
				placeholder="https://example.com"
				type="url"
				value={form.url}
				onChange={(e) => update('url', e.target.value)}
				required
			/>

			<Input
				label="Tagline"
				placeholder="One-sentence description"
				value={form.tagline}
				onChange={(e) => update('tagline', e.target.value)}
				required
			/>

			<Textarea
				label="Short Description (~50 words)"
				placeholder="Brief product description for directories..."
				value={form.shortDesc}
				onChange={(e) => update('shortDesc', e.target.value)}
				rows={3}
				required
			/>

			<Textarea
				label="Long Description (~150 words)"
				placeholder="Detailed product description..."
				value={form.longDesc}
				onChange={(e) => update('longDesc', e.target.value)}
				rows={5}
				required
			/>

			<Input
				label="Categories (comma-separated)"
				placeholder="AI, Productivity, SaaS"
				value={form.categories.join(', ')}
				onChange={(e) =>
					update(
						'categories',
						e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
					)
				}
			/>

			<div className="border-t border-border pt-4 mt-4">
				<div className="text-xs font-semibold mb-3">Founder Info</div>
				<div className="space-y-3">
					<Input
						label="Full Name"
						placeholder="Jane Doe"
						value={form.founderName}
						onChange={(e) => update('founderName', e.target.value)}
					/>
					<Input
						label="Email"
						placeholder="jane@example.com"
						type="email"
						value={form.founderEmail}
						onChange={(e) => update('founderEmail', e.target.value)}
					/>
				</div>
			</div>

			<div className="border-t border-border pt-4 mt-4">
				<div className="text-xs font-semibold mb-3">Social Links</div>
				<div className="space-y-3">
					{['twitter', 'github', 'linkedin', 'producthunt'].map((platform) => (
						<Input
							key={platform}
							label={platform.charAt(0).toUpperCase() + platform.slice(1)}
							placeholder={`https://${platform}.com/...`}
							value={form.socialLinks[platform] ?? ''}
							onChange={(e) =>
								update('socialLinks', { ...form.socialLinks, [platform]: e.target.value })
							}
						/>
					))}
				</div>
			</div>

			<div className="flex gap-2 pt-2">
				<Button type="submit" disabled={saving || !form.name || !form.url}>
					{saving ? 'Saving...' : initial ? 'Update' : 'Create Profile'}
				</Button>
				{onCancel && (
					<Button type="button" variant="outline" onClick={onCancel}>
						Cancel
					</Button>
				)}
			</div>
		</form>
	)
}
