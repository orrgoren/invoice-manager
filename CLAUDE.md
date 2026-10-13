# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # ESLint
```

No test suite is configured.

## Architecture

This is a **Next.js 13 App Router** project (single-page, server-rendered) that serves as a read-only dashboard for a Hebrew-language invoicing business ("Pirsom Tamir").

### Data flow

All data fetching happens server-side in `app/page.tsx` (an async Server Component):

1. `app/api/token.ts` — authenticates via Morning's OAuth endpoint using `GREEN_INVOICE_API_KEY` (client_id) and `GREEN_INVOICE_SECRET` (client_secret) env vars, returning `{ token }` (cached 55 min via `next: { revalidate: 3300 }`; tokens are valid 1 hour)
2. `app/api/business.ts` — fetches the authenticated business profile
3. `app/api/documents.ts` — searches for open documents (status `[0]`), types `100` (orders) and `305` (invoices), from 2022-01-01 to today (no cache, always fresh)

All TypeScript interfaces for the API responses live in `app/api/interfaces.ts` (global, no export).

### Green Invoice API reference

Base URL: `https://api.greeninvoice.co.il/api/v1`

**Authentication** — `POST https://api.morning.co/idp/v1/oauth/token` (separate auth host; sandbox: `https://api.sandbox.morning.dev`) with `{ grant_type: "client_credentials", client_id, client_secret }`. Returns `{ accessToken, expiresAt }`; token valid 1 hour. The old `POST /account/token` was blocked on 2026-10-14. Full OpenAPI spec: `https://developers.morning.co/docs/openapi.bundled.json`.

**`POST /documents/search`** — body fields (all optional):

| Field | Type | Notes |
|---|---|---|
| `page` | int | |
| `pageSize` | int | Default 100 used in this app |
| `number` | int | Document number |
| `type` | int[] | See document types below |
| `status` | int[] | See document statuses below |
| `paymentTypes` | int[] | |
| `fromDate` | string | `YYYY-MM-DD` |
| `toDate` | string | `YYYY-MM-DD` |
| `clientId` | string | |
| `clientName` | string | |
| `description` | string | |
| `sort` | string | `"documentDate"` or `"creationDate"` |

Response: `{ total, page, pageSize, pages, items[] }`

**Document status codes (`status` field):**

| Value | Meaning |
|---|---|
| `0` | Open (currently fetched by this app) |
| `1` | Closed |
| `2` | Manually marked as closed |
| `3` | Cancels another document |
| `4` | Cancelled |

**Document type codes (`type` field):**

| Value | Hebrew | English |
|---|---|---|
| `10` | הצעת מחיר | Price quote |
| `100` | הזמנה | Order (fetched by this app) |
| `200` | תעודת משלוח | Delivery note |
| `210` | תעודת החזרה | Return delivery note |
| `300` | חשבון עסקה | Transaction account |
| `305` | חשבונית מס | Tax invoice (fetched by this app) |
| `320` | חשבונית מס / קבלה | Tax invoice + receipt |
| `330` | חשבונית זיכוי | Credit/refund invoice |
| `400` | קבלה | Receipt |
| `405` | קבלה על תרומה | Donation receipt |
| `500` | הזמנת רכש | Purchase order |
| `600` | קבלת פיקדון | Deposit receipt |
| `610` | משיכת פיקדון | Deposit withdrawal |

Note: types `320`, `400`, and `405` require a `payment` array when creating documents.

**`GET /businesses/me`** — returns the authenticated business profile (see `Business` interface in `app/api/interfaces.ts`).

### UI

- RTL layout (`<html dir="rtl">`) with Hebrew content, Rubik font
- Radix UI primitives (Accordion, Dialog) wrapped in `components/ui/`
- Tailwind CSS for all styling — `lib/utils.ts` exports `cn()` (clsx + tailwind-merge)
- Currency formatted with `Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS" })`
- Clicking a document card opens a Dialog with a line-item table (`income[]` array)

### Environment variables required

```
GREEN_INVOICE_API_KEY=
GREEN_INVOICE_SECRET=
```
