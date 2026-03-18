'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { useTheme } from '@/lib/useTheme'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ProfilePage() {
  const { getBgStyle } = useTheme()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>({
    full_name: '', avatar_url: '', phone: '', zalo: '', facebook: '', khu_vuc: '', gioi_thieu: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [tab, setTab] = useState<'profile'|'posts'|'listings'|'password'>('profile')
  const [myPosts, setMyPosts] = useState<any[]>([])
  const [myListings, setMyListings] = useState<any[]>([])
  const [newPassword, setNewPassword] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  useEffect(() => { init() }, [])

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }
    setUser(user)
    const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (p) setProfile(p)
    else {
      // Tao profile moi neu chua co
      await supabase.from('profiles').insert({ id: user.id, full_name: user.user_metadata?.name || '' })
    }
    const { data: posts } = await supabase.from('posts').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    const { data: listings } = await supabase.from('listings').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setMyPosts(posts || [])
    setMyListings(listings || [])
    setLoading(false)
  }

  const saveProfile = async () => {
    setSaving(true)
    const { error } = await supabase.from('profiles').upsert({ ...profile, id: user.id, updated_at: new Date().toISOString() })
    setMsg(error ? '❌ Lỗi lưu thông tin' : '✅ Đã lưu thành công!')
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    const ext = file.name.split('.').pop()
    const path = `avatars/${user.id}.${ext}`
    const { error } = await supabase.storage.from('images').upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('images').getPublicUrl(path)
      setProfile((p: any) => ({ ...p, avatar_url: data.publicUrl }))
    }
    setUploadingAvatar(false)
  }

  const changePassword = async () => {
    if (!newPassword || newPassword.length < 6) { setMsg('❌ Mật khẩu tối thiểu 6 ký tự'); return }
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setMsg(error ? '❌ Lỗi đổi mật khẩu' : '✅ Đổi mật khẩu thành công!')
    setNewPassword('')
    setTimeout(() => setMsg(''), 3000)
  }

  const togglePostVisibility = async (id: string, current: string) => {
    const newStatus = current === 'da_duyet' ? 'an' : 'da_duyet'
    await supabase.from('posts').update({ trang_thai: newStatus }).eq('id', id)
    setMyPosts(prev => prev.map(p => p.id === id ? { ...p, trang_thai: newStatus } : p))
  }

  const deletePost = async (id: string) => {
    if (!confirm('Xóa bài viết này?')) return
    await supabase.from('posts').delete().eq('id', id)
    setMyPosts(prev => prev.filter(p => p.id !== id))
  }

  const toggleListingStatus = async (id: string, current: string) => {
    const newStatus = current === 'con_hang' ? 'het_hang' : 'con_hang'
    await supabase.from('listings').update({ trang_thai: newStatus }).eq('id', id)
    setMyListings(prev => prev.map(l => l.id === id ? { ...l, trang_thai: newStatus } : l))
  }

  const deleteListing = async (id: string) => {
    if (!confirm('Xóa tin đăng này?')) return
    await supabase.from('listings').delete().eq('id', id)
    setMyListings(prev => prev.filter(l => l.id !== id))
  }

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', ...getBgStyle() }}><div style={{ color: '#c8a84b', fontSize: '32px' }}>🌿</div></div>

  const initials = (profile.full_name || user?.email || 'U').slice(0, 2).toUpperCase()

  return (
    <div style={{ minHeight: '100vh', ...getBgStyle(), color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Nav */}
      <nav style={{ padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)' }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#fff' }}>
          ← Dashboard
        </Link>
        <span style={{ fontWeight: 700, fontSize: '16px' }}>⚙️ Cài đặt cá nhân</span>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#2d6b42', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, overflow: 'hidden' }}>
          {profile.avatar_url ? <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="avatar" /> : initials}
        </div>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {[
            { key: 'profile', label: '👤 Thông tin' },
            { key: 'posts', label: `📝 Bài viết (${myPosts.length})` },
            { key: 'listings', label: `🛒 Tin bán (${myListings.length})` },
            { key: 'password', label: '🔒 Mật khẩu' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              style={{ padding: '8px 18px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                background: tab === t.key ? '#c8a84b' : 'rgba(255,255,255,0.1)',
                color: tab === t.key ? '#0e2d1a' : '#fff' }}>
              {t.label}
            </button>
          ))}
        </div>

        {msg && <div style={{ background: msg.includes('✅') ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${msg.includes('✅') ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', fontSize: '14px' }}>{msg}</div>}

        {/* Tab: Thong tin ca nhan */}
        {tab === 'profile' && (
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '24px' }}>
            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#2d6b42', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 700, overflow: 'hidden', border: '3px solid #c8a84b' }}>
                {profile.avatar_url ? <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="avatar" /> : initials}
              </div>
              <div>
                <label style={{ background: '#2d6b42', color: '#fff', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                  {uploadingAvatar ? '⏳ Đang upload...' : '📷 Đổi ảnh đại diện'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={uploadAvatar} disabled={uploadingAvatar} />
                </label>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '6px' }}>{user?.email}</p>
              </div>
            </div>

            {/* Form */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { key: 'full_name', label: 'Tên hiển thị', placeholder: 'Tên của bạn' },
                { key: 'phone', label: 'Số điện thoại', placeholder: '0901234567' },
                { key: 'zalo', label: 'Zalo', placeholder: 'Số Zalo' },
                { key: 'facebook', label: 'Facebook', placeholder: 'Link Facebook' },
                { key: 'khu_vuc', label: 'Khu vực', placeholder: 'VD: Cà Mau, Cần Thơ...' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px', display: 'block' }}>{f.label}</label>
                  <input value={profile[f.key] || ''} onChange={e => setProfile((p: any) => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px', display: 'block' }}>Giới thiệu bản thân</label>
                <textarea value={profile.gioi_thieu || ''} onChange={e => setProfile((p: any) => ({ ...p, gioi_thieu: e.target.value }))}
                  placeholder="Chia sẻ đôi điều về bạn và niềm đam mê cây cảnh..."
                  rows={3}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
            </div>

            <button onClick={saveProfile} disabled={saving}
              style={{ marginTop: '20px', width: '100%', padding: '14px', background: '#c8a84b', color: '#0e2d1a', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>
              {saving ? '⏳ Đang lưu...' : '💾 Lưu thông tin'}
            </button>
          </div>
        )}

        {/* Tab: Bai viet */}
        {tab === 'posts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {myPosts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📝</div>
                <p>Bạn chưa có bài viết nào</p>
                <Link href="/blog/viet-bai" style={{ color: '#c8a84b', textDecoration: 'none', fontWeight: 600 }}>✍️ Viết bài ngay</Link>
              </div>
            ) : myPosts.map(post => (
              <div key={post.id} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', background: post.trang_thai === 'da_duyet' ? 'rgba(34,197,94,0.2)' : post.trang_thai === 'cho_duyet' ? 'rgba(234,179,8,0.2)' : post.trang_thai === 'an' ? 'rgba(100,116,139,0.3)' : 'rgba(239,68,68,0.2)', color: post.trang_thai === 'da_duyet' ? '#4ade80' : post.trang_thai === 'cho_duyet' ? '#fbbf24' : post.trang_thai === 'an' ? '#94a3b8' : '#f87171' }}>
                        {post.trang_thai === 'da_duyet' ? '✅ Đã duyệt' : post.trang_thai === 'cho_duyet' ? '⏳ Chờ duyệt' : post.trang_thai === 'an' ? '👁 Đã ẩn' : '❌ Từ chối'}
                      </span>
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>👁 {post.luot_xem || 0} · ❤️ {post.luot_thich || 0}</span>
                    </div>
                    <p style={{ fontWeight: 600, fontSize: '14px', margin: 0 }}>{post.tieu_de}</p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{new Date(post.created_at).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <Link href={`/blog/viet-bai?edit=${post.id}`} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', fontSize: '12px', textDecoration: 'none' }}>✏️</Link>
                    {post.trang_thai === 'da_duyet' && (
                      <button onClick={() => togglePostVisibility(post.id, post.trang_thai)}
                        style={{ padding: '6px 12px', background: 'rgba(100,116,139,0.3)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>👁 Ẩn</button>
                    )}
                    {post.trang_thai === 'an' && (
                      <button onClick={() => togglePostVisibility(post.id, post.trang_thai)}
                        style={{ padding: '6px 12px', background: 'rgba(34,197,94,0.2)', color: '#4ade80', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>👁 Hiện</button>
                    )}
                    <button onClick={() => deletePost(post.id)}
                      style={{ padding: '6px 12px', background: 'rgba(239,68,68,0.2)', color: '#f87171', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Tin ban */}
        {tab === 'listings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {myListings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🛒</div>
                <p>Bạn chưa có tin đăng nào</p>
                <Link href="/marketplace/dang-ban" style={{ color: '#c8a84b', textDecoration: 'none', fontWeight: 600 }}>+ Đăng bán ngay</Link>
              </div>
            ) : myListings.map(item => (
              <div key={item.id} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px 20px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  {item.hinh_anh && <img src={item.hinh_anh} style={{ width: '70px', height: '70px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }} alt={item.ten_cay} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', background: item.trang_thai === 'het_hang' ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)', color: item.trang_thai === 'het_hang' ? '#f87171' : '#4ade80' }}>
                        {item.trang_thai === 'het_hang' ? '❌ Hết hàng' : '✅ Còn hàng'}
                      </span>
                    </div>
                    <p style={{ fontWeight: 600, fontSize: '14px', margin: 0 }}>{item.ten_cay}</p>
                    <p style={{ color: '#c8a84b', fontWeight: 700, fontSize: '14px', margin: '4px 0' }}>{Number(item.gia).toLocaleString('vi-VN')}đ</p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>📍 {item.vi_tri}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                    <button onClick={() => toggleListingStatus(item.id, item.trang_thai || 'con_hang')}
                      style={{ padding: '6px 10px', background: item.trang_thai === 'het_hang' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)', color: item.trang_thai === 'het_hang' ? '#4ade80' : '#f87171', border: 'none', borderRadius: '8px', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      {item.trang_thai === 'het_hang' ? '✅ Còn hàng' : '❌ Hết hàng'}
                    </button>
                    <button onClick={() => deleteListing(item.id)}
                      style={{ padding: '6px 10px', background: 'rgba(239,68,68,0.2)', color: '#f87171', border: 'none', borderRadius: '8px', fontSize: '11px', cursor: 'pointer' }}>🗑️ Xóa</button>
                    <Link href={`/marketplace/dang-ban?edit=${item.id}`} style={{ padding: '6px 10px', background: 'rgba(200,168,75,0.2)', color: '#c8a84b', borderRadius: '8px', fontSize: '11px', textDecoration: 'none', display: 'block' }}>✏️ Sửa</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Mat khau */}
        {tab === 'password' && (
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 700 }}>🔒 Đổi mật khẩu</h3>
            <div>
              <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px', display: 'block' }}>Mật khẩu mới</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <button onClick={changePassword}
              style={{ marginTop: '16px', width: '100%', padding: '14px', background: '#c8a84b', color: '#0e2d1a', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>
              🔑 Đổi mật khẩu
            </button>
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/' }}
                style={{ width: '100%', padding: '12px', background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                🚪 Đăng xuất tất cả thiết bị
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
