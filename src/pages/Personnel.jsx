import { useEffect, useState } from 'react'
import api from '../api/axios'

const BLANK = { name: '', department: '', email: '', phone: '' }

export default function Personnel() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    api.get('/personnel').then(res => setList(res.data.data)).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const openAdd = () => { setEditItem(null); setForm(BLANK); setError(''); setShowForm(true) }
  const openEdit = (p) => { setEditItem(p); setForm({ name: p.name, department: p.department || '', email: p.email || '', phone: p.phone || '' }); setError(''); setShowForm(true) }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      if (editItem) await api.put(`/personnel/${editItem.id}`, form)
      else await api.post('/personnel', form)
      setShowForm(false); load()
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this personnel?')) return
    await api.delete(`/personnel/${id}`); load()
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Personnel</h2>
        <button onClick={openAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">+ Add Personnel</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>{['Name','Department','Email','Phone','Actions'].map(h => (
              <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-10 text-gray-400">Loading…</td></tr>
            ) : list.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-gray-400">No personnel found</td></tr>
            ) : list.map(p => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-gray-500">{p.department || '-'}</td>
                <td className="px-4 py-3 text-gray-500">{p.email || '-'}</td>
                <td className="px-4 py-3 text-gray-500">{p.phone || '-'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">{editItem ? 'Edit Personnel' : 'Add Personnel'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
              {[['name','Name',true,'text'],['department','Department',false,'text'],['email','Email',false,'email'],['phone','Phone',false,'text']].map(([k, label, req, type]) => (
                <div key={k}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}{req ? ' *' : ''}</label>
                  <input type={type} value={form[k]} onChange={e => set(k, e.target.value)} required={req}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
