'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const NAV_LINKS = [
  { label: 'Dashboard',  href: '/dashboard' },
  { label: 'Chẩn đoán', href: '/chan-doan' },
  { label: 'Chợ cây',   href: '/marketplace' },
  { label: 'Hộ chiếu',  href: '/passport' },
  { label: 'Blog',       href: '/blog' },
]

const ACTIONS = [
  { label: 'Chẩn đoán bệnh cây', desc: 'Upload ảnh → AI phân tích & gợi ý thuốc', icon: '📸', href: '/chan-doan' },
  { label: 'Hộ chiếu cây',       desc: 'Lịch sử chăm sóc, QR code minh bạch',     icon: '🪪', href: '/passport' },
  { label: 'Chợ cây kiểng',      desc: 'Mua bán cây với hộ chiếu xác thực',        icon: '🛒', href: '/marketplace' },
  { label: 'Blog & Wiki',         desc: 'Kiến thức cây cảnh từ cộng đồng',          icon: '📚', href: '/blog' },
]

const STATUS_MAP: any = {
  khoe_manh: { label: 'Khỏe mạnh', bg: '#eaf3de', color: '#3b6d11' },
  can_cham:  { label: 'Cần chăm',  bg: '#faeeda', color: '#854f0b' },
  benh:      { label: 'Đang bệnh', bg: '#fcebeb', color: '#a32d2d' },
}

const VISIBILITY_MAP: any = {
  public:   { icon: '👁️' },
  private:  { icon: '🔒' },
  showcase: { icon: '🏪' },
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [passports, setPassports] = useState<any[]>([])
  const [listings, setListings] = useState<number>(0)
  const [banner, setBanner] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { init() }, [])

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    if (user) {
      const [{ data: ps }, { count }, { data: settings }] = await Promise.all([
        supabase.from('passports').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('listings').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('admin_settings').select('*').in('key', ['banner_title', 'banner_content', 'banner_image', 'banner_link'])
      ])
      setPassports(ps || [])
      setListings(count || 0)
      if (settings) {
        const s: any = {}
        settings.forEach((r: any) => s[r.key] = r.value)
        if (s.banner_title) setBanner(s)
      }
    }
    setLoading(false)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'bạn'
  const initials = userName.slice(0, 2).toUpperCase()

  const stats = [
    { label: 'Cây trong vườn',  value: passports.length.toString(), icon: '🪴', accent: '#2d6b42' },
    { label: 'Tin đăng bán',    value: listings.toString(),          icon: '🛒', accent: '#2d6b42' },
    { label: 'Giá trị vườn ảo', value: passports.reduce((s, p) => s + (p.gia_tri_uoc_tinh || 0), 0).toLocaleString('vi-VN') + 'đ', icon: '💰', accent: '#c8a84b' },
    { label: 'Nhắc nhở hôm nay', value: '0', icon: '🔔', accent: '#2d6b42' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--warm-white)' }}>
      {/* Nav */}
      <nav style={{ background: 'var(--forest)', padding: '0 28px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🌿</div>
          <span style={{ color: '#fff', fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 600 }}>Vườn Kiểng AI</span>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '13px', padding: '6px 14px', borderRadius: '20px' }}>{link.label}</Link>
          ))}
        </div>
        {/* Avatar + Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--forest-light)', border: '2px solid var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '13px', fontWeight: 500 }}>
            {initials}
          </div>
          <button onClick={logout} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '20px', color: 'rgba(255,255,255,0.7)', fontSize: '12px', padding: '5px 12px', cursor: 'pointer' }}>
            Đăng xuất
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Banner admin */}
        {banner?.banner_title && (
          <div style={{ background: 'linear-gradient(135deg,#2d6b42,#0e2d1a)', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            {banner.banner_image && <img src={banner.banner_image} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px' }} />}
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>{banner.banner_title}</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>{banner.banner_content}</div>
            </div>
            {banner.banner_link && (
              <a href={banner.banner_link} target="_blank" style={{ background: 'var(--gold)', color: '#1a3a22', padding: '8px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                Xem ngay →
              </a>
            )}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '28px' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#eaf3de', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '12px' }}>{s.icon}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', fontWeight: 700, color: s.accent, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 600, color: 'var(--forest)', marginBottom: '16px' }}>Truy cập nhanh</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '32px' }}>
          {ACTIONS.map((a, i) => (
            <Link key={i} href={a.href} style={{ background: i === 0 ? 'linear-gradient(135deg,#2d6b42,#0e2d1a)' : 'var(--forest)', borderRadius: '16px', padding: '24px', textDecoration: 'none', display: 'block', position: 'relative' }}>
              <div style={{ fontSize: '28px', marginBottom: '14px' }}>{a.icon}</div>
              <div style={{ position: 'absolute', top: '20px', right: '20px', color: 'rgba(255,255,255,0.3)', fontSize: '18px' }}>↗</div>
              <div style={{ color: '#fff', fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>{a.label}</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px', lineHeight: 1.5 }}>{a.desc}</div>
            </Link>
          ))}
        </div>

        {/* Vườn của bạn */}
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 600, color: 'var(--forest)', marginBottom: '16px' }}>Vườn của bạn</p>
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>Đang tải...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
              {passports.map((p, i) => {
                const st = STATUS_MAP[p.trang_thai] || STATUS_MAP.khoe_manh
                const vis = VISIBILITY_MAP[p.visibility_mode] || VISIBILITY_MAP.public
                return (
                  <Link key={i} href="/passport" style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', textDecoration: 'none', display: 'block', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '14px' }}>{vis.icon}</div>
                    {p.hinh_anh ? (
                      <img src={p.hinh_anh} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }} />
                    ) : (
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>🌳</div>
                    )}
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '14px', fontWeight: 600, color: 'var(--forest)' }}>{p.ten_cay}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {p.tuoi_cay && `${p.tuoi_cay} · `}{p.xuat_xu || ''}
                    </div>
                    <div style={{ marginTop: '8px' }}>
                      <span style={{ background: st.bg, color: st.color, padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 600 }}>{st.label}</span>
                    </div>
                  </Link>
                )
              })}
              <Link href="/passport" style={{ border: '1.5px dashed var(--border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '120px', textDecoration: 'none', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '28px', marginBottom: '6px', color: 'var(--border)' }}>＋</div>
                <div style={{ fontSize: '13px' }}>Thêm cây mới</div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}