import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../context/AuthContext'
import Avatar from './Avatar'

const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const inputCls = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

export default function ProfileModal({ onClose }) {
  const { user, updateProfile, uploadAvatar, removeAvatar } = useAuth()
  const [form, setForm] = useState({ name: user?.name || '', current_password: '', new_password: '', confirm_password: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const photoAction = async (action) => {
    setError(''); setSuccess(''); setUploading(true)
    try {
      const res = await action()
      setSuccess(res.message)
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating photo')
    } finally { setUploading(false) }
  }

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    e.target.value = '' // allow picking the same file again
    if (!file) return
    if (!PHOTO_TYPES.includes(file.type)) return setError('Only JPG, PNG, WEBP or GIF images are allowed')
    if (file.size > 2 * 1024 * 1024) return setError('Image must be 2 MB or smaller')
    photoAction(() => uploadAvatar(file))
  }

  const handleRemovePhoto = () => photoAction(removeAvatar)
  const changingPassword = form.new_password !== ''

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccess('')
    if (changingPassword) {
      if (form.new_password.length < 8) return setError('New password must be at least 8 characters')
      if (form.new_password !== form.confirm_password) return setError('New passwords do not match')
      if (!form.current_password) return setError('Enter your current password to set a new one')
    }
    setSaving(true)
    try {
      const res = await updateProfile({
        name: form.name,
        ...(changingPassword && { current_password: form.current_password, new_password: form.new_password }),
      })
      setSuccess(res.message)
      setForm(f => ({ ...f, current_password: '', new_password: '', confirm_password: '' }))
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile')
    } finally { setSaving(false) }
  }

  // Portal to <body>: the header's backdrop-blur would otherwise trap this fixed overlay inside the header
  return createPortal(
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-slate-800 mb-5">Edit Profile</h3>

        <div className="flex items-center gap-4 mb-5">
          <button type="button" onClick={() => fileRef.current.click()} disabled={uploading} title="Change photo"
            className="relative group rounded-full shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            <Avatar user={{ ...user, name: form.name || user?.name }} className="h-20 w-20 text-2xl" />
            <span className={`absolute inset-0 rounded-full bg-slate-900/50 text-white text-xs font-medium flex items-center justify-center transition
              ${uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              {uploading ? <span className="h-6 w-6 rounded-full border-2 border-white border-b-transparent animate-spin" /> : 'Change'}
            </span>
          </button>
          <div className="min-w-0">
            <p className="text-sm text-slate-400 truncate mb-2">{user?.email}</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => fileRef.current.click()} disabled={uploading}
                className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 disabled:opacity-50">
                {user?.avatar_url ? 'Change photo' : 'Upload photo'}
              </button>
              {user?.avatar_url && (
                <button type="button" onClick={handleRemovePhoto} disabled={uploading}
                  className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 disabled:opacity-50">
                  Remove
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1.5">JPG, PNG, WEBP or GIF · max 2 MB</p>
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={handlePhoto} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm">{success}</div>}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} required className={inputCls} />
          </div>

          <div className="pt-2 border-t border-slate-100">
            <p className="text-sm font-medium text-slate-700 mt-3">Change Password</p>
            <p className="text-xs text-slate-400 mb-3">Leave blank to keep your current password.</p>
            <div className="space-y-3">
              <input type="password" placeholder="Current password" autoComplete="current-password"
                value={form.current_password} onChange={e => set('current_password', e.target.value)} className={inputCls} />
              <input type="password" placeholder="New password (min. 8 characters)" autoComplete="new-password"
                value={form.new_password} onChange={e => set('new_password', e.target.value)} className={inputCls} />
              <input type="password" placeholder="Confirm new password" autoComplete="new-password"
                value={form.confirm_password} onChange={e => set('confirm_password', e.target.value)} className={inputCls} />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm">Close</button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
