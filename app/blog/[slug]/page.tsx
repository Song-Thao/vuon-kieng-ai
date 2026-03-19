'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function DocBai() {
  const params = useParams()
  const slug = params?.slug as string
  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [liked, setLiked] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetchPost()
    fetchUser()
  }, [slug])

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const fetchPost = async () => {
    // Thử tìm theo slug trước, sau đó theo id
    let { data } = await supabase.from('posts').select('*').eq('slug', slug).single()
    if (!data) {
      const res = await supabase.from('posts').select('*').eq('id', slug).single()
      data = res.data
    }
    if (data) {
      setPost(data)
      // Tăng lượt xem
      await supabase.from('posts').update({ luot_xem: (data.luot_xem || 0) + 1 }).eq('id', data.id)
      // Load comments
      const { data: cmts } = await supabase.from('comments').select('*').eq('post_id', data.id).order('created_at', { ascending: true })
      setComments(cmts || [])
    }
    setLoading(false)
  }

  const sendComment = async () => {
    if (!comment.trim()) return
    if (!user) { window.location.href = '/login'; return }
    await supabase.from('comments').insert({
      post_id: post.id,
      user_id: user.id,
      noi_dung: comment
    })
    setComment('')
    fetchPost()
  }

  const toggleLike = async () => {
    if (!user) { window.location.href = '/login'; return }
    if (liked) {
      await supabase.from('likes').delete().eq('post_id', post.id).eq('user_id', user.id)
      await supabase.from('posts').update({ luot_like: Math.max(0, post.luot_like - 1) }).eq('id', post.id)
    } else {
      await supabase.from('likes').insert({ post_id: post.id, user_id: user.id })
      await supabase.from('posts').update({ luot_like: (post.luot_like || 0) + 1 }).eq('id', post.id)
    }
    setLiked(!liked)
    fetchPost()
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Đang tải...</div>
  if (!post) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">😕</div>
        <p className="text-gray-500 mb-4">Không tìm thấy bài viết</p>
        <Link href="/blog" className="bg-green-700 text-white rounded-xl px-6 py-3">← Về Blog</Link>
      </div>
    </div>
  )

  // Render nội dung markdown đơn giản
  const renderContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <h3 key={i} className="text-lg font-bold text-green-800 mt-6 mb-2">{line.replace(/\*\*/g, '')}</h3>
      }
      if (line.startsWith('- ')) {
        return <li key={i} className="ml-4 text-gray-700 mb-1">• {line.slice(2)}</li>
      }
      // YouTube embed
      const ytMatch = line.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
      if (ytMatch) {
        return <div key={i} className="my-4 rounded-xl overflow-hidden">
          <iframe width="100%" height="380" src={`https://www.youtube.com/embed/${ytMatch[1]}`} allowFullScreen className="rounded-xl" />
        </div>
      }
      // Facebook video embed
      const fbMatch = line.match(/facebook\.com\/.*\/videos\/([0-9]+)/)
      if (fbMatch) {
        return <div key={i} className="my-4 rounded-xl overflow-hidden">
          <iframe width="100%" height="380" src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(line.trim())}&show_text=0`} allowFullScreen className="rounded-xl" />
        </div>
      }
      // Image
      if (line.match(/\.(jpg|jpeg|png|gif|webp)/i)) {
        return <img key={i} src={line.trim()} alt="" className="w-full rounded-xl my-4 object-cover" style={{maxHeight:'400px'}} />
      }
      if (line.trim() === '') return <br key={i} />
      return <p key={i} className="text-gray-700 mb-3 leading-relaxed">{line}</p>
    })
  }

  return (
    <div className="min-h-screen">
      {/* Header ảnh */}
      {post.hinh_dai_dien && (
        <div className="w-full h-64 overflow-hidden">
          <img src={post.hinh_dai_dien} alt={post.tieu_de} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/blog" className="text-green-700 hover:underline text-sm">← Về Blog</Link>

        <div className="bg-white rounded-2xl p-8 shadow-sm mt-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">{post.the_loai}</span>
            {post.ai_viet && <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">🤖 AI hỗ trợ</span>}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.tieu_de}</h1>

          {post.tom_tat && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r-xl">
              <p className="text-green-800 italic">{post.tom_tat}</p>
            </div>
          )}

          <div className="prose max-w-none">
            {renderContent(post.noi_dung || '')}
          </div>

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-6 pt-6 border-t">
              {post.tags.map((tag: string, i: number) => (
                <span key={i} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">#{tag}</span>
              ))}
            </div>
          )}

          {/* Like & Share */}
          <div className="flex items-center gap-4 mt-6 pt-6 border-t">
            <button onClick={toggleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${liked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-red-50'}`}>
              ❤️ {post.luot_like || 0} Thích
            </button>
            <span className="text-gray-400 text-sm">👁️ {post.luot_xem || 0} lượt xem</span>
          </div>
        </div>

        {/* Bình luận */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mt-4">
          <h3 className="font-bold text-gray-800 mb-4">💬 Bình luận ({comments.length})</h3>

          {comments.map((c, i) => (
            <div key={i} className="border-b pb-3 mb-3">
              <div className="text-xs text-gray-400 mb-1">{new Date(c.created_at).toLocaleDateString('vi-VN')}</div>
              <p className="text-gray-700">{c.noi_dung}</p>
            </div>
          ))}

          <div className="mt-4">
            <textarea
              className="w-full border rounded-xl p-3 h-20 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder={user ? "Chia sẻ kinh nghiệm của bạn..." : "Đăng nhập để bình luận"}
              value={comment}
              onChange={e => setComment(e.target.value)}
              disabled={!user}
            />
            {user ? (
              <button onClick={sendComment} className="mt-2 bg-green-700 hover:bg-green-600 text-white rounded-xl px-6 py-2">
                Gửi bình luận
              </button>
            ) : (
              <Link href="/login" className="mt-2 inline-block bg-green-700 text-white rounded-xl px-6 py-2">
                Đăng nhập để bình luận
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}