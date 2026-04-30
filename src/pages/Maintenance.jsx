import { useEffect, useState } from 'react'
import api from '../api/axios'

const STATUS_CLS = { pending: 'bg-yellow-100 text-yellow-700', in_progress: 'bg-blue-100 text-blue-700', completed: 'bg-green-100 text-green-700' }
const TYPES = ['general', 'hardware', 'software', 'network', 'preventive']

export default function Maintenance() {
  const [logs, setLogs] = useState([])
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [updateLog, setUpdateLog] = useState(null)
  const [form, setForm] = useState({ asset_id: '', issue_description: '', maintenance_type: 'general', notes: '' })
  const [upForm, setUpForm] = useState({ status: 'pending', performed_by: '', notes: '', maintenance_type: 'general' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get('/maintenance', { params: { status: statusFilter } }),
      api.get('/assets'),
    ]).then(([m, a]) => { setLogs(m.data.data); setAssets(a.data.data) })
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [statusFilter])

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      await api.post('/maintenance', form)
      setShowForm(false); setForm({ asset_id: '', issue_description: '', maintenance_type: 'general', notes: '' }); load()
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating log')
    } finally { setSaving(false) }
  }

  const handleUpdate = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      await api.put(`/maintenance/${updateLog.id}`, upForm)
      setUpdateLog(null); load()
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating')
    } finally { setSaving(false) }
  }

  const openUpdate = (log) => {
    setUpdateLog(log)
    setUpForm({ status: log.status, performed_by: log.performed_by || '', notes: log.notes || '', maintenance_type: log.maintenance_type || 'general' })
    setError('')
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Maintenance Logs</h2>
        <button onClick={() => { setError(''); setShowForm(true) }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">+ Log Issue</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-5">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>{['Asset','Issue','Type','Status','Performed By','Date','Actions'].map(h => (
              <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">Loading…</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">No maintenance logs</td></tr>
            ) : logs.map(m => (
              <tr key={m.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium">{m.asset_name}</p>
                  <p className="text-xs text-gray-400">{m.asset_tag}</p>
                </td>
                <td className="px-4 py-3 text-gray-600 max-w-xs">
                  <p className="truncate">{m.issue_description}</p>
                </td>
                <td className="px-4 py-3 text-gray-500 capitalize">{m.maintenance_type}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_CLS[m.status]}`}>
                    {m.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{m.performed_by || '-'}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(m.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {m.status !== 'completed' && (
                    <button onClick={() => openUpdate(m)}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">Update</button>
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
            <h3 className="text-xl font-bold mb-4">Log Maintenance Issue</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asset *</label>
                <select value={form.asset_id} onChange={e => setForm(f => ({...f, asset_id: e.target.value}))} required
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none">
                  <option value="">Select asset</option>
                  {assets.map(a => <option key={a.id} value={a.id}>{a.name} ({a.asset_tag})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Description *</label>
                <textarea value={form.issue_description} onChange={e => setForm(f => ({...f, issue_description: e.target.value}))} required rows={3}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Type</label>
                <select value={form.maintenance_type} onChange={e => setForm(f => ({...f, maintenance_type: e.target.value}))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none">
                  {TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} rows={2}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50">
                  {saving ? 'Submitting…' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {updateLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-1">Update Maintenance</h3>
            <p className="text-sm text-gray-400 mb-4">{updateLog.asset_name} — {updateLog.asset_tag}</p>
            <form onSubmit={handleUpdate} className="space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={upForm.status} onChange={e => setUpForm(f => ({...f, status: e.target.value}))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none">
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Type</label>
                <select value={upForm.maintenance_type} onChange={e => setUpForm(f => ({...f, maintenance_type: e.target.value}))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none">
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Performed By</label>
                <input value={upForm.performed_by} onChange={e => setUpForm(f => ({...f, performed_by: e.target.value}))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={upForm.notes} onChange={e => setUpForm(f => ({...f, notes: e.target.value}))} rows={3}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setUpdateLog(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50">
                  {saving ? 'Updating…' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
