import { useState } from 'react'
import type { ProductProfile } from '@/lib/types'
import { ProductForm } from '@/components/ProductForm'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useProduct } from '@/hooks/useProduct'

type View = { name: 'list' } | { name: 'create' } | { name: 'edit'; product: ProductProfile }

export default function App() {
	const [view, setView] = useState<View>({ name: 'list' })
	const { products, activeProduct, loading, createProduct, editProduct, deleteProduct, setActive } =
		useProduct()

	if (view.name === 'create') {
		return (
			<div className="max-w-2xl mx-auto p-6">
				<ProductForm
					onSave={async (data) => {
						await createProduct(data)
						setView({ name: 'list' })
					}}
					onCancel={() => setView({ name: 'list' })}
				/>
			</div>
		)
	}

	if (view.name === 'edit') {
		return (
			<div className="max-w-2xl mx-auto p-6">
				<ProductForm
					initial={view.product}
					onSave={async (data) => {
						await editProduct({ ...view.product, ...data })
						setView({ name: 'list' })
					}}
					onCancel={() => setView({ name: 'list' })}
				/>
			</div>
		)
	}

	return (
		<div className="max-w-2xl mx-auto p-6">
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 className="text-xl font-bold">Submit Agent</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Manage your product profiles for auto-submission
					</p>
				</div>
				<Button onClick={() => setView({ name: 'create' })}>New Product</Button>
			</div>

			{loading ? (
				<div className="text-sm text-muted-foreground">Loading...</div>
			) : products.length === 0 ? (
				<Card>
					<CardContent className="py-8 text-center">
						<div className="text-sm text-muted-foreground mb-3">
							No product profiles yet. Create one to start submitting.
						</div>
						<Button size="sm" onClick={() => setView({ name: 'create' })}>
							Create Your First Profile
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-3">
					{products.map((product) => {
						const isActive = activeProduct?.id === product.id
						return (
							<Card
								key={product.id}
								className={isActive ? 'border-primary' : 'hover:border-primary/50'}
							>
								<CardHeader>
									<div className="flex items-center gap-2">
										<CardTitle>{product.name}</CardTitle>
										{isActive && <Badge variant="default">Active</Badge>}
									</div>
									<div className="flex gap-1">
										{!isActive && (
											<Button
												variant="outline"
												size="sm"
												onClick={() => setActive(product.id)}
											>
												Set Active
											</Button>
										)}
										<Button
											variant="ghost"
											size="sm"
											onClick={() => setView({ name: 'edit', product })}
										>
											Edit
										</Button>
										<Button
											variant="ghost"
											size="sm"
											className="text-destructive"
											onClick={() => {
												if (confirm(`Delete "${product.name}"?`)) {
													deleteProduct(product.id)
												}
											}}
										>
											Delete
										</Button>
									</div>
								</CardHeader>
								<CardContent>
									<div className="text-foreground">{product.tagline}</div>
									<div className="mt-1">
										<a
											href={product.url}
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary hover:underline"
										>
											{product.url}
										</a>
									</div>
									{product.categories.length > 0 && (
										<div className="flex gap-1 mt-2 flex-wrap">
											{product.categories.map((cat) => (
												<Badge key={cat} variant="outline">
													{cat}
												</Badge>
											))}
										</div>
									)}
								</CardContent>
							</Card>
						)
					})}
				</div>
			)}
		</div>
	)
}
