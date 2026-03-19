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
  const [orders, setOrders] = useState<any[]>([])  
  const [newOrderAlert, setNewOrderAlert] = useState(false)
  const [listings, setListings] = useState<any[]>([])
  const [tab, setTab] = useState<'posts'|'listings'|'settings'|'orders'>('posts')
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<any>({
    banner_title: '', banner_content: '', banner_image: '', banner_link: '',
    hero_title: 'Vườn Kiểng AI', hero_subtitle: 'Chợ bonsai & cây cảnh toàn quốc', hero_desc: 'AI chẩn đoán bệnh cây · Hộ chiếu điện tử minh bạch · Chợ cây xác thực · Wiki cây cảnh từ cộng đồng', hero_bg_image: '',
    bg_color: '#0e2d1a', bg_image: '', bg_overlay: '0.5', primary_color: '#c8a84b', secondary_color: '#2d6b42',
    bank_name: '', bank_account: '', bank_holder: '', bank_bin: '', momo_number: '',
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
    setUsersCount(Number(ucData?.total) || 0)
    setListings(l || [])
    setLoading(false)
  }

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*, listings(ten_cay, gia)').order('created_at', { ascending: false })
    setOrders(data || [])
  }

  useEffect(() => {
    const channel = supabase.channel('admin-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          setOrders(prev => [payload.new, ...prev])
          setNewOrderAlert(true)
          setTimeout(() => setNewOrderAlert(false), 5000)
        })
      .subscribe()
    fetchOrders()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const confirmOrder = async (id: string) => {
    await supabase.from('orders').update({ trang_thai: 'da_xac_nhan' }).eq('id', id)
    setOrders(prev => prev.map(o => o.id === id ? { ...o, trang_thai: 'da_xac_nhan' } : o))
  }

  const markSold = async (listingId: string, orderId: string) => {
    await supabase.from('listings').update({ trang_thai: 'da_ban' }).eq('id', listingId)
    await supabase.from('orders').update({ trang_thai: 'completed' }).eq('id', orderId)
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, trang_thai: 'completed' } : o))
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

        {newOrderAlert && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2">
          🛒 Có đơn hàng mới!
        </div>
      )}
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
            { key: 'orders', label: `🛒 Đơn hàng ${orders.filter(o=>o.trang_thai==='cho_xac_nhan').length > 0 ? `(${orders.filter(o=>o.trang_thai==='cho_xac_nhan').length})` : ''}` },
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
              <h3 className="font-bold text-gray-800 mb-4">🏠 Nội dung Trang Chủ (Hero)</h3>
              <div className="space-y-3 mb-6 pb-6 border-b">
                {[
                  { key: 'hero_title', label: 'Tiêu đề lớn', ph: 'VD: Vườn Kiểng AI' },
                  { key: 'hero_subtitle', label: 'Tiêu đề phụ (màu vàng)', ph: 'VD: Chợ bonsai & cây cảnh toàn quốc' },
                  { key: 'hero_desc', label: 'Mô tả ngắn', ph: 'VD: AI chẩn đoán bệnh cây · Hộ chiếu điện tử...' },
                  { key: 'hero_bg_image', label: '🖼️ Ảnh nền Hero (URL)', ph: 'https://...jpg hoặc để trống dùng ảnh mặc định' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-sm text-gray-500">{f.label}</label>
                    <input className="w-full border rounded-lg p-2 mt-1 text-sm"
                      placeholder={f.ph}
                      value={settings[f.key] || ''}
                      onChange={e => setSettings({ ...settings, [f.key]: e.target.value })} />
                  </div>
                ))}
                {settings.hero_bg_image && <img src={settings.hero_bg_image} className="mt-2 rounded-lg h-24 w-full object-cover" alt="hero preview" />}
              </div>
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
                {/* Bank info */}
                <div className="border-t pt-4 mt-2">
                  <p className="text-sm font-semibold text-gray-700 mb-3">💳 Thông tin thanh toán</p>
                  <div className="space-y-3">
                    {[
                      { key: 'bank_name', label: 'Tên ngân hàng', ph: 'Agribank' },
                      { key: 'bank_account', label: 'Số tài khoản', ph: '7207205286010' },
                      { key: 'bank_holder', label: 'Tên chủ TK', ph: 'NGUYEN CHI VUNG' },
                      { key: 'bank_bin', label: 'BIN ngân hàng (VietQR)', ph: '970405' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="text-xs text-gray-500">{f.label}</label>
                        <input className="w-full border rounded-lg p-2 mt-1 text-sm"
                          placeholder={f.ph}
                          value={settings[f.key] || ''}
                          onChange={e => setSettings({ ...settings, [f.key]: e.target.value })} />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">🖼️ Ảnh banner</label>
                  <div className="flex gap-2 mt-1">
                    <input className="flex-1 border rounded-lg p-2 text-sm" placeholder="Dán URL ảnh hoặc upload..."
                      value={settings.banner_image||''} onChange={e=>setSettings({...settings,banner_image:e.target.value})} />
                    <label className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm cursor-pointer hover:bg-green-700">
                      📁 Upload
                      <input type="file" accept="image/*" className="hidden" onChange={async e => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const ext = file.name.split('.').pop()
                        const path = `banner/${Date.now()}.${ext}`
                        const { data, error } = await supabase.storage.from('images').upload(path, file, { upsert: true })
                        if (!error) {
                          const { data: urlData } = supabase.storage.from('images').getPublicUrl(path)
                          setSettings(s => ({...s, banner_image: urlData.publicUrl}))
                        }
                      }} />
                    </label>
                  </div>
                  {settings.banner_image && <img src={settings.banner_image} className="mt-2 rounded-lg h-20 object-cover" alt="banner preview" />}
                </div>
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
        {tab === 'orders' && (
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="text-center py-10 text-gray-400">Chưa có đơn hàng nào</div>
            ) : orders.map(order => (
              <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${order.trang_thai === 'completed' ? 'bg-green-100 text-green-700' : order.trang_thai === 'da_xac_nhan' ? 'bg-blue-100 text-blue-700' : order.trang_thai === 'cho_xac_nhan' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                        {order.trang_thai === 'completed' ? '✅ Hoàn thành' : order.trang_thai === 'da_xac_nhan' ? '🚚 Đã xác nhận' : order.trang_thai === 'cho_xac_nhan' ? '⏳ Chờ xác nhận' : '📋 Mới'}
                      </span>
                      <span className="text-xs text-gray-400">{order.phuong_thuc === 'chuyen_khoan' ? '🏦 CK' : '🚚 COD'}</span>
                    </div>
                    <p className="font-semibold text-gray-800">{order.listings?.ten_cay}</p>
                    <p className="text-sm text-gray-600">👤 {order.ten_nguoi_mua} · 📞 {order.sdt}</p>
                    <p className="text-sm text-gray-500">📍 {order.dia_chi}</p>
                    <p className="text-sm font-bold text-green-700">{Number(order.gia).toLocaleString('vi-VN')}đ {order.phan_tram_coc > 0 && `· Cọc ${order.phan_tram_coc}% = ${Number(order.so_tien_coc).toLocaleString('vi-VN')}đ`}</p>
                    <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString('vi-VN')}</p>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    {order.trang_thai === 'cho_xac_nhan' && (
                      <button onClick={() => confirmOrder(order.id)} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg">✅ Xác nhận</button>
                    )}
                    {order.trang_thai === 'da_xac_nhan' && (
                      <button onClick={() => markSold(order.listing_id, order.id)} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg">🎉 Đã bán</button>
                    )}
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
                <button onClick={() => xoaListing(item.id)} className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg">🗑️ Xóa</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}