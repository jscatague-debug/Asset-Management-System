import { useState } from 'react'
import { createPortal } from 'react-dom'

const TONES = {
  amber: { icon: 'bg-amber-100 text-amber-700', btn: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500' },
  green: { icon: 'bg-green-100 text-green-700', btn: 'bg-green-600 hover:bg-green-700 focus:ring-green-500' },
  red:   { icon: 'bg-red-100 text-red-700',     btn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500' },
}

/**
 * Styled replacement for window.confirm. `onConfirm` may be async: the modal shows a busy
 * state while it runs, closes on success, and shows the API error message on failure.
 */
export default function ConfirmModal({ title, message, note, icon, tone = 'amber', confirmLabel = 'Confirm', busyLabel = 'Working…', onConfirm, onClose }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const t = TONES[tone]

  const handleConfirm = async () => {
    setBusy(true); setError('')
    try {
      await onConfirm()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
      setBusy(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => !busy && onClose()}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-start gap-4">
          <div className={`h-11 w-11 shrink-0 rounded-full flex items-center justify-center text-xl ${t.icon}`}>{icon}</div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            <div className="text-sm text-slate-500 mt-1 break-words">{message}</div>
          </div>
        </div>
        {note && <div className="mt-4 text-sm bg-slate-50 rounded-lg px-4 py-3 text-slate-600">{note}</div>}
        {error && <div className="mt-4 bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
        <div className="flex gap-3 justify-end mt-6">
          <button onClick={onClose} disabled={busy}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm disabled:opacity-50">Cancel</button>
          <button onClick={handleConfirm} disabled={busy} autoFocus
            className={`px-4 py-2 text-white rounded-lg text-sm disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2 ${t.btn}`}>
            {busy ? busyLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
