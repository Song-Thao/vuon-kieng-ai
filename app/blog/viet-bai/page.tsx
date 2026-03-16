'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const CATEGORIES = [
  { value: 'cham-soc', label: '🌱 Chăm sóc cây' },
  { value: 'benh-cay', label: '🔬 Bệnh cây & điều trị' },
  { value: 'bonsai', label: '🎋 Kỹ thuật Bonsai' },
  { value: 'cay-kieng', label: '🌿 Giới thiệu cây kiểng' },
  { value: 'thi-truong', label: '💰 Thị trường & giá cả' },
  { value: 'phan-bon', label: '🧪 Phân bón & thuốc' },
  { value: 'dung-cu', label: '🔧 Dụng cụ & chậu' },
  { value: 'kinh-nghiem', label: '📖 Kinh nghiệm chia sẻ' },
]

export default function VietBai() {
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    tieu_de: '',
    tom_tat: '',
    noi_dung: '',
    the_loai: 'kinh-nghiem',
    tags: '',
  })

  const taoSlug = (text: string) =>
    text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const aiVietBai = async () => {
    if (!form.tieu_de) return alert('Nhập tiêu đề trước!')
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tieu_de: form.tieu_de, the_loai: form.the_loai })
      })
      const data = await res.json()
      if (data.noi_dung) {
        setForm({ ...form, noi_dung: data.noi_dung, tom_tat: data.tom_tat || form.tom_tat })
      }
    } catch { alert('Lỗi AI, thử lại!') }
    setAiLoading(false)
  }

  const submit = async () => {
    if (!form.tieu_de || !form.noi_dung) return alert('Vui lòng nhập tiêu đề và nội dung!')
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }

    const { error } = await supabase.from('posts').insert({
      tieu_de: form.tieu_de,
      slug: taoSlug(form.tieu_de) + '-' + Date.now(),
      tom_tat: form.tom_tat,
      noi_dung: form.noi_dung,
      the_loai: form.the_loai,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      trang_thai: 'cho_duyet',
      user_id: user.id,
      ai_viet: false
    })
    setLoading(false)
    if (error) alert('Lỗi: ' + error.message)
    else setSuccess(true)
  }

  if (success) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center bg-white rounded-2xl p-10 shadow">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-green-700 mb-2">Gửi bài thành công!</h2>
        <p className="text-gray-500 mb-6">Bài viết đang chờ admin duyệt. Cảm ơn bạn đã đóng góp!</p>
        <div className="flex gap-3 justify-center">
          <Link href="/blog" className="bg-green-700 text-white rounded-xl px-6 py-3">Xem Blog</Link>
          <button onClick={() => { setSuccess(false); setForm({ tieu_de:'',tom_tat:'',noi_dung:'',the_loai:'kinh-nghiem',tags:'' }) }}
            className="bg-gray-100 text-gray-700 rounded-xl px-6 py-3">Viết tiếp</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/blog" className="text-gray-400 hover:text-gray-600">← Blog</Link>
          <h1 className="text-2xl font-bold text-green-800">✍️ Viết bài chia sẻ</h1>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Tiêu đề bài viết *</label>
            <input className="w-full border rounded-xl p-3 mt-1 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="VD: Cách trị bệnh thán thư trên cây Mai Vàng hiệu quả nhất"
              value={form.tieu_de} onChange={e => setForm({...form, tieu_de: e.target.value})} />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Chủ đề</label>
            <select className="w-full border rounded-xl p-3 mt-1 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={form.the_loai} onChange={e => setForm({...form, the_loai: e.target.value})}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Tóm tắt (hiển thị ngoài danh sách)</label>
            <textarea className="w-full border rounded-xl p-3 mt-1 h-20 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Mô tả ngắn về bài viết..."
              value={form.tom_tat} onChange={e => setForm({...form, tom_tat: e.target.value})} />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-600">Nội dung *</label>
              <button onClick={aiVietBai} disabled={aiLoading}
                className="text-sm bg-blue-600 hover:bg-blue-500 disabled:bg-gray-300 text-white rounded-lg px-3 py-1">
                {aiLoading ? '🤖 Đang viết...' : '🤖 AI viết hộ'}
              </button>
            </div>
            <textarea className="w-full border rounded-xl p-3 h-64 focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
              placeholder="Viết nội dung bài của bạn ở đây... Hoặc bấm 'AI viết hộ' để AI tạo nội dung mẫu rồi bạn chỉnh sửa thêm."
              value={form.noi_dung} onChange={e => setForm({...form, noi_dung: e.target.value})} />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Tags (phân cách bằng dấu phẩy)</label>
            <input className="w-full border rounded-xl p-3 mt-1 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="VD: mai vàng, bệnh thán thư, thuốc trị nấm"
              value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-700">
            ℹ️ Bài viết sẽ được admin duyệt trước khi hiển thị công khai. Thường trong vòng 24 giờ.
          </div>

          <button onClick={submit} disabled={loading}
            className="w-full bg-green-700 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-xl p-4 font-bold text-lg">
            {loading ? 'Đang gửi...' : '📤 Gửi bài viết'}
          </button>
        </div>
      </div>
    </div>
  )
}