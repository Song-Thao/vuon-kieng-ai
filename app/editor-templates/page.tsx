'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const LOAI_LIST = [
  { value: 'canh', label: '🌿 Canh bonsai' },
  { value: 'tan', label: '🍃 Tan la' },
  { value: 'chau', label: '🪴 Chau cay' },
  { value: 'trang_tri', label: '🪨 Trang tri' },
]

export default function EditorTemplates() {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [filter, setFilter] = useState('all')
  const [form, setForm] = useState({ ten: '', loai: 'canh', ten_nguoi_upload: '' })
  const [file, setFile] = useState<File|null>(null)
  const [preview, setPreview] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => { loadTemplates() }, [filter])

  const loadTemplates = async () => {
    setLoading(true)
    let q = supabase.from('editor_templates').select('*').eq('is_hidden', false).order('created_at', { ascending: false })
    if (filter !== 'all') q = q.eq('loai', filter)
    const { data } = await q
    setTemplates(data || [])
    setLoading(false)
  }

  const handleFile = (e: any) => {
    const f = e.target.files[0]
    if (!f) return
    if (!f.type.startsWith('image/')) return alert('Chi chap nhan file anh!')
    if (f.size > 5 * 1024 * 1024) return alert('File qua lon! Toi da 5MB')
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const upload = async () => {
    if (!file) return alert('Vui long chon anh!')
    if (!form.ten.trim()) return alert('Vui long nhap ten template!')
    if (!form.ten_nguoi_upload.trim()) return alert('Vui long nhap ten cua ban!')
    setUploading(true)
    setMsg('')
    try {
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { data: storageData, error: storageErr } = await supabase.storage
        .from('editor-templates')
        .upload(fileName, file, { contentType: file.type, upsert: false })
      if (storageErr) throw new Error('Loi upload anh: ' + storageErr.message)
      const { data: urlData } = supabase.storage.from('editor-templates').getPublicUrl(fileName)
      const imageUrl = urlData.publicUrl
      const { error: dbErr } = await supabase.from('editor_templates').insert({
        ten: form.ten.trim(),
        loai: form.loai,
        image_url: imageUrl,
        ten_nguoi_upload: form.ten_nguoi_upload.trim(),
        is_default: false,
        is_hidden: false,
      })
      if (dbErr) throw new Error('Loi luu database: ' + dbErr.message)
      setMsg('✅ Upload thanh cong! Template cua ban da duoc them vao thu vien.')
      setForm({ ten: '', loai: 'canh', ten_nguoi_upload: form.ten_nguoi_upload })
      setFile(null)
      setPreview('')
      loadTemplates()
    } catch (e: any) {
      setMsg('❌ ' + e.message)
    }
    setUploading(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 max-w-5xl mx-auto pb-20">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm">← Dashboard</Link>
        <div>
          <h1 className="text-xl font-bold text-green-400">🌿 Community Template Library</h1>
          <p className="text-gray-400 text-xs">Thu vien template cong dong — Ai cung co the dong gop</p>
        </div>
      </div>

      {/* UPLOAD FORM */}
      <div className="bg-gray-800 rounded-xl p-5 mb-6 border border-green-500/30">
        <h2 className="text-green-300 font-bold text-sm mb-4">⬆️ Dong gop Template Moi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400">Ten template *</label>
              <input className="w-full bg-gray-700 rounded p-2 mt-1 text-white text-sm placeholder-gray-500"
                placeholder="VD: Canh trai dep, Chau oval xanh..."
                value={form.ten} onChange={e => setForm({...form, ten: e.target.value})} />
            </div>
            <div>
              <label className="text-xs text-gray-400">Loai template *</label>
              <select className="w-full bg-gray-700 rounded p-2 mt-1 text-white text-sm"
                value={form.loai} onChange={e => setForm({...form, loai: e.target.value})}>
                {LOAI_LIST.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400">Ten cua ban *</label>
              <input className="w-full bg-gray-700 rounded p-2 mt-1 text-white text-sm placeholder-gray-500"
                placeholder="VD: Nguyen Van A, BonsaiMaster..."
                value={form.ten_nguoi_upload} onChange={e => setForm({...form, ten_nguoi_upload: e.target.value})} />
            </div>
            <div>
              <label className="text-xs text-gray-400">Anh PNG/JPG * (nen dung nen trong suot .PNG)</label>
              <input type="file" accept="image/*" onChange={handleFile}
                className="w-full text-gray-300 text-sm mt-1" />
              <p className="text-gray-500 text-xs mt-1">Toi da 5MB. Nen dung PNG nen trong suot de dep hon</p>
            </div>
            <button onClick={upload} disabled={uploading}
              className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-600 rounded-xl p-3 font-bold text-sm transition-colors">
              {uploading ? '⏳ Dang upload...' : '⬆️ Upload Template'}
            </button>
            {msg && (
              <div className={`rounded-lg p-3 text-sm ${msg.startsWith('✅') ? 'bg-green-900/40 text-green-300' : 'bg-red-900/40 text-red-300'}`}>
                {msg}
              </div>
            )}
          </div>
          <div className="flex items-center justify-center">
            {preview
              ? <img src={preview} className="max-h-48 max-w-full rounded-xl border border-gray-600 bg-gray-700 object-contain p-2" />
              : <div className="w-full h-48 border-2 border-dashed border-gray-600 rounded-xl flex items-center justify-center text-gray-500 text-sm">
                  Preview anh se hien thi o day
                </div>
            }
          </div>
        </div>
      </div>

      {/* FILTER */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[{value:'all',label:'🌐 Tat ca'}, ...LOAI_LIST].map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              filter === f.value ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* TEMPLATE GRID */}
      {loading
        ? <div className="text-center text-gray-400 py-10">Dang tai...</div>
        : templates.length === 0
          ? <div className="text-center py-16 text-gray-500">
              <div className="text-4xl mb-3">🌿</div>
              <p className="text-sm">Chua co template nao. Hay la nguoi dau tien dong gop!</p>
            </div>
          : <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {templates.map(t => (
                <div key={t.id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-green-500/50 transition-colors">
                  <div className="bg-gray-700 h-36 flex items-center justify-center p-2"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\'%3E%3Crect width=\'10\' height=\'10\' fill=\'%23374151\'/%3E%3Crect x=\'10\' y=\'10\' width=\'10\' height=\'10\' fill=\'%23374151\'/%3E%3Crect x=\'10\' width=\'10\' height=\'10\' fill=\'%234b5563\'/%3E%3Crect y=\'10\' width=\'10\' height=\'10\' fill=\'%234b5563\'/%3E%3C/svg%3E")', backgroundSize: '20px' }}>
                    <img src={t.image_url} className="max-h-32 max-w-full object-contain" />
                  </div>
                  <div className="p-3">
                    <p className="text-white text-xs font-semibold truncate">{t.ten}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {LOAI_LIST.find(l => l.value === t.loai)?.label}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">👤 {t.ten_nguoi_upload}</p>
                    <p className="text-gray-600 text-xs">{new Date(t.created_at).toLocaleDateString('vi-VN')}</p>
                    {t.is_default && <span className="text-yellow-400 text-xs">⭐ Default</span>}
                  </div>
                </div>
              ))}
            </div>
      }

      <div className="mt-8 bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
        <h3 className="text-blue-300 font-semibold text-sm mb-2">📌 Quy tac dong gop:</h3>
        <ul className="text-gray-400 text-xs space-y-1">
          <li>✅ Ai cung co the upload template mien phi</li>
          <li>✅ Nen dung file PNG nen trong suot de dep hon khi dat len anh cay</li>
          <li>✅ Template sau khi upload se hien thi ngay trong thu vien</li>
          <li>⚠️ Template khong the bi xoa boi nguoi dung — chi admin moi xoa duoc</li>
          <li>⚠️ Khong upload anh ban quyen hoac noi dung khong lien quan bonsai</li>
        </ul>
      </div>
    </div>
  )
}
