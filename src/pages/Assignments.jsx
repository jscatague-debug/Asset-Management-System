import { useEffect, useState } from 'react'
import api from '../api/axios'

export default function Assignments() {
  const [assignments, setAssignments] = useState([])
  const [assets, setAssets] = useState([])
  const [personnel, setPersonnel] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ asset_id: '', personnel_id: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get('/assignments'),
      api.get('/assets', { params: { status: 'available' } }),
      api.get('/personnel'),
    ]).then(([a, as, p]) => {
      setAssignments(a.data.data)
      setAssets(as.data.data)
      setPersonnel(p.data.data)
    }).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      await api.post('/assignments', form)
      setShowForm(false); setForm({ asset_id: '', personnel_id: '', notes: '' }); load()
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating assignment')
    } finally { setSaving(false) }
  }

  const handleReturn = async (id) => {
    if (!confirm('Mark asset as returned?')) return
    await api.put(`/assignments/${id}/return`, {}); load()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Assignments</h2>
        <button onClick={() => { setError(''); setShowForm(true) }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">+ Assign Asset</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>{['Asset','Tag','Personnel','Department','Assigned','Returned','Actions'].map(h => (
              <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">Loading…</td></tr>
            ) : assignments.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">No assignments yet</td></tr>
            ) : assignments.map(a => (
              <tr key={a.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{a.asset_name}</td>
                <td className="px-4 py-3 font-mono text-xs">{a.asset_tag}</td>
                <td className="px-4 py-3">{a.personnel_name}</td>
                <td className="px-4 py-3 text-gray-500">{a.department || '-'}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(a.assigned_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {a.returned_at
                    ? <span className="text-gray-400">{new Date(a.returned_at).toLocaleDateString()}</span>
                    : <span className="text-green-600 font-medium">Active</span>}
                </td>
                <td className="px-4 py-3">
                  {!a.returned_at && (
                    <button onClick={() => handleReturn(a.id)}
                      className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200">Return</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Assign Asset to Personnel</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asset *</label>
                <select value={form.asset_id} onChange={e => setForm(f => ({...f, asset_id: e.target.value}))} required
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none">
                  <option value="">Select available asset</option>
                  {assets.map(a => <option key={a.id} value={a.id}>{a.name} ({a.asset_tag})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Personnel *</label>
                <select value={form.personnel_id} onChange={e => setForm(f => ({...f, personnel_id: e.target.value}))} required
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none">
                  <option value="">Select personnel</option>
                  {personnel.map(p => <option key={p.id} value={p.id}>{p.name}{p.department ? ` — ${p.department}` : ''}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} rows={3}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50">
                  {saving ? 'Assigning…' : 'Assign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
