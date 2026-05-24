export async function getToken() {
  const body = {
    id: process.env.GREEN_INVOICE_API_KEY,
    secret: process.env.GREEN_INVOICE_SECRET
  }

  const res = await fetch(
    "https://api.greeninvoice.co.il/api/v1/account/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
      next: { revalidate: 3600 }
    }
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Token fetch failed: ${res.status} ${res.statusText} — ${text}`)
  }

  return res.json()
}
