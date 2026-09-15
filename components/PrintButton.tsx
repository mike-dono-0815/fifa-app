'use client'

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden headline inline-flex items-center gap-1.5 rounded-fifa-sm border border-blue-neon bg-raised px-3.5 py-1.5 text-xs text-blue-neon transition hover:bg-blue-neon/15"
    >
      📄 PDF
    </button>
  )
}
