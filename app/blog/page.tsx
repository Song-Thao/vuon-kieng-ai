'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { useTheme } from '@/lib/useTheme'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const CATEGORIES = [
  { value: '', label: 'Tất cả' },
  { value: 'cham-soc', label: '🌱 Chăm sóc' },
  { value: 'benh-cay', label: '🔬 Bệnh cây' },
  { value: 'bonsai', label: '🎋 Bonsai' },
  { value: 'cay-kieng', label: '🌿 Cây kiểng' },
  { value: 'thi-truong', label: '💰 Thị trường' },
  { value: 'phan-bon', label: '🧪 Phân bón' },
  { value: 'dung-cu', label: '🔧 Dụng cụ' },
  { value: 'kinh-nghiem', label: '📖 Kinh nghiệm' },
]

export default function Blog() {
  const { getBgStyle } = useTheme()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => { fetchPosts() }, [category])

  const fetchPosts = async () => {
    let query = supabase.from('posts').select('*').eq('trang_thai', 'da_duyet').order('created_at', { ascending: false })
    if (category) query = query.eq('the_loai', category)
    const { data } = await query
    setPosts(data || [])
    setLoading(false)
  }

  const filtered = posts.filter(p =>
    p.tieu_de.toLowerCase().includes(search.toLowerCase()) ||
    p.tom_tat?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen" style={getBgStyle()}>
      {/* Header */}
      <div className="bg-green-900/80 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">📚 Wiki Cây Cảnh Việt Nam</h1>
          <p className="text-green-200 mb-6">Kiến thức từ cộng đồng — Bonsai, chăm sóc, bệnh cây, thị trường</p>
          <input
            className="w-full max-w-xl bg-white/10 border border-white/20 rounded-xl p-3 text-white placeholder-green-200"
            placeholder="🔍 Tìm bài viết..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Categories */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map(c => (
            <button key={c.value} onClick={() => setCategory(c.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${category === c.value ? 'bg-green-700 text-white' : 'bg-white text-gray-600 hover:bg-green-50 border'}`}>
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center mb-6">
          <span className="text-gray-500 text-sm">{filtered.length} bài viết</span>
          <Link href="/blog/viet-bai" className="bg-green-700 hover:bg-green-600 text-white rounded-xl px-4 py-2 text-sm font-semibold">
            ✍️ Viết bài
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📝</div>
            <p className="text-gray-500 mb-4">Chưa có bài viết nào</p>
            <Link href="/blog/viet-bai" className="bg-green-700 text-white rounded-xl px-6 py-3 inline-block">
              Viết bài đầu tiên
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(post => (
              <Link key={post.id} href={`/blog/${post.slug || post.id}`}
                className="rounded-xl overflow-hidden transition" style="background:rgba(14,45,26,0.88);border:1px solid rgba(255,255,255,0.12)">
                {post.hinh_dai_dien ? (
                  <img src={post.hinh_dai_dien} alt={post.tieu_de} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center text-5xl" style={{background:"rgba(14,45,26,0.6)"}}>🌿</div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-1 rounded-full" style={{background:"rgba(200,168,75,0.2)",color:"#c8a84b"}}>
                      {CATEGORIES.find(c => c.value === post.the_loai)?.label || post.the_loai}
                    </span>
                    {post.ai_viet && <span className="text-xs px-2 py-1 rounded-full" style={{background:"rgba(59,130,246,0.2)",color:"#93c5fd"}}>🤖 AI</span>}
                  </div>
                  <h3 className="font-bold mb-2 line-clamp-2" style={{color:"#fff"}}>{post.tieu_de}</h3>
                  {post.tom_tat && <p className="text-sm line-clamp-3" style={{color:"rgba(255,255,255,0.6)"}}>{post.tom_tat}</p>}
                  <div className="flex justify-between items-center mt-3 text-xs" style={{color:"rgba(255,255,255,0.45)"}}>
                    <span>👁️ {post.luot_xem} lượt xem</span>
                    <span>❤️ {post.luot_like} thích</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}