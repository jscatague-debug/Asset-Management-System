import { useEffect, useState } from 'react'
import api from '../api/axios'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const statusClass = (s) => ({
  available: 'bg-green-100 text-green-700',
  assigned: 'bg-yellow-100 text-yellow-700',
  maintenance: 'bg-red-100 text-red-700',
  pending: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
}[s] || 'bg-gray-100 text-gray-600')

const timeAgo = (date) => {
  const s = Math.max(0, (Date.now() - new Date(date)) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`
  return new Date(date).toLocaleDateString()
}

const greeting = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

const Card = ({ className = '', children }) => (
  <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`}>{children}</div>
)

const StatTile = ({ label, value, icon, tint, href, hint }) => (
  <Link to={href} className="group">
    <Card className="p-5 h-full flex items-center gap-4 transition group-hover:border-blue-300 group-hover:shadow-md">
      <div className={`h-12 w-12 shrink-0 rounded-xl flex items-center justify-center text-2xl ${tint}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-800 tabular-nums">{value}</p>
        {hint && <p className="text-xs text-slate-400 truncate">{hint}</p>}
      </div>
    </Card>
  </Link>
)

const Panel = ({ title, href, badge, children }) => (
  <Card className="p-5 sm:p-6 flex flex-col">
    <div className="flex items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-2 min-w-0">
        <h3 className="font-semibold text-slate-800 truncate">{title}</h3>
        {badge}
      </div>
      <Link to={href} className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all →</Link>
    </div>
    {children}
  </Card>
)

const Empty = ({ text }) => <p className="text-slate-400 text-sm py-6 text-center">{text}</p>

const Row = ({ title, sub, right }) => (
  <div className="flex items-center justify-between gap-3 py-3 border-b border-slate-100 last:border-0">
    <div className="min-w-0">
      <p className="font-medium text-sm text-slate-800 truncate">{title}</p>
      <p className="text-xs text-slate-400 truncate">{sub}</p>
    </div>
    <div className="shrink-0">{right}</div>
  </div>
)

// Status breakdown of all assets as one stacked bar, labelled so color is never the only cue
const SEGMENTS = [
  { key: 'available_assets', label: 'Available', bar: 'bg-green-500', dot: 'bg-green-500' },
  { key: 'assigned_assets', label: 'Assigned', bar: 'bg-amber-400', dot: 'bg-amber-400' },
  { key: 'maintenance_assets', label: 'In Maintenance', bar: 'bg-red-500', dot: 'bg-red-500' },
]

function AssetOverview({ stats }) {
  const total = stats.total_assets
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0)

  return (
    <Card className="p-5 sm:p-6 lg:col-span-2 flex flex-col">
      <div className="flex items-start justify-between gap-4 mb-auto">
        <div>
          <p className="text-sm text-slate-500">Total Assets</p>
          <p className="text-4xl font-bold text-slate-800 tabular-nums mt-1">{total}</p>
        </div>
        <Link to="/assets" className="text-sm text-blue-600 hover:text-blue-700 font-medium">Manage →</Link>
      </div>

      <div className="mt-6 h-3 w-full rounded-full bg-slate-100 flex gap-[2px] overflow-hidden" role="img"
        aria-label={SEGMENTS.map(s => `${s.label}: ${stats[s.key]}`).join(', ')}>
        {SEGMENTS.filter(s => stats[s.key] > 0).map(s => (
          <div key={s.key} title={`${s.label}: ${stats[s.key]} (${pct(stats[s.key])}%)`}
            className={`${s.bar} h-full first:rounded-l-full last:rounded-r-full hover:opacity-80 transition-opacity`}
            style={{ width: `${(stats[s.key] / total) * 100}%` }} />
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {SEGMENTS.map(s => (
          <Link key={s.key} to="/assets" className="rounded-xl bg-slate-50 hover:bg-slate-100 transition px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />{s.label}
            </div>
            <p className="mt-1 text-xl font-semibold text-slate-800 tabular-nums">
              {stats[s.key]} <span className="text-sm font-normal text-slate-400">· {pct(stats[s.key])}%</span>
            </p>
          </Link>
        ))}
      </div>
    </Card>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => setStats(res.data.data))
      .catch(err => setError(err.response?.data?.message || 'Could not load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-slate-200 rounded-lg" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="h-56 bg-slate-200 rounded-2xl lg:col-span-2" />
        <div className="h-56 bg-slate-200 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[0, 1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-200 rounded-2xl" />)}
      </div>
    </div>
  )

  if (error) return (
    <Card className="p-8 text-center max-w-md mx-auto mt-10">
      <p className="text-4xl mb-3">⚠️</p>
      <p className="font-semibold text-slate-800">{error}</p>
      <button onClick={() => window.location.reload()}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">Try again</button>
    </Card>
  )

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">{greeting()}, {user?.name?.split(' ')[0]}</h2>
        <p className="text-sm text-slate-500 mt-1">
          {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <AssetOverview stats={stats} />
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-5">
          <StatTile label="Total Outlets" value={stats.total_personnel} icon="👥" tint="bg-purple-50" href="/personnel" />
          <StatTile label="Pending Maintenance" value={stats.pending_maintenance} icon="🔧" tint="bg-orange-50" href="/maintenance" />
          <StatTile label="Archived Items" value={stats.archived_items} icon="🗄️" tint="bg-slate-100" href="/archive"
            hint={stats.archived_items ? 'Restorable deletions' : 'Nothing deleted'} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Panel title="Recent Assignments" href="/assignments"
          badge={<span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium whitespace-nowrap">{stats.active_assignments} active</span>}>
          {stats.recent_assignments.length === 0 ? <Empty text="No assignments yet" /> : stats.recent_assignments.map(a => (
            <Row key={a.id} title={`${a.asset_name} → ${a.personnel_name}`}
              sub={`${a.asset_tag} · ${a.returned_at ? `returned ${timeAgo(a.returned_at)}` : `assigned ${timeAgo(a.assigned_at)}`}`}
              right={a.returned_at
                ? <span className="text-xs px-2 py-1 rounded-full font-medium bg-slate-100 text-slate-500">returned</span>
                : <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-700">active</span>} />
          ))}
        </Panel>

        <Panel title="Recent Assets" href="/assets">
          {stats.recent_assets.length === 0 ? <Empty text="No assets yet" /> : stats.recent_assets.map(a => (
            <Row key={a.id} title={a.name} sub={`${a.asset_tag} · ${a.type}`}
              right={<span className={`text-xs px-2 py-1 rounded-full font-medium ${statusClass(a.status)}`}>{a.status}</span>} />
          ))}
        </Panel>

        <Panel title="Recent Maintenance" href="/maintenance">
          {stats.recent_maintenance.length === 0 ? <Empty text="No maintenance logs yet" /> : stats.recent_maintenance.map(m => (
            <Row key={m.id} title={m.asset_name} sub={m.issue_description}
              right={<span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${statusClass(m.status)}`}>{m.status.replace('_', ' ')}</span>} />
          ))}
        </Panel>

        <Panel title="Archive Log" href="/archive">
          {stats.recent_archive.length === 0 ? <Empty text="No deleted items" /> : stats.recent_archive.map(e => (
            <Row key={e.id} title={e.label}
              sub={`${e.entity_type === 'asset' ? 'Asset' : 'Outlet'} · deleted by ${e.deleted_by_name || 'unknown'}`}
              right={<span className="text-xs text-slate-400 whitespace-nowrap">{timeAgo(e.deleted_at)}</span>} />
          ))}
        </Panel>
      </div>
    </div>
  )
}
