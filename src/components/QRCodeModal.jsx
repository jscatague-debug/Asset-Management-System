import { QRCodeSVG } from 'qrcode.react'

export default function QRCodeModal({ asset, onClose }) {
  const qrUrl = `${window.location.origin}/scan/${asset.qr_token}`

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
        <h3 className="text-xl font-bold mb-1">{asset.name}</h3>
        <p className="text-gray-400 text-sm mb-5">Tag: {asset.asset_tag}</p>
        <div className="flex justify-center mb-5">
          <QRCodeSVG value={qrUrl} size={200} level="H" />
        </div>
        <p className="text-xs text-gray-400 break-all mb-6">{qrUrl}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => window.print()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-sm">
            Print
          </button>
          <button onClick={onClose}
            className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
