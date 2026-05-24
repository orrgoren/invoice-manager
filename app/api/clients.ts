export async function getClients(token: string) {
  const pageSize = 100
  let page = 1
  let allItems: unknown[] = []

  while (true) {
    const res = await fetch('https://api.greeninvoice.co.il/api/v1/clients/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ page, pageSize }),
      next: { revalidate: 300 },
    })
    if (!res.ok) throw new Error(`Failed to fetch clients`)
    const data = await res.json()
    allItems = allItems.concat(data.items)
    if (page >= data.pages) break
    page++
  }

  return allItems
}
