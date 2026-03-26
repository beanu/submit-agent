import { type DBSchema, type IDBPDatabase, openDB } from 'idb'
import type { ProductProfile, SubmissionRecord } from './types'

const DB_NAME = 'submit-agent'
const DB_VERSION = 1

interface SubmitAgentDB extends DBSchema {
	products: {
		key: string
		value: ProductProfile
		indexes: { 'by-updated': number }
	}
	submissions: {
		key: string
		value: SubmissionRecord
		indexes: {
			'by-site': string
			'by-product': string
			'by-status': string
			'by-updated': number
		}
	}
}

let dbPromise: Promise<IDBPDatabase<SubmitAgentDB>> | null = null

function getDB() {
	if (!dbPromise) {
		dbPromise = openDB<SubmitAgentDB>(DB_NAME, DB_VERSION, {
			upgrade(db) {
				const products = db.createObjectStore('products', { keyPath: 'id' })
				products.createIndex('by-updated', 'updatedAt')

				const submissions = db.createObjectStore('submissions', { keyPath: 'id' })
				submissions.createIndex('by-site', 'siteName')
				submissions.createIndex('by-product', 'productId')
				submissions.createIndex('by-status', 'status')
				submissions.createIndex('by-updated', 'updatedAt')
			},
		})
	}
	return dbPromise
}

// ---- Product CRUD ----

export async function saveProduct(
	data: Omit<ProductProfile, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ProductProfile> {
	const db = await getDB()
	const now = Date.now()
	const record: ProductProfile = {
		...data,
		id: crypto.randomUUID(),
		createdAt: now,
		updatedAt: now,
	}
	await db.put('products', record)
	return record
}

export async function updateProduct(product: ProductProfile): Promise<ProductProfile> {
	const db = await getDB()
	const updated = { ...product, updatedAt: Date.now() }
	await db.put('products', updated)
	return updated
}

export async function getProduct(id: string): Promise<ProductProfile | undefined> {
	const db = await getDB()
	return db.get('products', id)
}

export async function listProducts(): Promise<ProductProfile[]> {
	const db = await getDB()
	const all = await db.getAllFromIndex('products', 'by-updated')
	return all.reverse()
}

export async function deleteProduct(id: string): Promise<void> {
	const db = await getDB()
	await db.delete('products', id)
}

// ---- Submission CRUD ----

export async function saveSubmission(
	data: Omit<SubmissionRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<SubmissionRecord> {
	const db = await getDB()
	const now = Date.now()
	const record: SubmissionRecord = {
		...data,
		id: crypto.randomUUID(),
		createdAt: now,
		updatedAt: now,
	}
	await db.put('submissions', record)
	return record
}

export async function updateSubmission(submission: SubmissionRecord): Promise<SubmissionRecord> {
	const db = await getDB()
	const updated = { ...submission, updatedAt: Date.now() }
	await db.put('submissions', updated)
	return updated
}

export async function getSubmission(id: string): Promise<SubmissionRecord | undefined> {
	const db = await getDB()
	return db.get('submissions', id)
}

export async function getSubmissionBySite(siteName: string): Promise<SubmissionRecord | undefined> {
	const db = await getDB()
	return db.getFromIndex('submissions', 'by-site', siteName)
}

export async function listSubmissions(): Promise<SubmissionRecord[]> {
	const db = await getDB()
	const all = await db.getAllFromIndex('submissions', 'by-updated')
	return all.reverse()
}

export async function listSubmissionsByProduct(productId: string): Promise<SubmissionRecord[]> {
	const db = await getDB()
	return db.getAllFromIndex('submissions', 'by-product', productId)
}

export async function deleteSubmission(id: string): Promise<void> {
	const db = await getDB()
	await db.delete('submissions', id)
}

export async function clearSubmissions(): Promise<void> {
	const db = await getDB()
	await db.clear('submissions')
}
