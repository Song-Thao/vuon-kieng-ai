'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { useTheme } from '@/lib/useTheme'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const { theme, getBgStyle } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [checking, setChecking] = useState(true)
  const [listings, setListings] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [banner, setBanner] = useState<any>(null)
  const [stats, setStats] = useState({ cay: 0, tin_ban: 0 })

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) window.location.href = '/dashboard'
      else { setChecking(false); loadData() }
    })
  }, [])

  const loadData = async () => {
    const [{ data: l }, { data: p }, { count: c1 }, { count: c2 }, { data: s }] = await Promise.all([
      supabase.from('listings').select('*').eq('trang_thai', 'dang_ban').order('created_at', { ascending: false }).limit(4),
      supabase.from('posts').select('*').eq('trang_thai', 'da_duyet').order('created_at', { ascending: false }).limit(3),
      supabase.from('listings').select('*', { count: 'exact', head: true }),
      supabase.from('passports').select('*', { count: 'exact', head: true }),
      supabase.from('admin_settings').select('*').in('key', ['banner_title','banner_content','banner_image','banner_link'])
    ])
    setListings(l || [])
    setPosts(p || [])
    setStats({ cay: c2 || 0, tin_ban: c1 || 0 })
    if (s) {
      const obj: any = {}
      s.forEach((r: any) => obj[r.key] = r.value)
      if (obj.banner_title) setBanner(obj)
    }
  }

  if (checking) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', ...getBgStyle() }}>
      <div style={{ color: '#c8a84b', fontSize: '32px' }}>🌿</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', color: '#fff', fontFamily: "'DM Sans', sans-serif", ...getBgStyle() }}>

      {/* Nav */}
      <nav style={{ padding: '0 20px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 100, ...getBgStyle() }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#c8a84b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🌿</div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 700, color: '#fff' }}>Vườn Kiểng AI</span>
        </Link>
        {/* Desktop nav */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }} className="hidden-mobile">
          <Link href="/marketplace" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px' }}>Chợ cây</Link>
          <Link href="/blog" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px' }}>Blog</Link>
          <Link href="/chan-doan" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px' }}>Chẩn đoán AI</Link>
          <Link href="/phai-dinh-huong" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px' }}>✂️ Định hướng</Link>
          <Link href="/huong-dan" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px' }}>📖 Hướng dẫn</Link>
          <Link href="/login" style={{ background: '#2d6b42', color: '#fff', padding: '8px 20px', borderRadius: '20px', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Đăng nhập</Link>
        </div>
        {/* Mobile hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className="show-mobile">
          <Link href="/login" style={{ background: '#2d6b42', color: '#fff', padding: '6px 14px', borderRadius: '16px', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>Đăng nhập</Link>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', padding: '4px' }}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>
      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div style={{ position: 'fixed', top: '60px', left: 0, right: 0, zIndex: 99, background: '#0e2d1a', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '8px 0', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }} className="show-mobile">
          {[
            { href: '/marketplace', label: '🛒 Chợ cây' },
            { href: '/blog', label: '📚 Blog & Wiki' },
            { href: '/chan-doan', label: '🔬 Chẩn đoán AI' },
            { href: '/phai-dinh-huong', label: '✂️ Định hướng phôi' },
            { href: '/huong-dan', label: '📖 Hướng dẫn' },
          ].map(item => (
            <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
              style={{ display: 'block', padding: '12px 24px', color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {item.label}
            </Link>
          ))}
        </div>
      )}

      {/* Banner admin - hiện cho tất cả mọi người */}
      {banner?.banner_title && (
        <div style={{ maxWidth: '1100px', margin: '16px auto 0', padding: '0 24px' }}>
          <div style={{ background: 'linear-gradient(135deg,#2d6b42,#0e2d1a)', borderRadius: '16px', padding: '16px 20px', display: 'flex', gap: '12px', alignItems: 'flex-start', border: '1px solid rgba(200,168,75,0.3)' } } className="banner-wrap" }}>
            {banner.banner_image && <img src={banner.banner_image} alt={banner.banner_title||"Banner"} loading="lazy" decoding="async" className="banner-img" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px', flexShrink: 0 }} />}
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>{banner.banner_title}</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>{banner.banner_content}</div>
            </div>
            {banner.banner_link && (
              <a href={banner.banner_link} style={{ background: '#c8a84b', color: '#0e2d1a', padding: '10px 20px', borderRadius: '20px', fontSize: '14px', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>Xem ngay →</a>
            )}
          </div>
        </div>
      )}

      {/* Hero */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px 50px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: 'rgba(200,168,75,0.15)', border: '1px solid rgba(200,168,75,0.3)', borderRadius: '20px', padding: '6px 16px', fontSize: '13px', color: '#c8a84b', marginBottom: '24px' }}>
          🌿 Nơi buôn bán, giao lưu và chia sẻ kinh nghiệm cây cảnh
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 700, marginBottom: '16px', lineHeight: 1.15 }}>
          Vườn Kiểng AI<br />
          <span style={{ color: '#c8a84b' }}>dành cho người yêu cây cảnh Việt Nam</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '18px', marginBottom: '40px', lineHeight: 1.7 }}>
          AI chẩn đoán bệnh cây · Hộ chiếu điện tử minh bạch<br />
          Chợ cây xác thực · Wiki cây cảnh từ cộng đồng
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '50px' }}>
          <Link href="/login" style={{ background: '#2d6b42', color: '#fff', padding: '14px 32px', borderRadius: '30px', textDecoration: 'none', fontSize: '16px', fontWeight: 700 }}>Bắt đầu miễn phí →</Link>
          <Link href="/chan-doan" style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', padding: '14px 32px', borderRadius: '30px', textDecoration: 'none', fontSize: '16px', border: '1px solid rgba(255,255,255,0.15)' }}>🔬 Chẩn đoán cây ngay</Link>
        </div>
        {/* Stats */}
        <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { value: stats.cay + '+', label: 'Hộ chiếu cây' },
            { value: stats.tin_ban + '+', label: 'Tin đăng bán' },
            { value: '100%', label: 'Miễn phí' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '32px', fontWeight: 700, color: '#c8a84b' }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '50px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px' }} className="feature-grid-4">
          {[
            { icon: '📸', title: 'AI Chẩn đoán', desc: 'Upload ảnh → AI phân tích bệnh & gợi ý thuốc ngay lập tức', href: '/chan-doan' },
            { icon: '🪪', title: 'Hộ chiếu cây', desc: 'Lịch sử chăm sóc, giải thưởng, QR code — minh bạch 100%', href: '/passport' },
            { icon: '🛒', title: 'Chợ cây kiểng', desc: 'Mua bán với hộ chiếu xác thực, 5 ảnh + video đầy đủ', href: '/marketplace' },
            { icon: '📚', title: 'Wiki cây cảnh', desc: 'Kiến thức từ cộng đồng — Bonsai, chăm sóc, bệnh cây', href: '/blog' },
            { icon: '✂️', title: 'Định hướng dáng thế', desc: 'AI nghệ nhân gợi ý dáng thế + Bonsai Editor kéo thả cành — miễn phí', href: '/phai-dinh-huong' },
          ].map((f, i) => (
            <Link key={i} href={f.href} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '28px', border: '1px solid rgba(255,255,255,0.08)', textDecoration: 'none', display: 'block' }}>
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>{f.icon}</div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>{f.title}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', lineHeight: 1.6 }}>{f.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Cây đang bán */}
      {listings.length > 0 && (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '50px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 700 }}>🌿 Cây đang bán</h2>
            <Link href="/marketplace" style={{ color: '#c8a84b', textDecoration: 'none', fontSize: '14px' }}>Xem tất cả →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px' }} className="feature-grid-4">
            {listings.map((item, i) => (
              <Link key={i} href="/marketplace" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.08)', display: 'block' }}>
                {item.hinh_anh ? <img src={item.hinh_anh} alt={item.ten_cay||"Cay kieng"} loading="lazy" decoding="async" style={{ width: '100%', height: '160px', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '160px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>🌿</div>}
                <div style={{ padding: '16px' }}>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '14px', marginBottom: '6px' }}>{item.ten_cay}</div>
                  <div style={{ color: '#c8a84b', fontWeight: 700 }}>{Number(item.gia).toLocaleString('vi-VN')}đ</div>
                  {item.vi_tri && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '4px' }}>📍 {item.vi_tri}</div>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Blog mới nhất */}
      {posts.length > 0 && (
        <div style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '50px 24px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 700 }}>📚 Bài viết mới nhất</h2>
              <Link href="/blog" style={{ color: '#c8a84b', textDecoration: 'none', fontSize: '14px' }}>Xem tất cả →</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }} className="feature-grid-3">
              {posts.map((post, i) => (
                <Link key={i} href={`/blog/${post.slug || post.id}`} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.08)', display: 'block' }}>
                  {post.hinh_dai_dien ? <img src={post.hinh_dai_dien} alt={post.tieu_de||"Bai viet"} loading="lazy" decoding="async" style={{ width: '100%', height: '140px', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '140px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>📝</div>}
                  <div style={{ padding: '16px' }}>
                    <div style={{ color: '#c8a84b', fontSize: '11px', marginBottom: '8px', textTransform: 'uppercase' as const }}>{post.the_loai}</div>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '14px', lineHeight: 1.5 }}>{post.tieu_de}</div>
                    {post.tom_tat && <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', marginTop: '8px', lineHeight: 1.5 }}>{post.tom_tat.slice(0, 80)}...</div>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <div style={{ textAlign: 'center', padding: '70px 24px' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '36px', fontWeight: 700, marginBottom: '16px' }}>Sẵn sàng bắt đầu?</h2>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '16px', marginBottom: '32px' }}>Miễn phí hoàn toàn · Không cần thẻ tín dụng</p>
        <Link href="/login" style={{ background: '#c8a84b', color: '#0e2d1a', padding: '16px 40px', borderRadius: '30px', textDecoration: 'none', fontSize: '16px', fontWeight: 700 }}>Tạo tài khoản miễn phí →</Link>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '40px 32px', background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '32px' }} className="footer-grid">
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>🌿 Vườn Kiểng AI</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', lineHeight: 1.7 }}>Hỗ trợ định hướng, tạo thế bonsai cùng các công cụ và AI phân tích cây</div>
          </div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: '12px', fontSize: '14px' }}>Tính năng</div>
            {['Chẩn đoán AI', 'Hộ chiếu cây', 'Chợ cây', 'Blog & Wiki'].map(l => (
              <div key={l} style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', marginBottom: '8px' }}>{l}</div>
            ))}
          </div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: '12px', fontSize: '14px' }}>Hỗ trợ</div>
            {[{l:'Hướng dẫn sử dụng',h:'/huong-dan'},{l:'Điều khoản dịch vụ',h:'#'},{l:'Chính sách bảo mật',h:'#'},{l:'Liên hệ',h:'#'}].map(item => (
              <Link key={item.l} href={item.h} style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', marginBottom: '8px', display: 'block', textDecoration: 'none' }}>{item.l}</Link>
            ))}
          </div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: '12px', fontSize: '14px' }}>Liên hệ</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', lineHeight: 1.8 }}>
              📧 khsongthao00@gmail.com<br />
              📍 Cà Mau, Việt Nam<br />
              🌐 vuon-kieng-ai.vercel.app
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '12px', marginTop: '40px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
          © 2026 Vườn Kiểng AI · Made with 🌿 in Cà Mau
        </div>
      </footer>
    </div>
  )
}