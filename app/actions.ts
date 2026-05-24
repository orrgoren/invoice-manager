'use server'

import { getToken } from './api/token'

export interface SearchResultItem {
  docId: string
  docNumber: string
  docDate: string
  docType: number
  itemDescription: string
  quantity: number
  price: number
}

export async function searchOldDocuments(
  clientId: string,
  query: string
): Promise<SearchResultItem[]> {
  if (!clientId || query.trim().length < 2) return []

  const tokenResponse = await getToken()

  const body = {
    pageSize: 100,
    clientId,
    status: [0, 1, 2, 3, 4],
    fromDate: '2015-01-01',
    toDate: new Date().toISOString().substring(0, 10),
    sort: 'documentDate',
  }

  const res = await fetch('https://api.greeninvoice.co.il/api/v1/documents/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenResponse.token}`,
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  })

  if (!res.ok) throw new Error('Document search failed')

  const data = await res.json()
  const docs: any[] = data.items ?? []
  const queryLower = query.trim().toLowerCase()
  const results: SearchResultItem[] = []

  for (const doc of docs) {
    for (const item of doc.income ?? []) {
      if ((item.description as string).toLowerCase().includes(queryLower)) {
        results.push({
          docId: doc.id,
          docNumber: doc.number,
          docDate: doc.documentDate,
          docType: doc.type,
          itemDescription: item.description,
          quantity: item.quantity,
          price: item.price,
        })
      }
    }
  }

  results.sort((a, b) => b.docDate.localeCompare(a.docDate))
  return results
}
