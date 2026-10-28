import { useEffect, useState } from 'react'
import api from '../api/axios'
import ConfirmModal from '../components/ConfirmModal'

const TYPE_LABEL = { asset: 'Asset', personnel: 'Outlet' }
const TYPE_CLS = { asset: 'bg-blue-100 text-blue-700', personnel: 'bg-purple-100 text-purple-700' }

const details = (e) => {
  const r = e.record || {}
  if (e.entity_type === 'asset') return [r.type, [r.brand, r.model].filter(Boolean).join(' / '), r.serial_number && `SN ${r.serial_number}`].filter(Boolean).join(' · ')
  return [r.department, r.email, r.phone].filter(Boolean).join(' · ')
}

const related = ({ assignments, maintenance_logs }) =>
  [assignments && `${assignments} assignment(s)`, maintenance_logs && `${maintenance_logs} maintenance log(s)`].filter(Boolean).join(', ') || '-'

export default function Archive() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [message, setMessage] = useState(null)
  const [confirmRestore, setConfirmRestore] = useState(null)

  const load = () => {
    setLoading(true)
    api.get('/archive', { params: { type: typeFilter } })
      .then(res => setList(res.data.data))
      .catch(err => setMessage({ ok: false, text: err.response?.data?.message || 'Error loading archive' }))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [typeFilter])

  const run = async (id, request) => {
    setBusyId(id); setMessage(null)
    try {
      const res = await request()
      setMessage({ ok: true, text: res.data.message })
      load()
    } catch (err) {
      setMessage({ ok: false, text: err.response?.data?.message || 'Something went wrong' })
    } finally { setBusyId(null) }
  }

  const handleRestore = (e) => setConfirmRestore(e)

  const restore = async () => {
    const res = await api.post(`/archive/${confirmRestore.id}/restore`)
    setMessage({ ok: true, text: res.data.message })
    load()
  }

  const handlePurge = (e) => {
    if (!confirm(`Permanently delete "${e.label}"? This cannot be undone.`)) return
    run(e.id, () => api.delete(`/archive/${e.id}`))
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Archive Log</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-5 flex flex-wrap gap-3 items-center">
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none">
          <option value="">All Types</option>
          <option value="asset">Assets</option>
          <option value="personnel">Outlets</option>
        </select>
        <p className="text-sm text-gray-400">Deleted assets and outlets are kept here and can be restored.</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm mb-5 border ${message.ok ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>{['Type','Name','Details','Related Records','Deleted By','Deleted At','Actions'].map(h => (
              <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">Loading…</td></tr>
            ) : list.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">Archive is empty</td></tr>
            ) : list.map(e => (
              <tr key={e.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${TYPE_CLS[e.entity_type]}`}>{TYPE_LABEL[e.entity_type]}</span>
                </td>
                <td className="px-4 py-3 font-medium">{e.label}</td>
                <td className="px-4 py-3 text-gray-500">{details(e) || '-'}</td>
                <td className="px-4 py-3 text-gray-500">{related(e.related)}</td>
                <td className="px-4 py-3 text-gray-500">{e.deleted_by_name || '-'}</td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(e.deleted_at).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => handleRestore(e)} disabled={busyId === e.id}
                      className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 disabled:opacity-50">Restore</button>
                    <button onClick={() => handlePurge(e)} disabled={busyId === e.id}
                      className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 disabled:opacity-50">Deleted</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmRestore && (
        <ConfirmModal tone="green" icon="↺" confirmLabel="Restore" busyLabel="Restoring…"
          title={`Restore ${TYPE_LABEL[confirmRestore.entity_type].toLowerCase()}?`}
          message={<><strong className="text-slate-700">{confirmRestore.label}</strong> will be moved back
            to {confirmRestore.entity_type === 'asset' ? 'Assets' : 'Outlets'}.</>}
          note={related(confirmRestore.related) !== '-' && `Also restores: ${related(confirmRestore.related)}`}
          onConfirm={restore} onClose={() => setConfirmRestore(null)} />
      )}
    </div>
  )
}
