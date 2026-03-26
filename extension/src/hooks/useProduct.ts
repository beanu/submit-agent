import { useCallback, useEffect, useState } from 'react'
import type { ProductProfile } from '@/lib/types'
import {
	listProducts,
	saveProduct,
	updateProduct,
	deleteProduct as dbDeleteProduct,
} from '@/lib/db'
import { getActiveProductId, setActiveProductId } from '@/lib/storage'

export interface UseProductResult {
	products: ProductProfile[]
	activeProduct: ProductProfile | null
	loading: boolean
	createProduct: (data: Omit<ProductProfile, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
	editProduct: (product: ProductProfile) => Promise<void>
	deleteProduct: (id: string) => Promise<void>
	setActive: (id: string) => Promise<void>
	refresh: () => Promise<void>
}

export function useProduct(): UseProductResult {
	const [products, setProducts] = useState<ProductProfile[]>([])
	const [activeId, setActiveId] = useState<string | null>(null)
	const [loading, setLoading] = useState(true)

	const refresh = useCallback(async () => {
		const [prods, id] = await Promise.all([listProducts(), getActiveProductId()])
		setProducts(prods)
		setActiveId(id)
		setLoading(false)
	}, [])

	useEffect(() => {
		refresh()
	}, [refresh])

	const activeProduct = products.find((p) => p.id === activeId) ?? products[0] ?? null

	const createProduct = useCallback(
		async (data: Omit<ProductProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
			const created = await saveProduct(data)
			if (products.length === 0) {
				await setActiveProductId(created.id)
			}
			await refresh()
		},
		[products.length, refresh]
	)

	const editProduct = useCallback(
		async (product: ProductProfile) => {
			await updateProduct(product)
			await refresh()
		},
		[refresh]
	)

	const deleteProduct = useCallback(
		async (id: string) => {
			await dbDeleteProduct(id)
			if (activeId === id) {
				await setActiveProductId(null)
			}
			await refresh()
		},
		[activeId, refresh]
	)

	const setActive = useCallback(
		async (id: string) => {
			await setActiveProductId(id)
			setActiveId(id)
		},
		[]
	)

	return {
		products,
		activeProduct,
		loading,
		createProduct,
		editProduct,
		deleteProduct,
		setActive,
		refresh,
	}
}
