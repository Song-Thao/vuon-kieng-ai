'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function PhaiDinhHuong() {
  const [image, setImage] = useState<string>('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [info, setInfo] = useState({
    ten_cay: '', chieu_cao: '', hoanh_goc: '', tuoi_cay: '', mo_ta: ''
  })

  const handleImage = (e: any) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const max = 800
        let w = img.width, h = img.height
        if (w > max) { h = h * max / w; w = max }
        if (h > max) { w = w * max / h; h = max }
        canvas.width = w; canvas.height = h
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
        setImage(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.src = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const analyze = async () => {
    if (!image) return alert('Vui lòng upload ảnh cây phôi!')
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/phai-dinh-huong', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, info })
      })
      const data = await res.json()
      setResult(data)
    } catch {
      alert('Lỗi kết nối, thử lại!')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-gray-400 hover:text-white">← Dashboard</Link>
        <div>
          <h1 className="text-2xl font-bold text-green-400">✂️ AI Master Designer</h1>
          <p className="text-gray-400 text-sm">Nghệ nhân ảo — Định hướng dáng thế cây phôi</p>
        </div>
      </div>

      {/* Form nhập thông tin */}
      <div className="bg-gray-800 rounded-xl p-4 mb-4 space-y-3">
        <h2 className="text-green-300 font-semibold">📋 Thông tin cây phôi</h2>
        {[
          { key: 'ten_cay', label: 'Tên cây', ph: 'VD: Sanh, Sung, Mai vàng, Tùng la hán...' },
          { key: 'chieu_cao', label: 'Chiều cao ước tính', ph: 'VD: 60cm, 1.2m' },
          { key: 'hoanh_goc', label: 'Hoành gốc', ph: 'VD: 8cm, 12cm' },
          { key: 'tuoi_cay', label: 'Tuổi cây / nguồn gốc', ph: 'VD: 5 năm tuổi, đào từ rừng, mua phôi vườn' },
        ].map(f => (
          <div key={f.key}>
            <label className="text-sm text-gray-400">{f.label}</label>
            <input className="w-full bg-gray-700 rounded p-2 mt-1 text-white placeholder-gray-500"
              placeholder={f.ph} value={(info as any)[f.key]}
              onChange={e => setInfo({ ...info, [f.key]: e.target.value })} />
          </div>
        ))}
        <div>
          <label className="text-sm text-gray-400">Mô tả thêm (đặc điểm thân, cành, vị trí đặt cây...)</label>
          <textarea className="w-full bg-gray-700 rounded p-2 mt-1 h-20 text-white placeholder-gray-500"
            placeholder="VD: Thân có độ đổ tự nhiên, gốc xoè đẹp, có 3 cành chính, đang đặt ngoài trời..."
            value={info.mo_ta} onChange={e => setInfo({ ...info, mo_ta: e.target.value })} />
        </div>
      </div>

      {/* Upload ảnh */}
      <div className="bg-gray-800 rounded-xl p-4 mb-4">
        <h2 className="text-green-300 font-semibold mb-3">📸 Ảnh cây phôi (chụp rõ toàn thân + gốc)</h2>
        {image && (
          <div className="relative mb-3">
            <img src={image} className="w-full rounded-xl max-h-80 object-contain bg-gray-700" />
            <div className="absolute top-2 left-2 bg-green-700 text-white text-xs px-2 py-1 rounded">Ảnh phôi gốc</div>
          </div>
        )}
        <input type="file" accept="image/*" onChange={handleImage} className="w-full text-gray-300" />
      </div>

      <button onClick={analyze} disabled={!image || loading}
        className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-600 rounded-xl p-4 font-bold text-lg mb-6 transition-colors">
        {loading ? '🎨 Nghệ nhân AI đang phân tích...' : '✂️ Định hướng dáng thế với AI'}
      </button>

      {/* Kết quả */}
      {result && (
        <div className="space-y-4">
          <h2 className="text-green-400 font-bold text-2xl">🎋 Kết quả định hướng</h2>

          {/* Nhận định chung */}
          {result.nhan_dinh_chung && (
            <div className="bg-gray-800 rounded-xl p-4 border-l-4 border-green-500">
              <div className="text-xs text-gray-400 mb-2">NHẬN ĐỊNH TỔNG QUAN</div>
              <p className="text-gray-200 leading-relaxed">{result.nhan_dinh_chung}</p>
              {result.dac_diem_than && <p className="text-green-300 text-sm mt-2">🌿 {result.dac_diem_than}</p>}
            </div>
          )}

          {/* Điểm mạnh nổi bật */}
          {result.diem_manh_noi_bat && (
            <div className="bg-yellow-900/30 border border-yellow-600/30 rounded-xl p-4">
              <div className="text-yellow-400 font-semibold mb-1">⭐ Điểm độc đáo cần giữ lại</div>
              <p className="text-gray-200 text-sm">{result.diem_manh_noi_bat}</p>
            </div>
          )}

          {/* Dáng thế gợi ý */}
          {result.dang_the_goi_y?.length > 0 && (
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-3">DÁNG THẾ PHÙ HỢP ({result.dang_the_goi_y.length} phương án)</div>
              <div className="space-y-3">
                {result.dang_the_goi_y.map((the: any, i: number) => (
                  <div key={i} className={`rounded-lg p-3 border ${i === 0 ? 'border-green-500 bg-green-900/20' : 'border-gray-600 bg-gray-700/50'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-green-300">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} {the.ten_the}</span>
                      <span className="text-yellow-400 text-sm font-semibold">{the.do_phu_hop}</span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{the.mo_ta}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-green-900/30 rounded p-2">
                        <span className="text-green-400">✅ Ưu điểm: </span>
                        <span className="text-gray-300">{the.uu_diem}</span>
                      </div>
                      <div className="bg-red-900/30 rounded p-2">
                        <span className="text-red-400">⚠️ Thách thức: </span>
                        <span className="text-gray-300">{the.kho_khan}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Kế hoạch uốn cành */}
          {result.ke_hoach_uon_canh?.length > 0 && (
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-3">KẾ HOẠCH UỐN CÀNH TỪNG BƯỚC</div>
              {result.ke_hoach_uon_canh.map((step: any, i: number) => (
                <div key={i} className="flex gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center text-sm font-bold shrink-0">{i + 1}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-green-300 text-sm">{step.giai_doan}</div>
                    <div className="text-gray-300 text-sm">{step.viec_can_lam}</div>
                    {step.ky_thuat && <div className="text-blue-300 text-xs mt-1">🔧 {step.ky_thuat}</div>}
                    {step.luu_y && <div className="text-yellow-300 text-xs mt-1">⚠️ {step.luu_y}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Điểm cắt chiến lược */}
          {result.diem_cat_chien_luoc?.length > 0 && (
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-3">✂️ ĐIỂM CẮT CHIẾN LƯỢC</div>
              {result.diem_cat_chien_luoc.map((d: string, i: number) => (
                <div key={i} className="flex gap-2 mb-2 text-sm">
                  <span className="text-red-400 shrink-0">✂️</span>
                  <span className="text-gray-300">{d}</span>
                </div>
              ))}
            </div>
          )}

          {/* Vật tư */}
          {result.vat_tu_can_chuan_bi?.length > 0 && (
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-3">🛠️ VẬT TƯ CẦN CHUẨN BỊ</div>
              <div className="space-y-2">
                {result.vat_tu_can_chuan_bi.map((vt: any, i: number) => (
                  <div key={i} className="flex gap-3 items-start bg-gray-700 rounded-lg p-3">
                    <div className="text-xl shrink-0">🔧</div>
                    <div className="flex-1">
                      <div className="font-semibold text-white text-sm">{vt.ten}</div>
                      <div className="text-gray-400 text-xs">{vt.quy_cach} · {vt.so_luong}</div>
                      <div className="text-blue-300 text-xs">{vt.muc_dich}</div>
                    </div>
                    <a href={`https://shopee.vn/search?keyword=${encodeURIComponent(vt.ten + ' bonsai')}`}
                      target="_blank" className="bg-orange-600 hover:bg-orange-500 text-white text-xs px-2 py-1 rounded shrink-0">
                      Shopee
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lộ trình thời gian */}
          {result.lo_trinh_thoi_gian && (
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-3">📅 LỘ TRÌNH THỜI GIAN</div>
              <div className="space-y-2">
                {Object.entries(result.lo_trinh_thoi_gian).map(([key, val]: any) => (
                  <div key={key} className="flex gap-3 text-sm">
                    <span className="text-green-400 shrink-0">▶</span>
                    <span className="text-gray-300">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dự báo giá trị */}
          {result.du_bao_gia_tri && (
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-3">💰 DỰ BÁO GIÁ TRỊ</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Hiện tại', value: result.du_bao_gia_tri.gia_tri_hien_tai, color: 'text-gray-300' },
                  { label: 'Sau 1 năm', value: result.du_bao_gia_tri.gia_tri_sau_1_nam, color: 'text-blue-300' },
                  { label: 'Hoàn thiện', value: result.du_bao_gia_tri.gia_tri_hoan_thien, color: 'text-green-300' },
                  { label: 'Hệ số tăng', value: result.du_bao_gia_tri.he_so_tang, color: 'text-yellow-400' },
                ].map(item => (
                  <div key={item.label} className="bg-gray-700 rounded-lg p-3">
                    <div className="text-xs text-gray-400">{item.label}</div>
                    <div className={`font-bold text-lg ${item.color}`}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cảnh báo */}
          {result.canh_bao && (
            <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-4">
              <div className="text-red-400 font-semibold mb-1">⚠️ Tuyệt đối không nên làm</div>
              <p className="text-gray-200 text-sm">{result.canh_bao}</p>
            </div>
          )}

          {/* Lưu vào hộ chiếu */}
          <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4 text-center">
            <p className="text-green-300 text-sm mb-3">💡 Lưu kết quả định hướng này vào Hộ chiếu cây để theo dõi lộ trình!</p>
            <Link href="/passport" className="bg-green-600 hover:bg-green-500 text-white rounded-xl px-6 py-2 inline-block text-sm font-semibold">
              📋 Tạo Hộ chiếu cho cây này
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}