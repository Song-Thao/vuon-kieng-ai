'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { useTheme } from '@/lib/useTheme'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)


function useListingFeatures(listingId, currentUser) {
  const [likes, setLikes] = useState(0)
  const [liked, setLiked] = useState(false)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [commenting, setCommenting] = useState(false)
  const [showOrder, setShowOrder] = useState(false)
  const [orderForm, setOrderForm] = useState({ ten: '', sdt: '', dia_chi: '', phuong_thuc: 'cod', dat_coc: '0' })
  const [bankInfo, setBankInfo] = useState<any>({})

  useEffect(() => {
    supabase.from('admin_settings').select('*').in('key', ['bank_name','bank_account','bank_holder','bank_bin'])
      .then(({ data }) => {
        const obj: any = {}
        data?.forEach(r => { obj[r.key] = r.value })
        setBankInfo(obj)
      })
  }, [])
  const [ordering, setOrdering] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!listingId) return
    supabase.from('listing_likes').select('*', { count: 'exact' }).eq('listing_id', listingId)
      .then(({ data, count }) => {
        setLikes(count || 0)
        if (currentUser) setLiked(data?.some(l => l.user_id === currentUser.id) || false)
      })
    supabase.from('listing_comments').select('*').eq('listing_id', listingId).order('created_at', { ascending: true })
      .then(({ data }) => setComments(data || []))
    const channel = supabase.channel('listing-' + listingId)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'listing_comments', filter: 'listing_id=eq.' + listingId },
        (payload) => setComments(prev => [...prev, payload.new]))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'listing_likes', filter: 'listing_id=eq.' + listingId },
        () => setLikes(prev => prev + 1))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'listing_likes', filter: 'listing_id=eq.' + listingId },
        () => setLikes(prev => Math.max(0, prev - 1)))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [listingId, currentUser?.id])

  const toggleLike = async () => {
    if (!currentUser) { alert('Vui lòng đăng nhập để thích!'); return }
    if (liked) {
      await supabase.from('listing_likes').delete().eq('listing_id', listingId).eq('user_id', currentUser.id)
      setLiked(false)
    } else {
      await supabase.from('listing_likes').insert({ listing_id: listingId, user_id: currentUser.id })
      setLiked(true)
    }
  }

  const submitComment = async () => {
    if (!currentUser) { alert('Vui lòng đăng nhập để bình luận!'); return }
    if (!newComment.trim()) return
    setCommenting(true)
    const userName = currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'Ẩn danh'
    await supabase.from('listing_comments').insert({ listing_id: listingId, user_id: currentUser.id, user_name: userName, noi_dung: newComment.trim() })
    setNewComment('')
    setCommenting(false)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.origin + '/marketplace?id=' + listingId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const submitOrder = async (item) => {
    if (!orderForm.ten || !orderForm.sdt || !orderForm.dia_chi) { alert('Vui lòng điền đầy đủ thông tin!'); return }
    setOrdering(true)
    await supabase.from('orders').insert({
      listing_id: listingId, buyer_id: currentUser?.id || null,
      seller_id: item.user_id, ten_nguoi_mua: orderForm.ten,
      sdt: orderForm.sdt, dia_chi: orderForm.dia_chi,
      phuong_thuc: orderForm.phuong_thuc, gia: item.gia, trang_thai: 'pending'
    })
    setOrdering(false)
    setOrderSuccess(true)
  }

  return { likes, liked, toggleLike, comments, newComment, setNewComment, commenting, submitComment, showOrder, setShowOrder, orderForm, setOrderForm, ordering, orderSuccess, submitOrder, copied, copyLink }
}

function getYoutubeEmbed(url: string) {
  if (!url) return null
  // Embed URL trực tiếp
  if (url.includes('youtube.com/embed/')) return url
  // Watch URL
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  // Shorts
  const shorts = url.match(/youtube\.com\/shorts\/([^&\s]+)/)
  if (shorts) return `https://www.youtube.com/embed/${shorts[1]}`
  return null
}
function isFacebookVideo(url: string) {
  return url?.includes('facebook.com') || url?.includes('fb.com') || url?.includes('fb.watch')
}
function ListingModal({ item, onClose }: { item: any, onClose: () => void }) {
  const { getBgStyle } = useTheme()
  const [activeImg, setActiveImg] = useState(0)
  const [activeVideo, setActiveVideo] = useState<string|null>(null)
  const [lightbox, setLightbox] = useState<string|null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const imgs = [item.hinh_anh, item.hinh_anh_2, item.hinh_anh_3, item.hinh_anh_4, item.hinh_anh_5].filter(Boolean)
  const videos = [item.video_url, item.video_url_2, item.video_url_3].filter(Boolean)
  const ytVideos = videos.map(v => getYoutubeEmbed(v)).filter(Boolean)
  const { likes, liked, toggleLike, comments, newComment, setNewComment, commenting, submitComment, showOrder, setShowOrder, orderForm, setOrderForm, ordering, orderSuccess, submitOrder, copied, copyLink } = useListingFeatures(item.id, currentUser)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user))
  }, [])

  return (
    <div className="min-h-screen text-white p-4 max-w-2xl mx-auto" style={getBgStyle()}>
      <button onClick={onClose} className="text-gray-400 hover:text-white mb-4 flex items-center gap-2">
        ← Quay lại chợ
      </button>

      {/* Gallery ảnh + video */}
      {(imgs.length > 0 || ytVideos.length > 0) && (
        <div className="mb-4">
          {/* Main display */}
          {activeVideo ? (
            <iframe src={activeVideo} className="w-full rounded-xl mb-2" style={{height:'280px'}} allowFullScreen />
          ) : imgs.length > 0 ? (
            <img src={imgs[activeImg]} onClick={() => setLightbox(imgs[activeImg])} className="w-full rounded-xl mb-2 cursor-zoom-in" style={{maxHeight:'360px',objectFit:'contain',background:'#111'}} />
          ) : null}
          {/* Thumbnails row */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {imgs.map((img, i) => (
              <img key={i} src={img} onClick={() => { setActiveImg(i); setActiveVideo(null) }}
                className={`w-16 h-16 shrink-0 object-cover rounded-lg cursor-pointer transition ${!activeVideo && activeImg === i ? 'ring-2 ring-green-400' : 'opacity-60 hover:opacity-100'}`} />
            ))}
            {ytVideos.map((ytUrl, i) => (
              <div key={`v${i}`} onClick={() => setActiveVideo(ytUrl!)}
                className={`w-16 h-16 shrink-0 rounded-lg cursor-pointer relative overflow-hidden flex items-center justify-center transition ${activeVideo === ytUrl ? 'ring-2 ring-yellow-400' : 'opacity-70 hover:opacity-100'}`}
                style={{background:'#1a1a2e',border:'1px solid rgba(255,255,255,0.1)'}}>
                <span style={{fontSize:'24px'}}>▶️</span>
              </div>
            ))}
          </div>
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
            ) : isFacebookVideo(url) ? (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                style={{display:'flex',alignItems:'center',gap:'10px',background:'#1877f2',color:'#fff',padding:'12px 20px',borderRadius:'12px',textDecoration:'none',fontWeight:600,fontSize:'14px',marginBottom:'8px'}}>
                🎥 Xem video trên Facebook
              </a>
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
      <div className="flex gap-3 mb-4">
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
        <button onClick={() => setShowOrder(true)}
          className="flex-1 rounded-xl p-3 text-center font-semibold text-white"
          style={{background:'#c8a84b',color:'#0e2d1a'}}>
          🛒 Mua ngay
        </button>
      </div>

      {/* Like / Share */}
      <div className="flex gap-3 mb-4">
        <button onClick={toggleLike}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition"
          style={{background: liked ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)', color: liked ? '#f87171' : 'rgba(255,255,255,0.7)', border: liked ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.1)'}}>
          {liked ? '❤️' : '🤍'} {likes}
        </button>
        <button onClick={copyLink}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition"
          style={{background:'rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.7)',border:'1px solid rgba(255,255,255,0.1)'}}>
          {copied ? '✅ Đã copy!' : '🔗 Copy link'}
        </button>
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '/marketplace?id=' + item.id)}`}
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{background:'rgba(24,119,242,0.15)',color:'#60a5fa',border:'1px solid rgba(24,119,242,0.2)'}}>
          📘 Facebook
        </a>
      </div>

      {/* Order Modal */}
      {showOrder && !orderSuccess && (
        <div style={{background:'rgba(0,0,0,0.5)',position:'fixed',top:0,left:0,right:0,bottom:0,zIndex:999,display:'flex',alignItems:'center',justifyContent:'center',padding:'16px'}}>
          <div style={{background:'#1a2f1a',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'20px',padding:'24px',width:'100%',maxWidth:'400px'}}>
            <h3 style={{margin:'0 0 16px',fontSize:'18px',fontWeight:700}}>🛒 Đặt hàng</h3>
            <p style={{color:'#c8a84b',fontWeight:700,marginBottom:'16px'}}>{item.ten_cay} — {Number(item.gia).toLocaleString('vi-VN')}đ</p>
            {[{key:'ten',label:'Tên người nhận',ph:'Nguyễn Văn A'},{key:'sdt',label:'Số điện thoại',ph:'0901234567'},{key:'dia_chi',label:'Địa chỉ',ph:'123 Đường ABC, Cà Mau'}].map(f => (
              <div key={f.key} style={{marginBottom:'12px'}}>
                <label style={{fontSize:'12px',color:'rgba(255,255,255,0.6)',display:'block',marginBottom:'4px'}}>{f.label}</label>
                <input value={orderForm[f.key as keyof typeof orderForm]} onChange={e => setOrderForm(p => ({...p, [f.key]: e.target.value}))}
                  placeholder={f.ph}
                  style={{width:'100%',padding:'10px 14px',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'10px',background:'rgba(255,255,255,0.08)',color:'#fff',fontSize:'14px',outline:'none',boxSizing:'border-box'}} />
              </div>
            ))}
            {/* Dat coc */}
            <div style={{marginBottom:'12px'}}>
              <label style={{fontSize:'12px',color:'rgba(255,255,255,0.6)',display:'block',marginBottom:'8px'}}>💵 Đặt cọc trước (tùy chọn)</label>
              <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                {[{v:'0',l:'Không cọc'},{v:'10',l:'10%'},{v:'20',l:'20%'},{v:'30',l:'30%'},{v:'50',l:'50%'}].map(opt => (
                  <button key={opt.v} onClick={() => setOrderForm(p => ({...p, dat_coc: opt.v}))}
                    style={{padding:'8px 14px',borderRadius:'20px',border:'none',cursor:'pointer',fontWeight:600,fontSize:'12px',
                      background: orderForm.dat_coc === opt.v ? '#c8a84b' : 'rgba(255,255,255,0.08)',
                      color: orderForm.dat_coc === opt.v ? '#0e2d1a' : '#fff'}}>
                    {opt.l}
                  </button>
                ))}
              </div>
              {orderForm.dat_coc !== '0' && (
                <div style={{marginTop:'10px',background:'rgba(200,168,75,0.1)',border:'1px solid rgba(200,168,75,0.3)',borderRadius:'12px',padding:'12px'}}>
                  <p style={{fontSize:'13px',color:'#c8a84b',fontWeight:700,margin:'0 0 4px'}}>
                    Số tiền cọc: {(item.gia * parseInt(orderForm.dat_coc) / 100).toLocaleString('vi-VN')}đ ({orderForm.dat_coc}%)
                  </p>
                </div>
              )}
            </div>
            <div style={{marginBottom:'16px'}}>
              <label style={{fontSize:'12px',color:'rgba(255,255,255,0.6)',display:'block',marginBottom:'8px'}}>Phương thức thanh toán</label>
              <div style={{display:'flex',gap:'8px'}}>
                {[{v:'cod',l:'🚚 COD'},{v:'chuyen_khoan',l:'🏦 Chuyển khoản'}].map(opt => (
                  <button key={opt.v} onClick={() => setOrderForm(p => ({...p, phuong_thuc: opt.v}))}
                    style={{flex:1,padding:'10px',borderRadius:'10px',border:'none',cursor:'pointer',fontWeight:600,fontSize:'13px',
                      background: orderForm.phuong_thuc === opt.v ? '#c8a84b' : 'rgba(255,255,255,0.08)',
                      color: orderForm.phuong_thuc === opt.v ? '#0e2d1a' : '#fff'}}>
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>
            {/* QR chuyen khoan */}
            {orderForm.phuong_thuc === 'chuyen_khoan' && (
              <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'16px',marginBottom:'12px',textAlign:'center'}}>
                <p style={{fontSize:'13px',fontWeight:700,marginBottom:'12px',color:'#c8a84b'}}>🏦 Thông tin chuyển khoản</p>
                {bankInfo.bank_bin && bankInfo.bank_account && (
                  <img src={`https://img.vietqr.io/image/${bankInfo.bank_bin}-${bankInfo.bank_account}-compact2.png?amount=${orderForm.dat_coc !== '0' ? Math.round(item.gia * parseInt(orderForm.dat_coc) / 100) : item.gia}&addInfo=Dat coc ${item.ten_cay}&accountName=${bankInfo.bank_holder}`}
                    style={{width:'200px',borderRadius:'12px',margin:'0 auto 12px',display:'block'}} alt="QR" />
                )}
                <div style={{textAlign:'left',fontSize:'13px',color:'rgba(255,255,255,0.8)'}}>
                  <p>🏦 Ngân hàng: <b>{bankInfo.bank_name}</b></p>
                  <p>💳 Số TK: <b>{bankInfo.bank_account}</b></p>
                  <p>👤 Chủ TK: <b>{bankInfo.bank_holder}</b></p>
                  <p>💰 Số tiền: <b style={{color:'#c8a84b'}}>{orderForm.dat_coc !== '0' ? Math.round(item.gia * parseInt(orderForm.dat_coc) / 100).toLocaleString('vi-VN') : item.gia?.toLocaleString('vi-VN')}đ</b></p>
                  <p>📝 Nội dung: <b>Dat coc {item.ten_cay}</b></p>
                </div>
              </div>
            )}
            <div style={{display:'flex',gap:'8px'}}>
              <button onClick={() => setShowOrder(false)}
                style={{flex:1,padding:'12px',background:'rgba(255,255,255,0.08)',color:'#fff',border:'none',borderRadius:'12px',cursor:'pointer'}}>
                Hủy
              </button>
              <button onClick={() => submitOrder(item)} disabled={ordering}
                style={{flex:2,padding:'12px',background:'#c8a84b',color:'#0e2d1a',border:'none',borderRadius:'12px',fontWeight:700,cursor:'pointer'}}>
                {ordering ? '⏳ Đang gửi...' : '✅ Xác nhận đặt hàng'}
              </button>
            </div>
          </div>
        </div>
      )}
      {orderSuccess && (
        <div style={{background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.3)',borderRadius:'16px',padding:'20px',textAlign:'center',marginBottom:'16px'}}>
          <div style={{fontSize:'40px',marginBottom:'8px'}}>🎉</div>
          <p style={{fontWeight:700,color:'#4ade80'}}>Đặt hàng thành công!</p>
          <p style={{fontSize:'13px',color:'rgba(255,255,255,0.6)'}}>Người bán sẽ liên hệ với bạn sớm nhất</p>
        </div>
      )}

      {/* Comments */}
      <div style={{marginTop:'16px'}}>
        <h3 style={{fontSize:'15px',fontWeight:700,marginBottom:'12px'}}>💬 Bình luận ({comments.length})</h3>
        <div style={{display:'flex',gap:'8px',marginBottom:'16px'}}>
          <input value={newComment} onChange={e => setNewComment(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submitComment()}
            placeholder="Viết bình luận..."
            style={{flex:1,padding:'10px 14px',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'10px',background:'rgba(255,255,255,0.08)',color:'#fff',fontSize:'14px',outline:'none'}} />
          <button onClick={submitComment} disabled={commenting}
            style={{padding:'10px 16px',background:'#2d6b42',color:'#fff',border:'none',borderRadius:'10px',cursor:'pointer',fontWeight:600,fontSize:'13px'}}>
            {commenting ? '...' : 'Gửi'}
          </button>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:'8px',maxHeight:'300px',overflowY:'auto'}}>
          {comments.length === 0 ? (
            <p style={{color:'rgba(255,255,255,0.4)',fontSize:'13px',textAlign:'center',padding:'16px'}}>Chưa có bình luận nào</p>
          ) : comments.map((cm, i) => (
            <div key={i} style={{background:'rgba(255,255,255,0.05)',borderRadius:'10px',padding:'10px 14px'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
                <span style={{fontWeight:600,fontSize:'13px',color:'#c8a84b'}}>{cm.user_name}</span>
                <span style={{fontSize:'11px',color:'rgba(255,255,255,0.3)'}}>{new Date(cm.created_at).toLocaleDateString('vi-VN')}</span>
              </div>
              <p style={{margin:0,fontSize:'14px',color:'rgba(255,255,255,0.85)'}}>{cm.noi_dung}</p>
            </div>
          ))}
        </div>
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