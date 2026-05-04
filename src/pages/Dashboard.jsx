import { useEffect, useState } from 'react'
import api from '../api/axios'
import { Link } from 'react-router-dom'
const StatCard = ({ label, value, color, icon, href }) => {
  const card = (
    <div className={`bg-white rounded-xl p-6 shadow-sm border-l-4 ${color} flex items-center gap-4 hover:shadow-md transition`}>
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  )

  return href ? <Link to={href}>{card}</Link> : card
}


const statusClass = (s) => ({
  available: 'bg-green-100 text-green-700',
  assigned: 'bg-yellow-100 text-yellow-700',
  maintenance: 'bg-red-100 text-red-700',
  pending: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
}[s] || 'bg-gray-100 text-gray-600')

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/stats').then(res => setStats(res.data.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <StatCard label="Total Assets" value={stats.total_assets} color="border-blue-500" icon="💻" href="/assets"/>
        <StatCard label="Available" value={stats.available_assets} color="border-green-500" icon="✅" href="/assets"/>
        <StatCard label="Assigned" value={stats.assigned_assets} color="border-yellow-500" icon="📋" href="assigments"/>
        <StatCard label="In Maintenance" value={stats.maintenance_assets} color="border-red-500" icon="🔧" href="maintenance"/>
        <StatCard label="Total Personnel" value={stats.total_personnel} color="border-purple-500" icon="👥" href="personnel"/>
        <StatCard label="Pending Maintenance" value={stats.pending_maintenance} color="border-orange-500" icon="⚠️" href="maintenance"/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Recent Assets</h3>
          {stats.recent_assets.length === 0 ? <p className="text-gray-400 text-sm">No assets yet</p> : (
            <div className="space-y-3">
              {stats.recent_assets.map(a => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{a.name}</p>
                    <p className="text-xs text-gray-400">{a.asset_tag} · {a.type}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusClass(a.status)}`}>{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Recent Maintenance</h3>
          {stats.recent_maintenance.length === 0 ? <p className="text-gray-400 text-sm">No maintenance logs yet</p> : (
            <div className="space-y-3">
              {stats.recent_maintenance.map(m => (
                <div key={m.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{m.asset_name}</p>
                    <p className="text-xs text-gray-400">{m.issue_description.length > 50 ? m.issue_description.slice(0,50) + '...' : m.issue_description}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusClass(m.status)}`}>{m.status.replace('_',' ')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
