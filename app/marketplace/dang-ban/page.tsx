'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { uploadImage } from '@/lib/uploadImage'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function DangBan() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [image, setImage] = useState<string>('')
  const [form, setForm] = useState({
    ten_cay: '', mo_ta: '', gia: '', vi_tri: '', zalo: '', sdt: ''
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
        setImage(canvas.toDataURL('image/jpeg', 0.7))
      }
      img.src = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const submit = async () => {
    if (!form.ten_cay || !form.gia) return alert('Vui lòng nhập tên cây và giá!')
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }

    let imageUrl = null
    if (image) {
      imageUrl = await uploadImage(image, 'marketplace')
    }

    const { error } = await supabase.from('listings').insert({
      ten_cay: form.ten_cay,
      mo_ta: form.mo_ta,
      gia: parseInt(form.gia.replace(/\D/g, '')),
      vi_tri: form.vi_tri,
      zalo: form.zalo,
      sdt: form.sdt,
      hinh_anh: imageUrl,
      user_id: user.id
    })
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
          <button onClick={() => { setSuccess(false); setForm({ ten_cay:'',mo_ta:'',gia:'',vi_tri:'',zalo:'',sdt:'' }); setImage('') }}
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
        {[
          { key: 'ten_cay', label: 'Tên cây *', ph: 'VD: Bonsai Mai Vàng 10 năm tuổi' },
          { key: 'gia', label: 'Giá bán (VNĐ) *', ph: 'VD: 5000000' },
          { key: 'vi_tri', label: 'Vị trí', ph: 'VD: Cà Mau, Cần Thơ, TP.HCM...' },
          { key: 'zalo', label: 'Zalo', ph: 'Số Zalo của bạn' },
          { key: 'sdt', label: 'Số điện thoại', ph: 'Số điện thoại liên hệ' },
        ].map(f => (
          <div key={f.key}>
            <label className="text-sm text-gray-400">{f.label}</label>
            <input
              className="w-full bg-gray-700 rounded p-2 mt-1 text-white placeholder-gray-500"
              placeholder={f.ph}
              value={(form as any)[f.key]}
              onChange={e => setForm({...form, [f.key]: e.target.value})}
            />
          </div>
        ))}

        <div>
          <label className="text-sm text-gray-400">Mô tả</label>
          <textarea
            className="w-full bg-gray-700 rounded p-2 mt-1 h-24 text-white placeholder-gray-500"
            placeholder="Mô tả chi tiết: tuổi cây, thế cây, tình trạng sức khỏe, hoành gốc..."
            value={form.mo_ta}
            onChange={e => setForm({...form, mo_ta: e.target.value})}
          />
        </div>

        <div>
          <label className="text-sm text-gray-400">Ảnh cây</label>
          {image && <img src={image} className="w-full rounded-lg my-2 max-h-64 object-cover" />}
          <input type="file" accept="image/*" onChange={handleImage} className="w-full text-gray-300 mt-1" />
        </div>
      </div>

      <button onClick={submit} disabled={loading}
        className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-600 rounded-xl p-4 font-bold text-lg mt-4">
        {loading ? '⏳ Đang đăng...' : '🌿 Đăng bán ngay'}
      </button>
    </div>
  )
}