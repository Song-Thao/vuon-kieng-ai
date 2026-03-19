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
      supabase.from('listings').select('*').eq('trang_thai', 'dang_ban').order('created_at', { ascending: false }).limit(6),
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a1f0f' }}>
      <div style={{ color: '#c8a84b', fontSize: '48px', animation: 'pulse 1.5s ease-in-out infinite' }}>🌿</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', color: '#fff', fontFamily: "'DM Sans', sans-serif", background: '#0a1f0f', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
        @keyframes shimmer { 0%{background-position:200% center;} 100%{background-position:-200% center;} }
        @keyframes float { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-8px);} }
        .hero-section {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          overflow: hidden;
        }
        .hero-bg {
          position: absolute; inset: 0;
          background-image: url('https://images.unsplash.com/photo-1599598425947-5202edd56bdb?w=1600&q=80');
          background-size: cover;
          background-position: center;
          filter: brightness(0.35) saturate(0.8);
          transform: scale(1.05);
          transition: transform 8s ease;
        }
        .hero-bg-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(10,31,15,0.7) 0%, rgba(10,31,15,0.3) 50%, rgba(10,31,15,0.8) 100%);
        }
        .hero-content { position: relative; z-index: 2; }
        .stat-card {
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(200,168,75,0.25);
          border-radius: 16px;
          padding: 20px 28px;
          text-align: center;
          transition: transform 0.3s, border-color 0.3s;
        }
        .stat-card:hover { transform: translateY(-4px); border-color: rgba(200,168,75,0.5); }
        .feature-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 28px;
          text-decoration: none;
          display: block;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }
        .feature-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #c8a84b, transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .feature-card:hover { background: rgba(255,255,255,0.08); transform: translateY(-4px); border-color: rgba(200,168,75,0.3); }
        .feature-card:hover::before { opacity: 1; }
        .listing-card {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          overflow: hidden;
          text-decoration: none;
          display: block;
          transition: all 0.3s;
        }
        .listing-card:hover { transform: translateY(-6px); border-color: rgba(200,168,75,0.4); box-shadow: 0 20px 60px rgba(0,0,0,0.4); }
        .badge {
          display: inline-block;
          background: rgba(200,168,75,0.15);
          border: 1px solid rgba(200,168,75,0.35);
          color: #c8a84b;
          border-radius: 20px;
          padding: 6px 18px;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 20px;
        }
        .gold-btn {
          background: linear-gradient(135deg, #c8a84b, #e8c86a, #c8a84b);
          background-size: 200% auto;
          color: #0a1f0f;
          padding: 14px 36px;
          border-radius: 30px;
          text-decoration: none;
          font-size: 15px;
          font-weight: 700;
          display: inline-block;
          transition: all 0.3s;
          animation: shimmer 3s linear infinite;
        }
        .gold-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(200,168,75,0.4); }
        .outline-btn {
          background: rgba(255,255,255,0.08);
          color: #fff;
          padding: 14px 36px;
          border-radius: 30px;
          text-decoration: none;
          font-size: 15px;
          font-weight: 600;
          border: 1px solid rgba(255,255,255,0.2);
          display: inline-block;
          transition: all 0.3s;
          backdrop-filter: blur(8px);
        }
        .outline-btn:hover { background: rgba(255,255,255,0.15); transform: translateY(-2px); }
        .section-title {
          font-family: 'Playfair Display', serif;
          font-size: 32px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .tools-panel {
          background: rgba(10,31,15,0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(200,168,75,0.2);
          border-radius: 20px;
          padding: 24px;
          width: 260px;
          flex-shrink: 0;
        }
        .tool-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 12px;
          text-decoration: none;
          color: #fff;
          transition: background 0.2s;
          cursor: pointer;
        }
        .tool-item:hover { background: rgba(255,255,255,0.08); }
        .tool-icon {
          width: 40px; height: 40px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          background: rgba(200,168,75,0.15);
          flex-shrink: 0;
        }
        nav a { transition: color 0.2s; }
        nav a:hover { color: #c8a84b !important; }
        .animate-in { animation: fadeInUp 0.6s ease both; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }
        @media (max-width: 1024px) { .tools-panel { display: none; } }
        @media (max-width: 768px) {
          .hero-grid { flex-direction: column !important; }
          .stats-row { gap: 12px !important; }
          .stat-card { padding: 14px 18px !important; }
          .features-grid { grid-template-columns: repeat(2,1fr) !important; gap: 12px !important; }
          .listings-grid { grid-template-columns: repeat(2,1fr) !important; }
          .posts-grid { grid-template-columns: repeat(1,1fr) !important; }
          .hero-h1 { font-size: 32px !important; }
          .section-title { font-size: 22px !important; }
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        .hidden-mobile { }
        .show-mobile { display: none; }
      `}</style>

      {/* Nav */}
      <nav style={{ padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, background: 'rgba(10,31,15,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg,#2d6b42,#c8a84b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🌿</div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 700, color: '#fff' }}>Vườn Kiểng AI</span>
        </Link>
        <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }} className="hidden-mobile">
          {[
            { href: '/marketplace', label: 'Danh Mục' },
            { href: '/marketplace', label: 'Cây Nổi Bật' },
            { href: '/blog', label: 'Bài Viết Hay' },
            { href: '/chan-doan', label: 'Nghệ Nhân' },
          ].map(item => (
            <Link key={item.href+item.label} href={item.href} style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>{item.label}</Link>
          ))}
          <Link href="/marketplace" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '14px', fontWeight: 500, border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', padding: '6px 16px' }}>
            🌱 Thêm Cây
          </Link>
          <Link href="/login" style={{ background: 'linear-gradient(135deg,#c8a84b,#e8c86a)', color: '#0a1f0f', padding: '8px 22px', borderRadius: '20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>Đăng Tin</Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className="show-mobile">
          <Link href="/login" style={{ background: '#c8a84b', color: '#0a1f0f', padding: '7px 16px', borderRadius: '16px', textDecoration: 'none', fontSize: '13px', fontWeight: 700 }}>Đăng nhập</Link>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div style={{ position: 'fixed', top: '64px', left: 0, right: 0, zIndex: 199, background: 'rgba(10,31,15,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '8px 0' }} className="show-mobile">
          {[
            { href: '/marketplace', label: '🛒 Chợ cây' },
            { href: '/blog', label: '📚 Blog & Wiki' },
            { href: '/chan-doan', label: '🔬 Chẩn đoán AI' },
            { href: '/phai-dinh-huong', label: '✂️ Định hướng phôi' },
            { href: '/huong-dan', label: '📖 Hướng dẫn' },
          ].map(item => (
            <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
              style={{ display: 'block', padding: '14px 28px', color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {item.label}
            </Link>
          ))}
        </div>
      )}

      {/* HERO */}
      <div className="hero-section" style={{ paddingTop: '64px' }}>
        <div className="hero-bg" />
        <div className="hero-bg-overlay" />
        <div className="hero-content" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '80px 32px' }}>
          <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }} className="hero-grid">
            {/* Left content */}
            <div style={{ flex: 1 }}>
              {banner?.banner_title && (
                <div style={{ background: 'rgba(200,168,75,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(200,168,75,0.3)', borderRadius: '16px', padding: '14px 18px', display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '32px', maxWidth: '520px' }} className="animate-in">
                  {banner.banner_image && <img src={banner.banner_image} alt="" style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>{banner.banner_title}</div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>{banner.banner_content}</div>
                  </div>
                  {banner.banner_link && <a href={banner.banner_link} style={{ background: '#c8a84b', color: '#0a1f0f', padding: '7px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>Xem →</a>}
                </div>
              )}

              <div className="badge animate-in delay-1">🌿 Chợ bonsai & cây cảnh toàn quốc</div>

              <h1 className="hero-h1 animate-in delay-2" style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(36px,5vw,64px)', fontWeight: 900, lineHeight: 1.1, marginBottom: '20px', marginTop: '8px' }}>
                Vườn Kiểng AI<br />
                <span style={{ background: 'linear-gradient(135deg,#c8a84b,#f0d080)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Chợ bonsai & cây cảnh toàn quốc
                </span>
              </h1>

              <p className="animate-in delay-3" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '17px', lineHeight: 1.75, marginBottom: '36px', maxWidth: '480px' }}>
                AI chẩn đoán bệnh cây · Hộ chiếu điện tử minh bạch<br />
                Chợ cây xác thực · Wiki cây cảnh từ cộng đồng
              </p>

              <div className="animate-in delay-4" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '48px' }}>
                <a href="/marketplace" className="gold-btn">Khám phá cây →</a>
                <a href="/login" className="outline-btn">🌱 Đăng bản ngay</a>
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }} className="stats-row animate-in delay-4">
                {[
                  { value: '500+', label: 'Cây cảnh đẹp' },
                  { value: stats.cay + '+', label: 'Người tham gia' },
                  { value: stats.tin_ban + '+', label: 'Tin đăng nổi bật' },
                ].map((s, i) => (
                  <div key={i} className="stat-card">
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 700, color: '#c8a84b' }}>{s.value}</div>
                    <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px', marginTop: '4px' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right tools panel */}
            <div className="tools-panel">
              <div style={{ color: '#c8a84b', fontWeight: 700, fontSize: '15px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                💎 Công Cụ Hữu Ích
              </div>
              {[
                { icon: '🤖', title: 'Tạo Tiêu Đề AI', desc: 'Tạo tiêu đề hấp dẫn cho cây của bạn', href: '/chan-doan' },
                { icon: '🌿', title: 'Mô Tả Cây AI', desc: 'Viết mô tả chi tiết với AI phân tích', href: '/chan-doan' },
                { icon: '📅', title: 'Lịch Trưng Bày Sự Kiện', desc: 'Xem lịch triển lãm bonsai toàn quốc', href: '/blog' },
                { icon: '💬', title: 'Chat Bot', desc: 'Hỏi đáp về cây cảnh 24/7 với AI', href: '/chan-doan' },
              ].map((tool, i) => (
                <Link key={i} href={tool.href} className="tool-item" style={{ textDecoration: 'none' }}>
                  <div className="tool-icon">{tool.icon}</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '2px' }}>{tool.title}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>{tool.desc}</div>
                  </div>
                </Link>
              ))}

              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '10px' }}>👨‍🎨 Nghệ Nhân & Nhà Vườn</div>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#2d6b42,#c8a84b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🌿</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>Cộng đồng yêu cây</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>Tham gia ngay hôm nay</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', opacity: 0.5 }}>
          <div style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, transparent, #c8a84b)' }} />
          <div style={{ fontSize: '11px', color: '#c8a84b', letterSpacing: '2px' }}>KHÁM PHÁ</div>
        </div>
      </div>

      {/* Features */}
      <div style={{ background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '60px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div className="badge">✨ Tính năng nổi bật</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '36px', fontWeight: 700, margin: '8px 0' }}>Tất cả trong một nền tảng</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }} className="features-grid">
            {[
              { icon: '🔬', title: 'AI Chẩn đoán', desc: 'Upload ảnh → AI phân tích bệnh & gợi ý thuốc ngay lập tức', href: '/chan-doan', color: '#3b82f6' },
              { icon: '🪪', title: 'Hộ chiếu cây', desc: 'Lịch sử chăm sóc, giải thưởng, QR code — minh bạch 100%', href: '/passport', color: '#10b981' },
              { icon: '🛒', title: 'Chợ cây kiểng', desc: 'Mua bán với hộ chiếu xác thực, 5 ảnh + video đầy đủ', href: '/marketplace', color: '#f59e0b' },
              { icon: '📚', title: 'Wiki cây cảnh', desc: 'Kiến thức từ cộng đồng — Bonsai, chăm sóc, bệnh cây', href: '/blog', color: '#8b5cf6' },
              { icon: '✂️', title: 'Định hướng dáng thế', desc: 'AI nghệ nhân gợi ý dáng thế + Bonsai Editor kéo thả', href: '/phai-dinh-huong', color: '#ec4899' },
            ].map((f, i) => (
              <Link key={i} href={f.href} className="feature-card">
                <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: `${f.color}22`, border: `1px solid ${f.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', marginBottom: '16px' }}>{f.icon}</div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>{f.title}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', lineHeight: 1.6 }}>{f.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Cây nổi bật */}
      {listings.length > 0 && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h2 className="section-title">🌿 Cây nổi Bật</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>🔥 {stats.tin_ban} tin đăng đang bán</span>
              <Link href="/marketplace" style={{ color: '#c8a84b', textDecoration: 'none', fontSize: '14px', fontWeight: 600, border: '1px solid rgba(200,168,75,0.3)', padding: '6px 16px', borderRadius: '20px' }}>Xem tất cả →</Link>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }} className="listings-grid">
            {listings.map((item, i) => (
              <Link key={i} href="/marketplace" className="listing-card">
                <div style={{ position: 'relative' }}>
                  {item.hinh_anh
                    ? <img src={item.hinh_anh} alt={item.ten_cay || 'Cây kiểng'} loading="lazy" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '180px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>🌿</div>
                  }
                  <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#c8a84b', color: '#0a1f0f', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '10px' }}>HOT</div>
                  {item.co_video && <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '11px', padding: '3px 8px', borderRadius: '8px' }}>▶ VIDEO</div>}
                </div>
                <div style={{ padding: '16px' }}>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '14px', marginBottom: '8px', lineHeight: 1.4 }}>{item.ten_cay}</div>
                  <div style={{ color: '#c8a84b', fontWeight: 700, fontSize: '16px', marginBottom: '6px' }}>{Number(item.gia).toLocaleString('vi-VN')}đ</div>
                  {item.vi_tri && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>📍 {item.vi_tri}</div>}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: '8px' }}>Xem chi tiết</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Video / Blog */}
      {posts.length > 0 && (
        <div style={{ background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '60px 32px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h2 className="section-title">📚 Bài Viết Mới Nhất</h2>
              <Link href="/blog" style={{ color: '#c8a84b', textDecoration: 'none', fontSize: '14px', fontWeight: 600, border: '1px solid rgba(200,168,75,0.3)', padding: '6px 16px', borderRadius: '20px' }}>Xem tất cả →</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }} className="posts-grid">
              {posts.map((post, i) => (
                <Link key={i} href={`/blog/${post.slug || post.id}`} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', overflow: 'hidden', textDecoration: 'none', display: 'block', transition: 'all 0.3s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,168,75,0.3)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}>
                  {post.hinh_dai_dien
                    ? <img src={post.hinh_dai_dien} alt={post.tieu_de || 'Bài viết'} loading="lazy" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '180px', background: 'linear-gradient(135deg,rgba(45,107,66,0.3),rgba(200,168,75,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>📝</div>
                  }
                  <div style={{ padding: '20px' }}>
                    {post.the_loai && <div style={{ color: '#c8a84b', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '8px' }}>{post.the_loai}</div>}
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '15px', lineHeight: 1.5, marginBottom: '8px' }}>{post.tieu_de}</div>
                    {post.tom_tat && <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', lineHeight: 1.6 }}>{post.tom_tat.slice(0, 100)}...</div>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CTA Banner */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '80px 32px', textAlign: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(45,107,66,0.3) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="badge">🌿 Miễn phí hoàn toàn</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px,4vw,48px)', fontWeight: 700, marginBottom: '16px', marginTop: '8px' }}>Sẵn sàng bắt đầu?</h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '16px', marginBottom: '36px' }}>Miễn phí hoàn toàn · Không cần thẻ tín dụng · Tham gia ngay hôm nay</p>
          <a href="/login" className="gold-btn" style={{ fontSize: '16px', padding: '16px 48px' }}>Tạo tài khoản miễn phí →</a>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '48px 32px', background: 'rgba(0,0,0,0.4)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '32px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#2d6b42,#c8a84b)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🌿</div>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: 700 }}>Vườn Kiểng AI</span>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', lineHeight: 1.8 }}>Nền tảng mua bán, giao lưu và chia sẻ kinh nghiệm cây cảnh Việt Nam</div>
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: '16px', fontSize: '14px', color: '#c8a84b' }}>Tính năng</div>
            {['Chẩn đoán AI', 'Hộ chiếu cây', 'Chợ cây', 'Blog & Wiki'].map(l => (
              <div key={l} style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', marginBottom: '10px', cursor: 'pointer' }}>{l}</div>
            ))}
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: '16px', fontSize: '14px', color: '#c8a84b' }}>Hỗ trợ</div>
            {[{ l: 'Hướng dẫn sử dụng', h: '/huong-dan' }, { l: 'Điều khoản dịch vụ', h: '#' }, { l: 'Chính sách bảo mật', h: '#' }, { l: 'Liên hệ', h: '#' }].map(item => (
              <Link key={item.l} href={item.h} style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', marginBottom: '10px', display: 'block', textDecoration: 'none' }}>{item.l}</Link>
            ))}
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: '16px', fontSize: '14px', color: '#c8a84b' }}>Liên hệ</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', lineHeight: 2 }}>
              📧 khsongthao00@gmail.com<br />
              📍 Cà Mau, Việt Nam<br />
              🌐 vuon-kieng-ai.vercel.app
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '12px', marginTop: '48px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '24px' }}>
          © 2026 Vườn Kiểng AI · Made with 🌿 in Cà Mau
        </div>
      </footer>
    </div>
  )
}