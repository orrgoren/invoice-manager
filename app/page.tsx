import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { getBusiness } from "./api/business"
import { getClients } from "./api/clients"
import { getDocuments } from "./api/documents"
import { getToken } from "./api/token"
import { DocumentSearch } from "@/components/DocumentSearch"

export default async function Home() {
  const tokenResponse = await getToken()
  const business: Business = await getBusiness(tokenResponse.token)
  const documentsResponse = await getDocuments(tokenResponse.token)
  const clientsResponse = await getClients(tokenResponse.token).catch(() => ({ items: [] }))
  const clients = ((clientsResponse.items ?? []) as { id: string; name: string }[])
    .sort((a, b) => a.name.localeCompare(b.name, 'he'))

  const documents = documentsResponse.items

  const totalInvoices = documents
    ?.filter((doc: Document) => doc.type === 305)
    .reduce((sum: number, doc: Document) => sum + doc.amount, 0)

  const totalOrders = documents
    ?.filter((doc: Document) => doc.type === 100)
    .reduce((sum: number, doc: Document) => sum + doc.amount, 0)

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {business?.name}
              </h1>
              <p className="text-slate-600 text-sm mt-1">
                מ.ע: {business?.taxId}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem
            value="orders"
            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <AccordionTrigger className="px-6 py-5 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4 text-right">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    הזמנות פתוחות
                  </h3>
                  <p className="text-lg sm:text-2xl font-bold text-green-600 break-words">
                    {new Intl.NumberFormat("he-IL", {
                      style: "currency",
                      currency: "ILS",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }).format(totalOrders!)}
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="px-6 pb-6 space-y-3">
                {documents
                  ?.filter((doc: Document) => doc.type === 100)
                  .sort((a: Document, b: Document) =>
                    a.client.name.localeCompare(b.client.name)
                  )
                  .map((doc: Document) => (
                    <>
                      <Dialog>
                        <DialogTrigger asChild>
                          <div
                            key={doc.id}
                            className="w-full p-5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:shadow-md transition-all duration-200 cursor-pointer group"
                          >
                            <div className="flex justify-between items-center">
                              <div className="text-right">
                                <h4 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                                  {doc.client.name}
                                </h4>
                                <p className="text-sm text-slate-500 mt-1">
                                  מס׳ {doc.number}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                  {doc.documentDate}
                                </p>
                              </div>
                              <div className="text-left">
                                <p className="text-sm sm:text-lg font-bold text-green-600 break-words">
                                  {new Intl.NumberFormat("he-IL", {
                                    style: "currency",
                                    currency: "ILS",
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  }).format(doc.amount)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader className="text-right">
                            <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg
                                  className="w-4 h-4 text-green-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                              </div>
                              <div>
                                <div>{doc.client.name}</div>
                                <div className="text-sm font-normal text-slate-500">
                                  מספר הזמנה: {doc.number}
                                </div>
                              </div>
                            </DialogTitle>
                          </DialogHeader>
                          <DialogDescription className="text-right">
                            <div className="bg-slate-50 rounded-lg p-4 mb-4">
                              <Table>
                                <TableHeader>
                                  <TableRow className="border-b-2 border-slate-200">
                                    <TableHead className="text-right font-semibold text-slate-700 py-3">
                                      כמות
                                    </TableHead>
                                    <TableHead className="text-right font-semibold text-slate-700 py-3">
                                      פירוט
                                    </TableHead>
                                    <TableHead className="text-right font-semibold text-slate-700 py-3">
                                      מחיר ליח׳
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {doc.income.map((incomeItem) => (
                                    <TableRow
                                      key={incomeItem.itemId}
                                      className="hover:bg-white transition-colors"
                                    >
                                      <TableCell className="text-right font-medium py-3">
                                        {incomeItem.quantity}
                                      </TableCell>
                                      <TableCell className="text-right py-3">
                                        {incomeItem.description}
                                      </TableCell>
                                      <TableCell className="text-right font-medium py-3">
                                        ₪{incomeItem.price}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </DialogDescription>
                        </DialogContent>
                      </Dialog>
                    </>
                  ))}
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem
            value="invoices"
            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <AccordionTrigger className="px-6 py-5 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4 text-right">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    חשבוניות פתוחות
                  </h3>
                  <p className="text-lg sm:text-2xl font-bold text-blue-600 break-words">
                    {new Intl.NumberFormat("he-IL", {
                      style: "currency",
                      currency: "ILS",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }).format(totalInvoices!)}
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="px-6 pb-6 space-y-3">
                {documents
                  ?.filter((doc: Document) => doc.type === 305)
                  .sort((a: Document, b: Document) =>
                    a.client.name.localeCompare(b.client.name)
                  )
                  .map((doc: Document) => (
                    <>
                      <Dialog>
                        <DialogTrigger asChild>
                          <div
                            key={doc.id}
                            className="w-full p-5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:shadow-md transition-all duration-200 cursor-pointer group"
                          >
                            <div className="flex justify-between items-center">
                              <div className="text-right">
                                <h4 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                                  {doc.client.name}
                                </h4>
                                <p className="text-sm text-slate-500 mt-1">
                                  מס׳ {doc.number}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                  {doc.documentDate}
                                </p>
                              </div>
                              <div className="text-left">
                                <p className="text-sm sm:text-lg font-bold text-blue-600 break-words">
                                  {new Intl.NumberFormat("he-IL", {
                                    style: "currency",
                                    currency: "ILS",
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  }).format(doc.amount)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader className="text-right">
                            <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg
                                  className="w-4 h-4 text-blue-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                              </div>
                              <div>
                                <div>{doc.client.name}</div>
                                <div className="text-sm font-normal text-slate-500">
                                  מספר חשבונית: {doc.number}
                                </div>
                              </div>
                            </DialogTitle>
                          </DialogHeader>
                          <DialogDescription className="text-right">
                            <div className="bg-slate-50 rounded-lg p-4 mb-4">
                              <Table>
                                <TableHeader>
                                  <TableRow className="border-b-2 border-slate-200">
                                    <TableHead className="text-right font-semibold text-slate-700 py-3">
                                      כמות
                                    </TableHead>
                                    <TableHead className="text-right font-semibold text-slate-700 py-3">
                                      פירוט
                                    </TableHead>
                                    <TableHead className="text-right font-semibold text-slate-700 py-3">
                                      מחיר ליח׳
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {doc.income.map((incomeItem) => (
                                    <TableRow
                                      key={incomeItem.itemId}
                                      className="hover:bg-white transition-colors"
                                    >
                                      <TableCell className="text-right font-medium py-3">
                                        {incomeItem.quantity}
                                      </TableCell>
                                      <TableCell className="text-right py-3">
                                        {incomeItem.description}
                                      </TableCell>
                                      <TableCell className="text-right font-medium py-3">
                                        ₪{incomeItem.price}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </DialogDescription>
                        </DialogContent>
                      </Dialog>
                    </>
                  ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-8 bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl font-semibold">סך הכל</h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  סכום כולל מכל המסמכים
                </p>
              </div>
            </div>
            <div className="text-left min-w-0">
              <p className="text-2xl sm:text-2xl md:text-3xl font-bold break-words">
                {new Intl.NumberFormat("he-IL", {
                  style: "currency",
                  currency: "ILS",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }).format(totalOrders! + totalInvoices!)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <DocumentSearch clients={clients} />
        </div>
      </div>
    </main>
  )
}
