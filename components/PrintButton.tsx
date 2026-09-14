'use client'

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden headline rounded-fifa-sm border border-border-mid px-3 py-1.5 text-xs text-text-secondary transition hover:border-blue-neon hover:text-blue-neon"
    >
      📄 PDF
    </button>
  )
}
