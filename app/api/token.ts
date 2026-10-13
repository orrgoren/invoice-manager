export async function getToken(): Promise<{ token: string }> {
  const body = {
    grant_type: "client_credentials",
    client_id: process.env.GREEN_INVOICE_API_KEY,
    client_secret: process.env.GREEN_INVOICE_SECRET
  }

  const res = await fetch("https://api.morning.co/idp/v1/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
    next: { revalidate: 3300 }
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Token fetch failed: ${res.status} ${res.statusText} — ${text}`)
  }

  const { accessToken } = await res.json()
  return { token: accessToken }
}
