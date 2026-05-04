import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/axios'

const STATUS_CLS = { available: 'bg-green-100 text-green-700', assigned: 'bg-yellow-100 text-yellow-700', maintenance: 'bg-red-100 text-red-700' }

function Row({ label, value }) {
  return (
    <div className="flex justify-between py-3 border-b last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-800 text-right max-w-[60%]">{value}</span>
    </div>
  )
}

export default function Scan() {
  const { qr_token } = useParams()
  const [asset, setAsset] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    api.get(`/scan/${qr_token}`)
      .then(res => setAsset(res.data.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [qr_token])

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-10 text-center shadow-lg max-w-sm w-full">
        <div className="text-5xl mb-4">❌</div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">Asset Not Found</h2>
        <p className="text-gray-400 text-sm">This QR code is not linked to any asset.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">💻</div>
          <h1 className="text-2xl font-bold text-blue-900">{asset.name}</h1>
          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${STATUS_CLS[asset.status]}`}>
            {asset.status.toUpperCase()}
          </span>
        </div>
        <div>
          <Row label="Asset Tag" value={asset.asset_tag} />
          <Row label="Type" value={asset.type} />
          {asset.brand && <Row label="Brand" value={asset.brand} />}
          {asset.model && <Row label="Model" value={asset.model} />}
          {asset.serial_number && <Row label="Serial Number" value={asset.serial_number} />}
          {asset.purchase_date && <Row label="Release Date" value={new Date(asset.purchase_date).toLocaleDateString()} />}
          {asset.assigned_to && <Row label="Assigned To" value={asset.assigned_to} />}
          {asset.assigned_department && <Row label="Department" value={asset.assigned_department} />}
          {asset.notes && <Row label="Notes" value={asset.notes} />}
        </div>
        <p className="text-center text-xs text-gray-300 mt-6">IT Asset Management System</p>
      </div>
    </div>
  )
}
