import { useEffect, useState } from 'react'
import api from '../api/axios'
import QRCodeModal from '../components/QRCodeModal'

const BLANK = { name: '', asset_tag: '', type: '', brand: '', model: '', serial_number: '', purchase_date: '', notes: '', status: 'available' }
const TYPES = ['Laptop', 'Desktop', 'Monitor', 'Printer', 'Server', 'Network Device', 'Mobile', 'Tablet', 'Other']

const badge = (s) => {
  const cls = { available: 'bg-green-100 text-green-700', assigned: 'bg-yellow-100 text-yellow-700', maintenance: 'bg-red-100 text-red-700' }
  return <span className={`text-xs px-2 py-1 rounded-full font-medium ${cls[s]}`}>{s}</span>
}

export default function Assets() {
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editAsset, setEditAsset] = useState(null)
  const [qrAsset, setQrAsset] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    api.get('/assets', { params: { search, status: statusFilter } })
      .then(res => setAssets(res.data.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [search, statusFilter])

  const openAdd = () => { setEditAsset(null); setForm(BLANK); setError(''); setShowForm(true) }
  const openEdit = (a) => {
    setEditAsset(a)
    setForm({ name: a.name, asset_tag: a.asset_tag, type: a.type, brand: a.brand || '', model: a.model || '',
      serial_number: a.serial_number || '', purchase_date: a.purchase_date?.slice(0,10) || '', notes: a.notes || '', status: a.status })
    setError(''); setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      if (editAsset) await api.put(`/assets/${editAsset.id}`, form)
      else await api.post('/assets', form)
      setShowForm(false); load()
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving asset')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this asset?')) return
    await api.delete(`/assets/${id}`); load()
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Assets</h2>
        <button onClick={openAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">+ Add Asset</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-5 flex gap-3">
        <input type="text" placeholder="Search by name, tag, serial…" value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none">
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="assigned">Assigned</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>{['Asset Tag','Name','Type','Brand / Model','Assigned To','Status','Actions'].map(h => (
              <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">Loading…</td></tr>
            ) : assets.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">No assets found</td></tr>
            ) : assets.map(a => (
              <tr key={a.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{a.asset_tag}</td>
                <td className="px-4 py-3 font-medium">{a.name}</td>
                <td className="px-4 py-3 text-gray-500">{a.type}</td>
                <td className="px-4 py-3 text-gray-500">{[a.brand, a.model].filter(Boolean).join(' / ') || '-'}</td>
                <td className="px-4 py-3 text-gray-500">{a.assigned_to || '-'}</td>
                <td className="px-4 py-3">{badge(a.status)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => setQrAsset(a)} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200">QR</button>
                    <button onClick={() => openEdit(a)} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">Edit</button>
                    <button onClick={() => handleDelete(a.id)} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-xl font-bold mb-4">{editAsset ? 'Edit Asset' : 'Add Asset'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input value={form.name} onChange={e => set('name', e.target.value)} required
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asset Tag *</label>
                  <input value={form.asset_tag} onChange={e => set('asset_tag', e.target.value)} required disabled={!!editAsset}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select value={form.type} onChange={e => set('type', e.target.value)} required
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none">
                    <option value="">Select type</option>
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <input value={form.brand} onChange={e => set('brand', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <input value={form.model} onChange={e => set('model', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                  <input value={form.serial_number} onChange={e => set('serial_number', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                  <input type="date" value={form.purchase_date} onChange={e => set('purchase_date', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                {editAsset && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select value={form.status} onChange={e => set('status', e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none">
                      <option value="available">Available</option>
                      <option value="assigned">Assigned</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                )}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">Cancel</button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {qrAsset && <QRCodeModal asset={qrAsset} onClose={() => setQrAsset(null)} />}
    </div>
  )
}
