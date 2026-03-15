'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Marketplace() {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { fetchListings() }, [])

  const fetchListings = async () => {
    const { data } = await supabase
      .from('listings')
      .select('*')
      .eq('trang_thai', 'dang_ban')
      .order('created_at', { ascending: false })
    setListings(data || [])
    setLoading(false)
  }

  const filtered = listings.filter(l =>
    l.ten_cay.toLowerCase().includes(search.toLowerCase()) ||
    l.vi_tri?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-400">🌿 Chợ Cây Kiểng</h1>
        <a href="/marketplace/dang-ban" className="bg-green-600 hover:bg-green-500 rounded-lg px-4 py-2 text-sm font-semibold">+ Đăng bán</a>
      </div>

      <input className="w-full bg-gray-800 rounded-lg p-3 mb-6 text-white placeholder-gray-500"
        placeholder="🔍 Tìm cây... (tên cây, địa điểm)"
        value={search} onChange={e => setSearch(e.target.value)} />

      {loading ? (
        <div className="text-center text-gray-400 py-20">Đang tải...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-400 py-20">
          <div className="text-5xl mb-4">🌱</div>
          <div>Chưa có cây nào được đăng bán</div>
          <a href="/marketplace/dang-ban" className="text-green-400 underline mt-2 block">Đăng bán ngay</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="bg-gray-800 rounded-xl overflow-hidden hover:ring-1 hover:ring-green-500 transition">
              {item.hinh_anh && <img src={item.hinh_anh} alt={item.ten_cay} className="w-full h-48 object-cover" />}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-green-300">{item.ten_cay}</h3>
                  <span className="text-yellow-400 font-bold">{Number(item.gia).toLocaleString('vi-VN')}đ</span>
                </div>
                {item.mo_ta && <p className="text-gray-400 text-sm mb-3 line-clamp-2">{item.mo_ta}</p>}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{item.vi_tri && `📍 ${item.vi_tri}`}</span>
                  <div className="flex gap-2">
                    {item.zalo && <a href={`https://zalo.me/${item.zalo}`} target="_blank" className="bg-blue-600 hover:bg-blue-500 rounded px-3 py-1 text-xs">Zalo</a>}
                    {item.sdt && <a href={`tel:${item.sdt}`} className="bg-green-700 hover:bg-green-600 rounded px-3 py-1 text-xs">Gọi</a>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}