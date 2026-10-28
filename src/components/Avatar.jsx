import { useState } from 'react'

// Profile photo, falling back to the user's initial when there is none (or it fails to load)
export default function Avatar({ user, src, className = 'h-9 w-9 text-sm' }) {
  const url = src ?? user?.avatar_url
  const [failed, setFailed] = useState(null)

  if (url && failed !== url) {
    return <img src={url} alt={user?.name || 'Profile'} onError={() => setFailed(url)}
      className={`${className} rounded-full object-cover shrink-0 bg-slate-100`} />
  }
  return (
    <div className={`${className} rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center shrink-0`}>
      {user?.name?.[0]?.toUpperCase()}
    </div>
  )
}
