'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const ADMIN_EMAIL = 'khsongthao00@gmail.com'

export default function Admin() {
  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [usersCount, setUsersCount] = useState<number>(0)
  const [listings, setListings] = useState<any[]>([])
  const [tab, setTab] = useState<'posts'|'listings'|'settings'>('posts')
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<any>({
    banner_title: '', banner_content: '', banner_image: '', banner_link: '',
    bg_color: '#0e2d1a', bg_image: '', bg_overlay: '0.5', primary_color: '#c8a84b', secondary_color: '#2d6b42',
    bank_name: '', bank_account: '', bank_holder: '', momo_number: '',
    listing_fee: '0', commission_percent: '0'
  })
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => { checkAdmin() }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== ADMIN_EMAIL) {
      window.location.href = '/dashboard'
      return
    }
    setUser(user)
    fetchData()
    fetchSettings()
  }

  const fetchData = async () => {
    const { data: p } = await supabase.from('posts').select('*').order('created_at', { ascending: false })
    const { data: l } = await supabase.from('listings').select('*').order('created_at', { ascending: false })
    setPosts(p || [])
    const { data: ucRows } = await supabase.from('user_count').select('total')
    const ucData = ucRows?.[0]
    console.log("ucRows:", ucRows)
    setUsersCount(Number(ucData?.total) || 0)
    setListings(l || [])
    setLoading(false)
  }

  const fetchSettings = async () => {
    const { data } = await supabase.from('admin_settings').select('*')
    if (data) {
      const s: any = {}
      data.forEach((r: any) => s[r.key] = r.value || '')
      setSettings((prev: any) => ({ ...prev, ...s }))
    }
  }

  const saveSetting = async (key: string, value: string) => {
    await supabase.from('admin_settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
  }

  const saveAllSettings = async () => {
    setSaving(true)
    await Promise.all(Object.entries(settings).map(([k, v]) => saveSetting(k, v as string)))
    setSaving(false)
    setSaveMsg('✅ Đã lưu!')
    setTimeout(() => setSaveMsg(''), 3000)
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
    if (!confirm('Xóa tin này?')) return
    await supabase.from('listings').delete().eq('id', id)
    fetchData()
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>

  const choDuyet = posts.filter(p => p.trang_thai === 'cho_duyet')

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
            { label: 'Tổng bài', value: posts.length, color: 'bg-green-50 text-green-700' },
            { label: 'Tin đăng bán', value: listings.length, color: 'bg-blue-50 text-blue-700' },
            { label: 'Tổng users', value: usersCount, color: 'bg-purple-50 text-purple-700' },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-xl p-4 text-center`}>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-sm">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'settings', label: '⚙️ Cài đặt' },
            { key: 'posts', label: `📝 Bài viết ${choDuyet.length > 0 ? `(${choDuyet.length})` : ''}` },
            { key: 'listings', label: '🌿 Tin đăng bán' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`px-4 py-2 rounded-xl font-medium text-sm ${tab === t.key ? 'bg-green-700 text-white' : 'bg-white text-gray-600 border'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Settings Tab */}
        {tab === 'settings' && (
          <div className="space-y-6">

            {/* Banner */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">🖼️ Banner Dashboard</h3>
              <div className="space-y-3">
                {[
                  { key: 'banner_title', label: 'Tiêu đề banner', ph: 'VD: 🌸 Hội thi cây cảnh Cà Mau 2026' },
                  { key: 'banner_content', label: 'Nội dung', ph: 'Mô tả ngắn về sự kiện hoặc sản phẩm...' },
                  { key: 'banner_link', label: 'Link khi bấm', ph: 'https://...' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-sm text-gray-500">{f.label}</label>
                    <input className="w-full border rounded-lg p-2 mt-1 text-sm"
                      placeholder={f.ph}
                      value={settings[f.key] || ''}
                      onChange={e => setSettings({ ...settings, [f.key]: e.target.value })} />
                  </div>
                ))}
                <div className="border-t pt-4 mt-2">
                  <p className="text-sm font-semibold text-gray-700 mb-3">🎨 Giao dien / Theme</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500">Mau nen chinh</label>
                      <div className="flex gap-2 mt-1 items-center">
                        <input type="color" value={settings.bg_color||'#0e2d1a'} onChange={e=>setSettings({...settings,bg_color:e.target.value})} className="w-10 h-9 rounded cursor-pointer border" />
                        <input className="flex-1 border rounded-lg p-2 text-sm" placeholder="#0e2d1a" value={settings.bg_color||''} onChange={e=>setSettings({...settings,bg_color:e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Mau chu de (nut, accent)</label>
                      <div className="flex gap-2 mt-1 items-center">
                        <input type="color" value={settings.primary_color||'#c8a84b'} onChange={e=>setSettings({...settings,primary_color:e.target.value})} className="w-10 h-9 rounded cursor-pointer border" />
                        <input className="flex-1 border rounded-lg p-2 text-sm" placeholder="#c8a84b" value={settings.primary_color||''} onChange={e=>setSettings({...settings,primary_color:e.target.value})} />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500">Anh nen (URL) — de trong neu dung mau nen</label>
                      <input className="w-full border rounded-lg p-2 mt-1 text-sm" placeholder="https://...jpg" value={settings.bg_image||''} onChange={e=>setSettings({...settings,bg_image:e.target.value})} />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500">Do toi overlay ({Math.round((settings.bg_overlay||0.5)*100)}%)</label>
                      <input type="range" min="0" max="1" step="0.05" value={settings.bg_overlay||0.5} onChange={e=>setSettings({...settings,bg_overlay:e.target.value})} className="w-full mt-1" />
                    </div>
                  </div>
                  <div className="mt-3 rounded-xl p-4 flex items-center justify-center text-white text-sm font-semibold" style={{background:settings.bg_color||"#0e2d1a",minHeight:"80px"}}>
                    Preview nen: <span style={{color:settings.primary_color||"#c8a84b",marginLeft:"8px"}}>● Mau chu de</span>
                  </div>
                </div>
                {[
                  { key: 'banner_link', label: 'Link khi bấm', ph: 'https://...' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-sm text-gray-500">{f.label}</label>
                    <input className="w-full border rounded-lg p-2 mt-1 text-sm"
                      placeholder={f.ph}
                      value={settings[f.key] || ''}
                      onChange={e => setSettings({ ...settings, [f.key]: e.target.value })} />
                  </div>
                ))}
                {settings.banner_title && (
                  <div className="bg-green-900 rounded-xl p-4 mt-2">
                    <div className="text-white font-bold">{settings.banner_title}</div>
                    <div className="text-green-200 text-sm mt-1">{settings.banner_content}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Thanh toán */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">💳 Cài đặt thanh toán</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'bank_name',    label: 'Tên ngân hàng', ph: 'Vietcombank' },
                  { key: 'bank_account', label: 'Số tài khoản',  ph: '1234567890' },
                  { key: 'bank_holder',  label: 'Chủ tài khoản', ph: 'NGUYEN VAN A' },
                  { key: 'momo_number',  label: 'Số MoMo',       ph: '0917161003' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-sm text-gray-500">{f.label}</label>
                    <input className="w-full border rounded-lg p-2 mt-1 text-sm"
                      placeholder={f.ph}
                      value={settings[f.key] || ''}
                      onChange={e => setSettings({ ...settings, [f.key]: e.target.value })} />
                  </div>
                ))}
              </div>
            </div>

            {/* Phí */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">💰 Phí & Hoa hồng</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-500">Phí đăng tin (VNĐ, 0 = miễn phí)</label>
                  <input type="number" className="w-full border rounded-lg p-2 mt-1 text-sm"
                    value={settings.listing_fee || '0'}
                    onChange={e => setSettings({ ...settings, listing_fee: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Hoa hồng giao dịch (%)</label>
                  <input type="number" className="w-full border rounded-lg p-2 mt-1 text-sm"
                    value={settings.commission_percent || '0'}
                    onChange={e => setSettings({ ...settings, commission_percent: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={saveAllSettings} disabled={saving}
                className="bg-green-700 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-xl px-8 py-3 font-semibold">
                {saving ? 'Đang lưu...' : '💾 Lưu tất cả'}
              </button>
              {saveMsg && <span className="text-green-600 font-medium">{saveMsg}</span>}
            </div>
          </div>
        )}

        {/* Posts Tab */}
        {tab === 'posts' && (
          <div className="space-y-3">
            {posts.map(post => (
              <div key={post.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${post.trang_thai === 'da_duyet' ? 'bg-green-100 text-green-700' : post.trang_thai === 'cho_duyet' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {post.trang_thai === 'da_duyet' ? '✅ Đã duyệt' : post.trang_thai === 'cho_duyet' ? '⏳ Chờ duyệt' : '❌ Từ chối'}
                      </span>
                      <span className="text-xs text-gray-400">{post.the_loai}</span>
                    </div>
                    <h3 className="font-semibold text-gray-800">{post.tieu_de}</h3>
                    <p className="text-xs text-gray-400 mt-1">{new Date(post.created_at).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div className="flex gap-2 ml-4 flex-wrap">
                    <Link href={`/blog/${post.slug || post.id}`} target="_blank" className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg">👁️ Xem</Link>
                    {post.trang_thai === 'cho_duyet' && <>
                      <button onClick={() => duyetBai(post.id)} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg">✅ Duyệt</button>
                      <button onClick={() => tuChoiBai(post.id)} className="text-xs bg-yellow-500 text-white px-3 py-1.5 rounded-lg">❌ Từ chối</button>
                    </>}
                    <button onClick={() => xoaBai(post.id)} className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg">🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Listings Tab */}
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
                <button onClick={() => xoaListing(item.id)} className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg">🗑️ Xóa</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}