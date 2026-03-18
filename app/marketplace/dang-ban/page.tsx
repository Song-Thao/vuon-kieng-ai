'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { uploadImage } from '@/lib/uploadImage'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const IMG_SLOTS = [
  { key: 'hinh_anh',   label: 'Ảnh chính', icon: '📸' },
  { key: 'hinh_anh_2', label: 'Góc 2',     icon: '🔍' },
  { key: 'hinh_anh_3', label: 'Gốc cây',   icon: '🌱' },
  { key: 'hinh_anh_4', label: 'Ngọn / Lá', icon: '🍃' },
  { key: 'hinh_anh_5', label: 'Toàn thân', icon: '🌳' },
]

const emptyImages = { hinh_anh: '', hinh_anh_2: '', hinh_anh_3: '', hinh_anh_4: '', hinh_anh_5: '' }

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve) => {
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
        resolve(canvas.toDataURL('image/jpeg', 0.75))
      }
      img.src = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

function getVideoEmbed(url: string) {
  if (!url) return null
  // YouTube
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  // TikTok - chỉ hiện link
  if (url.includes('tiktok.com')) return url
  // Facebook - chỉ hiện link
  if (url.includes('facebook.com')) return url
  return url
}

function DangBanInner() {
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editId) {
      supabase.from('listings').select('*').eq('id', editId).single().then(({ data }) => {
        if (data) {
          setForm({
            ten_cay: data.ten_cay || '',
            mo_ta: data.mo_ta || '',
            gia: data.gia || '',
            vi_tri: data.vi_tri || '',
            zalo: data.zalo || '',
            sdt: data.sdt || '',
            video_url: data.video_url || '',
            video_url_2: data.video_url_2 || '',
            video_url_3: data.video_url_3 || '',
          })
          setImages({
            hinh_anh: data.hinh_anh || '',
            hinh_anh_2: data.hinh_anh_2 || '',
            hinh_anh_3: data.hinh_anh_3 || '',
            hinh_anh_4: data.hinh_anh_4 || '',
            hinh_anh_5: data.hinh_anh_5 || '',
          })
        }
      })
    }
  }, [editId])
  const [success, setSuccess] = useState(false)
  const [images, setImages] = useState({ ...emptyImages })
  const [uploadingSlot, setUploadingSlot] = useState<string>('')
  const [form, setForm] = useState({
    ten_cay: '', mo_ta: '', gia: '', vi_tri: '', zalo: '', sdt: '',
    video_url: '', video_url_2: '', video_url_3: ''
  })

  const handleImageSlot = async (e: any, slot: string) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingSlot(slot)
    const b64 = await resizeImage(file)
    const url = await uploadImage(b64, 'marketplace')
    setImages(prev => ({ ...prev, [slot]: url || b64 }))
    setUploadingSlot('')
  }

  const submit = async () => {
    if (!form.ten_cay || !form.gia) return alert('Vui lòng nhập tên cây và giá!')
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }

    const payload = {
      ten_cay: form.ten_cay,
      mo_ta: form.mo_ta,
      gia: parseInt(String(form.gia).replace(/\D/g, '')) || 0,
      vi_tri: form.vi_tri,
      zalo: form.zalo,
      sdt: form.sdt,
      hinh_anh: images.hinh_anh || null,
      hinh_anh_2: images.hinh_anh_2 || null,
      hinh_anh_3: images.hinh_anh_3 || null,
      hinh_anh_4: images.hinh_anh_4 || null,
      hinh_anh_5: images.hinh_anh_5 || null,
      video_url: form.video_url || null,
      video_url_2: form.video_url_2 || null,
      video_url_3: form.video_url_3 || null,
    }
    let error
    if (editId) {
      const { error: e } = await supabase.from('listings').update(payload).eq('id', editId)
      error = e
    } else {
      const { error: e } = await supabase.from('listings').insert({ ...payload, user_id: user.id })
      error = e
    }
    setLoading(false)
    if (error) alert('Lỗi: ' + error.message)
    else setSuccess(true)
  }

  if (success) return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-green-400 mb-2">Đăng bán thành công!</h2>
        <p className="text-gray-400 mb-6">Cây của bạn đã được đăng lên chợ</p>
        <div className="flex gap-3 justify-center">
          <a href="/marketplace" className="bg-green-600 hover:bg-green-500 rounded-lg px-6 py-3">Xem chợ</a>
          <button onClick={() => { setSuccess(false); setForm({ ten_cay:'',mo_ta:'',gia:'',vi_tri:'',zalo:'',sdt:'',video_url:'',video_url_2:'',video_url_3:'' }); setImages({...emptyImages}) }}
            className="bg-gray-700 hover:bg-gray-600 rounded-lg px-6 py-3">Đăng tiếp</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/marketplace" className="text-gray-400 hover:text-white">← Chợ cây</Link>
        <h1 className="text-2xl font-bold text-green-400">Đăng bán cây</h1>
      </div>

      <div className="bg-gray-800 rounded-xl p-4 space-y-4">

        {/* 5 ảnh */}
        <div>
          <label className="text-sm text-gray-400 mb-2 block">📸 Ảnh cây — tối đa 5 ảnh</label>
          <div className="grid grid-cols-5 gap-2">
            {IMG_SLOTS.map(slot => (
              <label key={slot.key} className="cursor-pointer">
                <div className={`aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-xs overflow-hidden
                  ${images[slot.key as keyof typeof images] ? 'border-green-500' : 'border-gray-600 hover:border-green-400'}`}>
                  {uploadingSlot === slot.key ? (
                    <div className="text-yellow-400 text-lg animate-pulse">⏳</div>
                  ) : images[slot.key as keyof typeof images] ? (
                    <img src={images[slot.key as keyof typeof images]} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <span className="text-xl mb-1">{slot.icon}</span>
                      <span className="text-gray-500 text-center px-1">{slot.label}</span>
                    </>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => handleImageSlot(e, slot.key)} />
              </label>
            ))}
          </div>
        </div>

        {/* Thông tin */}
        {[
          { key: 'ten_cay', label: 'Tên cây *', ph: 'VD: Bonsai Cây Sơ Ri 15 năm tuổi' },
          { key: 'gia', label: 'Giá bán (VNĐ) *', ph: 'VD: 25000000' },
          { key: 'vi_tri', label: 'Vị trí', ph: 'VD: Lung Chim, Đinh Thành, Cà Mau' },
          { key: 'zalo', label: 'Zalo', ph: 'Số Zalo' },
          { key: 'sdt', label: 'Số điện thoại', ph: 'Số điện thoại liên hệ' },
        ].map(f => (
          <div key={f.key}>
            <label className="text-sm text-gray-400">{f.label}</label>
            <input className="w-full bg-gray-700 rounded p-2 mt-1 text-white placeholder-gray-500"
              placeholder={f.ph} value={(form as any)[f.key]}
              onChange={e => setForm({...form, [f.key]: e.target.value})} />
          </div>
        ))}

        <div>
          <label className="text-sm text-gray-400">Mô tả chi tiết</label>
          <textarea className="w-full bg-gray-700 rounded p-2 mt-1 h-24 text-white placeholder-gray-500"
            placeholder="Tuổi cây, thế cây, hoành gốc, tình trạng sức khỏe, địa điểm xem cây..."
            value={form.mo_ta} onChange={e => setForm({...form, mo_ta: e.target.value})} />
        </div>

        {/* Video links */}
        <div>
          <label className="text-sm text-gray-400 mb-2 block">🎥 Link video (YouTube, TikTok, Facebook...)</label>
          {[
            { key: 'video_url', ph: 'Link video 1 (YouTube/TikTok/Facebook...)' },
            { key: 'video_url_2', ph: 'Link video 2 (tuỳ chọn)' },
            { key: 'video_url_3', ph: 'Link video 3 (tuỳ chọn)' },
          ].map(f => (
            <input key={f.key}
              className="w-full bg-gray-700 rounded p-2 mt-2 text-white placeholder-gray-500 text-sm"
              placeholder={f.ph} value={(form as any)[f.key]}
              onChange={e => setForm({...form, [f.key]: e.target.value})} />
          ))}
        </div>

        {/* Preview YouTube */}
        {form.video_url && form.video_url.includes('youtube') && (
          <div className="rounded-xl overflow-hidden">
            <iframe className="w-full aspect-video" src={getVideoEmbed(form.video_url) || ''} allowFullScreen />
          </div>
        )}
      </div>

      <button onClick={submit} disabled={loading}
        className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-600 rounded-xl p-4 font-bold text-lg mt-4">
        {loading ? '⏳ Đang đăng...' : '🌿 Đăng bán ngay'}
      </button>
    </div>
  )
}
export default function DangBan() {
  return (
    <Suspense fallback={<div style={{minHeight:'100vh',background:'#0e2d1a'}} />}>
      <DangBanInner />
    </Suspense>
  )
}
