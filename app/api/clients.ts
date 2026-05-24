export async function getClients(token: string) {
  const res = await fetch('https://api.greeninvoice.co.il/api/v1/clients/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ pageSize: 100 }),
    next: { revalidate: 300 },
  })
  if (!res.ok) throw new Error(`Failed to fetch clients`)
  return res.json()
}
