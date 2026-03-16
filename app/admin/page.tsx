'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Email admin - thelittlebrick00@gmail.com
const ADMIN_EMAIL = 'your@email.com'

export default function Admin() {
  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [listings, setListings] = useState<any[]>([])
  const [tab, setTab] = useState<'posts'|'listings'>('posts')
  const [loading, setLoading] = useState(true)

  useEffect(() => { checkAdmin() }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== ADMIN_EMAIL) {
      window.location.href = '/dashboard'
      return
    }
    setUser(user)
    fetchData()
  }

  const fetchData = async () => {
    const { data: p } = await supabase.from('posts').select('*').order('created_at', { ascending: false })
    const { data: l } = await supabase.from('listings').select('*').order('created_at', { ascending: false })
    setPosts(p || [])
    setListings(l || [])
    setLoading(false)
  }

  const duyetBai = async (id: string) => {
    await supabase.from('posts').update({ trang_thai: 'da_duyet' }).eq('id', id)
    fetchData()
  }

  const tuChoiBai = async (id: string) => {
    await supabase.from('posts').update({ trang_thai: 'tu_choi' }).eq('id', id)
    fetchData()
  }

  const xoaBai = async (id: string) => {
    if (!confirm('Xóa bài này?')) return
    await supabase.from('posts').delete().eq('id', id)
    fetchData()
  }

  const xoaListing = async (id: string) => {
    if (!confirm('Xóa tin đăng này?')) return
    await supabase.from('listings').delete().eq('id', id)
    fetchData()
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>

  const choDuyet = posts.filter(p => p.trang_thai === 'cho_duyet')
  const daDuyet = posts.filter(p => p.trang_thai === 'da_duyet')

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-green-800">⚙️ Admin Panel</h1>
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 text-sm">← Dashboard</Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Chờ duyệt', value: choDuyet.length, color: 'bg-yellow-50 text-yellow-700' },
            { label: 'Đã duyệt', value: daDuyet.length, color: 'bg-green-50 text-green-700' },
            { label: 'Tin đăng bán', value: listings.length, color: 'bg-blue-50 text-blue-700' },
            { label: 'Tổng bài', value: posts.length, color: 'bg-purple-50 text-purple-700' },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-xl p-4 text-center`}>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-sm">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button onClick={() => setTab('posts')}
            className={`px-4 py-2 rounded-xl font-medium ${tab === 'posts' ? 'bg-green-700 text-white' : 'bg-white text-gray-600'}`}>
            📝 Bài viết {choDuyet.length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full ml-1">{choDuyet.length}</span>}
          </button>
          <button onClick={() => setTab('listings')}
            className={`px-4 py-2 rounded-xl font-medium ${tab === 'listings' ? 'bg-green-700 text-white' : 'bg-white text-gray-600'}`}>
            🌿 Tin đăng bán
          </button>
        </div>

        {tab === 'posts' && (
          <div className="space-y-3">
            {posts.map(post => (
              <div key={post.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        post.trang_thai === 'da_duyet' ? 'bg-green-100 text-green-700' :
                        post.trang_thai === 'cho_duyet' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {post.trang_thai === 'da_duyet' ? '✅ Đã duyệt' :
                         post.trang_thai === 'cho_duyet' ? '⏳ Chờ duyệt' : '❌ Từ chối'}
                      </span>
                      <span className="text-xs text-gray-400">{post.the_loai}</span>
                      {post.ai_viet && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">🤖 AI</span>}
                    </div>
                    <h3 className="font-semibold text-gray-800">{post.tieu_de}</h3>
                    {post.tom_tat && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{post.tom_tat}</p>}
                    <p className="text-xs text-gray-400 mt-1">{new Date(post.created_at).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link href={`/blog/${post.slug || post.id}`} target="_blank"
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg">
                      👁️ Xem
                    </Link>
                    {post.trang_thai === 'cho_duyet' && (
                      <>
                        <button onClick={() => duyetBai(post.id)}
                          className="text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg">
                          ✅ Duyệt
                        </button>
                        <button onClick={() => tuChoiBai(post.id)}
                          className="text-xs bg-yellow-500 hover:bg-yellow-400 text-white px-3 py-1.5 rounded-lg">
                          ❌ Từ chối
                        </button>
                      </>
                    )}
                    <button onClick={() => xoaBai(post.id)}
                      className="text-xs bg-red-500 hover:bg-red-400 text-white px-3 py-1.5 rounded-lg">
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'listings' && (
          <div className="space-y-3">
            {listings.map(item => (
              <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center">
                <div className="flex gap-3 items-center">
                  {item.hinh_anh && <img src={item.hinh_anh} className="w-16 h-16 rounded-lg object-cover" />}
                  <div>
                    <h3 className="font-semibold text-gray-800">{item.ten_cay}</h3>
                    <p className="text-green-700 font-medium">{Number(item.gia).toLocaleString('vi-VN')}đ</p>
                    <p className="text-xs text-gray-400">📍 {item.vi_tri} · {new Date(item.created_at).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
                <button onClick={() => xoaListing(item.id)}
                  className="text-xs bg-red-500 hover:bg-red-400 text-white px-3 py-1.5 rounded-lg">
                  🗑️ Xóa
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}