'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { searchOldDocuments, SearchResultItem } from '@/app/actions'

interface ClientOption {
  id: string
  name: string
}

const DOC_TYPE_LABELS: Record<number, string> = {
  10: 'הצעת מחיר',
  100: 'הזמנה',
  200: 'ת. משלוח',
  210: 'ת. החזרה',
  300: 'חשבון עסקה',
  305: 'חשבונית מס',
  320: 'חשבונית/קבלה',
  330: 'זיכוי',
  400: 'קבלה',
  405: 'קבלה/תרומה',
  500: 'הזמנת רכש',
}

const formatILS = (n: number) =>
  new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)

export function DocumentSearch({ clients }: { clients: ClientOption[] }) {
  const [open, setOpen] = useState(false)
  const [clientId, setClientId] = useState('')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [isPending, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!clientId || query.trim().length < 2) {
      setResults([])
      return
    }
    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const res = await searchOldDocuments(clientId, query.trim())
        setResults(res)
      })
    }, 500)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [clientId, query])

  const handleOpenChange = (val: boolean) => {
    setOpen(val)
    if (!val) {
      setClientId('')
      setQuery('')
      setResults([])
    }
  }

  const showNoResults =
    !isPending && clientId && query.trim().length >= 2 && results.length === 0

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all font-medium text-base">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          חיפוש במסמכים ישנים
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-right">
          <DialogTitle className="text-xl font-bold text-slate-800">
            חיפוש במסמכים ישנים
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 text-right mb-1">
              לקוח
            </label>
            <select
              value={clientId}
              onChange={e => {
                setClientId(e.target.value)
                setQuery('')
                setResults([])
              }}
              dir="rtl"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-right bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">בחר לקוח...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 text-right mb-1">
              חיפוש פריט
            </label>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="לדוגמה: מטריה..."
              disabled={!clientId}
              dir="rtl"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-right bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400 placeholder:text-slate-400"
            />
          </div>

          {isPending && (
            <div className="text-center py-10 text-slate-400 text-sm">מחפש...</div>
          )}

          {!isPending && results.length > 0 && (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr className="border-b border-slate-200">
                      <th className="text-right px-3 py-2.5 font-semibold text-slate-600 whitespace-nowrap">
                        תאריך
                      </th>
                      <th className="text-right px-3 py-2.5 font-semibold text-slate-600 whitespace-nowrap">
                        סוג מסמך
                      </th>
                      <th className="text-right px-3 py-2.5 font-semibold text-slate-600">
                        פריט
                      </th>
                      <th className="text-right px-3 py-2.5 font-semibold text-slate-600">
                        כמות
                      </th>
                      <th className="text-right px-3 py-2.5 font-semibold text-slate-600 whitespace-nowrap">
                        מחיר יח׳
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr
                        key={`${r.docId}-${i}`}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >
                        <td className="px-3 py-2.5 text-slate-500 text-xs whitespace-nowrap">
                          {r.docDate}
                        </td>
                        <td className="px-3 py-2.5 text-slate-500 text-xs whitespace-nowrap">
                          {DOC_TYPE_LABELS[r.docType] ?? `סוג ${r.docType}`}
                        </td>
                        <td className="px-3 py-2.5 text-slate-800">{r.itemDescription}</td>
                        <td className="px-3 py-2.5 text-slate-600 text-center">
                          {r.quantity}
                        </td>
                        <td className="px-3 py-2.5 font-semibold text-blue-600 whitespace-nowrap">
                          {formatILS(r.price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-400 text-right">
                {results.length} תוצאות
              </div>
            </div>
          )}

          {showNoResults && (
            <div className="text-center py-10 text-slate-400 text-sm">לא נמצאו תוצאות</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
