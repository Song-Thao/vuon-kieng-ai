'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { useTheme } from '@/lib/useTheme'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function getYoutubeEmbed(url: string) {
  const yt = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  return yt ? `https://www.youtube.com/embed/${yt[1]}` : null
}
function isFacebookVideo(url: string) {
  return url?.includes('facebook.com') || url?.includes('fb.com') || url?.includes('fb.watch')
}
function ListingModal({ item, onClose }: { item: any, onClose: () => void }) {
  const { getBgStyle } = useTheme()
  const [activeImg, setActiveImg] = useState(0)
  const imgs = [item.hinh_anh, item.hinh_anh_2, item.hinh_anh_3, item.hinh_anh_4, item.hinh_anh_5].filter(Boolean)
  const videos = [item.video_url, item.video_url_2, item.video_url_3].filter(Boolean)

  return (
    <div className="min-h-screen text-white p-4 max-w-2xl mx-auto" style={getBgStyle()}>
      <button onClick={onClose} className="text-gray-400 hover:text-white mb-4 flex items-center gap-2">
        ← Quay lại chợ
      </button>

      {/* Gallery ảnh */}
      {imgs.length > 0 && (
        <div className="mb-4">
          <img src={imgs[activeImg]} className="w-full h-72 object-cover rounded-xl mb-2" />
          {imgs.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {imgs.map((img, i) => (
                <img key={i} src={img} onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 shrink-0 object-cover rounded-lg cursor-pointer transition ${activeImg === i ? 'ring-2 ring-green-400' : 'opacity-60 hover:opacity-100'}`} />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="bg-gray-800 rounded-xl p-4 mb-4">
        <h1 className="text-xl font-bold text-green-300 mb-2">{item.ten_cay}</h1>
        <div className="text-2xl font-bold text-yellow-400 mb-3">{Number(item.gia).toLocaleString('vi-VN')}đ</div>
        {item.vi_tri && <p className="text-gray-400 text-sm mb-3">📍 {item.vi_tri}</p>}
        {item.mo_ta && <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{item.mo_ta}</p>}
      </div>

      {/* Videos */}
      {videos.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm text-gray-400 mb-2">🎥 Video</h3>
          {videos.map((url, i) => {
            const ytEmbed = getYoutubeEmbed(url)
            return ytEmbed ? (
              <div key={i} className="mb-3 rounded-xl overflow-hidden">
                <iframe className="w-full aspect-video" src={ytEmbed} allowFullScreen />
              </div>
            ) : (
              <a key={i} href={url} target="_blank"
                className="block bg-gray-800 hover:bg-gray-700 rounded-xl p-3 mb-2 text-blue-400 text-sm truncate">
                🎥 {url}
              </a>
            )
          })}
        </div>
      )}

      {/* Liên hệ */}
      <div className="flex gap-3">
        {item.zalo && (
          <a href={`https://zalo.me/${item.zalo}`} target="_blank"
            className="flex-1 bg-blue-600 hover:bg-blue-500 rounded-xl p-3 text-center font-semibold">
            💬 Zalo
          </a>
        )}
        {item.sdt && (
          <a href={`tel:${item.sdt}`}
            className="flex-1 bg-green-700 hover:bg-green-600 rounded-xl p-3 text-center font-semibold">
            📞 Gọi ngay
          </a>
        )}
      </div>
    </div>
  )
}

export default function Marketplace() {
  const { getBgStyle } = useTheme()
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any>(null)

  useEffect(() => { fetchListings() }, [])

  const fetchListings = async () => {
    const { data } = await supabase.from('listings').select('*')
      .eq('trang_thai', 'dang_ban').order('created_at', { ascending: false })
    setListings(data || [])
    setLoading(false)
  }

  const filtered = listings.filter(l =>
    l.ten_cay.toLowerCase().includes(search.toLowerCase()) ||
    l.vi_tri?.toLowerCase().includes(search.toLowerCase())
  )

  if (selected) return <ListingModal item={selected} onClose={() => setSelected(null)} />

  return (
    <div className="min-h-screen text-white p-4 max-w-4xl mx-auto" style={getBgStyle()}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-400">🌿 Chợ Cây Kiểng</h1>
        <Link href="/marketplace/dang-ban" className="bg-green-600 hover:bg-green-500 rounded-lg px-4 py-2 text-sm font-semibold">+ Đăng bán</Link>
      </div>

      <input className="w-full bg-gray-800 rounded-lg p-3 mb-6 text-white placeholder-gray-500"
        placeholder="🔍 Tìm cây... (tên cây, địa điểm)"
        value={search} onChange={e => setSearch(e.target.value)} />

      {loading ? (
        <div className="text-center py-20 text-gray-400">Đang tải...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🌱</div>
          <p className="text-gray-400 mb-4">Chưa có cây nào được đăng bán</p>
          <Link href="/marketplace/dang-ban" className="bg-green-600 text-white rounded-xl px-6 py-3 inline-block">Đăng bán ngay</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => {
            const imgs = [item.hinh_anh, item.hinh_anh_2, item.hinh_anh_3, item.hinh_anh_4, item.hinh_anh_5].filter(Boolean)
            const hasVideo = item.video_url || item.video_url_2 || item.video_url_3
            return (
              <div key={item.id} onClick={() => setSelected(item)}
                className="bg-gray-800 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-green-500 transition">
                {imgs.length > 0 ? (
                  <div className="relative">
                    <img src={imgs[0]} className="w-full h-48 object-cover" />
                    {imgs.length > 1 && (
                      <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                        +{imgs.length - 1} ảnh
                      </span>
                    )}
                    {hasVideo && (
                      <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                        🎥 Video
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gray-700 flex items-center justify-center text-4xl">🌿</div>
                )}
                <div className="p-4">
                  <h3 className="font-bold text-green-300 mb-1 line-clamp-1">{item.ten_cay}</h3>
                  <div className="text-yellow-400 font-bold mb-2">{Number(item.gia).toLocaleString('vi-VN')}đ</div>
                  {item.mo_ta && <p className="text-gray-400 text-sm line-clamp-2 mb-2">{item.mo_ta}</p>}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">{item.vi_tri && `📍 ${item.vi_tri}`}</span>
                    <div className="flex gap-2">
                      {item.zalo && <span className="bg-blue-700 text-white text-xs px-2 py-1 rounded">Zalo</span>}
                      {item.sdt && <span className="bg-green-800 text-white text-xs px-2 py-1 rounded">Gọi</span>}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}