'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [userDropdown, setUserDropdown] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [banner, setBanner] = useState<any>(null)
  const [stats, setStats] = useState({ cay: 0, tin_ban: 0 })

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user || null)
      setLoading(false)
      loadData()
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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserDropdown(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a1f0f' }}>
      <div style={{ color: '#c8a84b', fontSize: '48px' }}>🌿</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', color: '#fff', fontFamily: "'DM Sans', sans-serif", background: '#0a1f0f', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeInUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
        .hero-section{position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden;}
        .hero-bg{position:absolute;inset:0;background-image:url('https://images.unsplash.com/photo-1599598425947-5202edd56bdb?w=1600&q=80');background-size:cover;background-position:center;filter:brightness(0.32) saturate(0.8);}
        .hero-overlay{position:absolute;inset:0;background:linear-gradient(135deg,rgba(10,31,15,0.8) 0%,rgba(10,31,15,0.25) 55%,rgba(10,31,15,0.85) 100%);}
        .hero-content{position:relative;z-index:2;width:100%;}
        .badge{display:inline-block;background:rgba(200,168,75,0.15);border:1px solid rgba(200,168,75,0.35);color:#c8a84b;border-radius:20px;padding:6px 18px;font-size:13px;font-weight:500;margin-bottom:20px;}
        .gold-btn{background:linear-gradient(135deg,#c8a84b,#e8c86a,#c8a84b);background-size:200% auto;color:#0a1f0f;padding:14px 36px;border-radius:30px;text-decoration:none;font-size:15px;font-weight:700;display:inline-block;transition:all 0.3s;animation:shimmer 3s linear infinite;}
        .gold-btn:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(200,168,75,0.4);}
        .outline-btn{background:rgba(255,255,255,0.08);color:#fff;padding:14px 36px;border-radius:30px;text-decoration:none;font-size:15px;font-weight:600;border:1px solid rgba(255,255,255,0.2);display:inline-block;transition:all 0.3s;}
        .outline-btn:hover{background:rgba(255,255,255,0.15);transform:translateY(-2px);}
        .stat-card{background:rgba(255,255,255,0.08);backdrop-filter:blur(12px);border:1px solid rgba(200,168,75,0.25);border-radius:16px;padding:18px 24px;text-align:center;transition:all 0.3s;}
        .stat-card:hover{transform:translateY(-4px);border-color:rgba(200,168,75,0.5);}
        .feature-card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:28px;text-decoration:none;display:block;transition:all 0.3s;}
        .feature-card:hover{background:rgba(255,255,255,0.08);transform:translateY(-4px);border-color:rgba(200,168,75,0.3);}
        .listing-card{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;text-decoration:none;display:block;transition:all 0.3s;}
        .listing-card:hover{transform:translateY(-6px);border-color:rgba(200,168,75,0.4);box-shadow:0 20px 60px rgba(0,0,0,0.4);}
        .nav-link{color:rgba(255,255,255,0.75);text-decoration:none;font-size:14px;font-weight:500;transition:color 0.2s;white-space:nowrap;}
        .nav-link:hover{color:#c8a84b;}
        .section-title{font-family:'Playfair Display',serif;font-size:28px;font-weight:700;display:flex;align-items:center;gap:10px;}
        .tools-panel{background:rgba(10,31,15,0.88);backdrop-filter:blur(20px);border:1px solid rgba(200,168,75,0.2);border-radius:20px;padding:24px;width:260px;flex-shrink:0;}
        .tool-item{display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;text-decoration:none;color:#fff;transition:background 0.2s;}
        .tool-item:hover{background:rgba(255,255,255,0.08);}
        .tool-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;background:rgba(200,168,75,0.15);flex-shrink:0;}
        .dropdown{position:absolute;top:calc(100% + 10px);right:0;background:#0e2d1a;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:8px;min-width:210px;box-shadow:0 20px 60px rgba(0,0,0,0.6);z-index:300;}
        .dd-item{display:flex;align-items:center;gap:10px;width:100%;padding:10px 14px;color:rgba(255,255,255,0.8);text-decoration:none;font-size:14px;border-radius:10px;border:none;background:none;cursor:pointer;transition:background 0.2s;text-align:left;}
        .dd-item:hover{background:rgba(255,255,255,0.08);color:#fff;}
        .footer-link{color:rgba(255,255,255,0.4);font-size:13px;margin-bottom:10px;display:block;text-decoration:none;transition:color 0.2s;}
        .footer-link:hover{color:#c8a84b;}
        .animate-in{animation:fadeInUp 0.6s ease both;}
        .d1{animation-delay:0.1s}.d2{animation-delay:0.2s}.d3{animation-delay:0.3s}.d4{animation-delay:0.4s}
        @media(max-width:1024px){.tools-panel{display:none!important;}}
        @media(max-width:768px){
          .hero-flex{flex-direction:column!important;}
          .features-grid{grid-template-columns:repeat(2,1fr)!important;gap:12px!important;}
          .listings-grid{grid-template-columns:repeat(2,1fr)!important;}
          .posts-grid{grid-template-columns:1fr!important;}
          .stats-row{gap:10px!important;}
          .hero-h1{font-size:32px!important;}
          .hidden-mobile{display:none!important;}
          .show-mobile{display:flex!important;}
        }
        .hidden-mobile{}.show-mobile{display:none;}
      `}</style>

      <nav style={{ padding:'0 32px', height:'64px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'fixed', top:0, left:0, right:0, zIndex:200, background:'rgba(10,31,15,0.92)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:'10px', textDecoration:'none', flexShrink:0 }}>
          <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'linear-gradient(135deg,#2d6b42,#c8a84b)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>🌿</div>
          <span style={{ fontFamily:"'Playfair Display',serif", fontSize:'17px', fontWeight:700, color:'#fff' }}>Vườn Kiểng AI</span>
        </Link>
        <div style={{ display:'flex', gap:'24px', alignItems:'center' }} className="hidden-mobile">
          <Link href="/marketplace" className="nav-link">🛒 Chợ cây</Link>
          <Link href="/blog" className="nav-link">📚 Blog</Link>
          <Link href="/chan-doan" className="nav-link">🔬 Chẩn đoán AI</Link>
          <Link href="/phai-dinh-huong" className="nav-link">✂️ Định hướng</Link>
          <Link href="/huong-dan" className="nav-link">📖 Hướng dẫn</Link>
          {user ? (
            <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
              <Link href="/marketplace" style={{ color:'rgba(255,255,255,0.85)', textDecoration:'none', fontSize:'14px', fontWeight:600, border:'1px solid rgba(200,168,75,0.4)', borderRadius:'20px', padding:'7px 18px' }} className="nav-link">🌱 Đăng tin</Link>
              <div style={{ position:'relative' }}>
                <div onClick={() => setUserDropdown(!userDropdown)} style={{ width:'36px', height:'36px', borderRadius:'50%', background:'linear-gradient(135deg,#2d6b42,#c8a84b)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', cursor:'pointer', border:'2px solid rgba(200,168,75,0.4)' }}>
                  {user.user_metadata?.avatar_url ? <img src={user.user_metadata.avatar_url} style={{ width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover' }} /> : '🌿'}
                </div>
                {userDropdown && (
                  <div className="dropdown">
                    <div style={{ padding:'10px 14px', borderBottom:'1px solid rgba(255,255,255,0.08)', marginBottom:'6px' }}>
                      <div style={{ fontSize:'13px', fontWeight:600, color:'#fff' }}>{user.user_metadata?.full_name || user.email?.split('@')[0]}</div>
                      <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginTop:'2px' }}>{user.email}</div>
                    </div>
                    <Link href="/dashboard" className="dd-item" onClick={() => setUserDropdown(false)}>📊 Dashboard</Link>
                    <Link href="/passport" className="dd-item" onClick={() => setUserDropdown(false)}>🪪 Hộ chiếu cây</Link>
                    <Link href="/profile" className="dd-item" onClick={() => setUserDropdown(false)}>👤 Hồ sơ</Link>
                    <div style={{ borderTop:'1px solid rgba(255,255,255,0.08)', margin:'6px 0' }} />
                    <button className="dd-item" onClick={handleLogout} style={{ color:'#ff8080' }}>🚪 Đăng xuất</button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link href="/login" style={{ background:'linear-gradient(135deg,#c8a84b,#e8c86a)', color:'#0a1f0f', padding:'8px 22px', borderRadius:'20px', textDecoration:'none', fontSize:'14px', fontWeight:700 }}>Đăng nhập</Link>
          )}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }} className="show-mobile">
          {user
            ? <Link href="/dashboard" style={{ background:'rgba(200,168,75,0.2)', color:'#c8a84b', padding:'7px 14px', borderRadius:'14px', textDecoration:'none', fontSize:'13px', fontWeight:600, border:'1px solid rgba(200,168,75,0.3)' }}>Dashboard</Link>
            : <Link href="/login" style={{ background:'#c8a84b', color:'#0a1f0f', padding:'7px 16px', borderRadius:'14px', textDecoration:'none', fontSize:'13px', fontWeight:700 }}>Đăng nhập</Link>
          }
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background:'none', border:'none', color:'#fff', fontSize:'22px', cursor:'pointer' }}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div style={{ position:'fixed', top:'64px', left:0, right:0, zIndex:199, background:'rgba(10,31,15,0.97)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.08)', padding:'8px 0' }} className="show-mobile">
          {[
            { href:'/marketplace', label:'🛒 Chợ cây' },
            { href:'/blog', label:'📚 Blog & Wiki' },
            { href:'/chan-doan', label:'🔬 Chẩn đoán AI' },
            { href:'/phai-dinh-huong', label:'✂️ Định hướng phôi' },
            { href:'/huong-dan', label:'📖 Hướng dẫn' },
            ...(user ? [
              { href:'/dashboard', label:'📊 Dashboard' },
              { href:'/passport', label:'🪪 Hộ chiếu cây' },
              { href:'/profile', label:'👤 Hồ sơ' },
            ] : []),
          ].map(item => (
            <Link key={item.href+item.label} href={item.href} onClick={() => setMenuOpen(false)}
              style={{ display:'block', padding:'14px 28px', color:'rgba(255,255,255,0.85)', textDecoration:'none', fontSize:'15px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
              {item.label}
            </Link>
          ))}
          {user && <button onClick={handleLogout} style={{ display:'block', width:'100%', padding:'14px 28px', color:'#ff8080', background:'none', border:'none', fontSize:'15px', textAlign:'left', cursor:'pointer' }}>🚪 Đăng xuất</button>}
        </div>
      )}

      <div className="hero-section" style={{ paddingTop:'64px' }}>
        <div className="hero-bg" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'80px 32px' }}>
            <div style={{ display:'flex', gap:'40px', alignItems:'center' }} className="hero-flex">
              <div style={{ flex:1 }}>
                {banner?.banner_title && (
                  <div style={{ background:'rgba(200,168,75,0.12)', backdropFilter:'blur(12px)', border:'1px solid rgba(200,168,75,0.3)', borderRadius:'16px', padding:'14px 18px', display:'flex', gap:'12px', alignItems:'center', marginBottom:'28px', maxWidth:'520px' }} className="animate-in">
                    {banner.banner_image && <img src={banner.banner_image} alt="" style={{ width:'48px', height:'48px', borderRadius:'10px', objectFit:'cover' }} />}
                    <div style={{ flex:1 }}>
                      <div style={{ color:'#fff', fontSize:'14px', fontWeight:600 }}>{banner.banner_title}</div>
                      <div style={{ color:'rgba(255,255,255,0.6)', fontSize:'12px' }}>{banner.banner_content}</div>
                    </div>
                    {banner.banner_link && <a href={banner.banner_link} style={{ background:'#c8a84b', color:'#0a1f0f', padding:'7px 14px', borderRadius:'12px', fontSize:'13px', fontWeight:700, textDecoration:'none', whiteSpace:'nowrap' }}>Xem →</a>}
                  </div>
                )}
                <div className="badge animate-in d1">🌿 Chợ bonsai & cây cảnh toàn quốc</div>
                <h1 className="hero-h1 animate-in d2" style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(36px,5vw,60px)', fontWeight:900, lineHeight:1.1, margin:'12px 0 20px' }}>
                  Vườn Kiểng AI<br />
                  <span style={{ background:'linear-gradient(135deg,#c8a84b,#f0d080)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Chợ bonsai & cây cảnh toàn quốc</span>
                </h1>
                <p className="animate-in d3" style={{ color:'rgba(255,255,255,0.65)', fontSize:'16px', lineHeight:1.8, marginBottom:'32px', maxWidth:'460px' }}>
                  AI chẩn đoán bệnh cây · Hộ chiếu điện tử minh bạch<br />Chợ cây xác thực · Wiki cây cảnh từ cộng đồng
                </p>
                <div className="animate-in d4" style={{ display:'flex', gap:'14px', flexWrap:'wrap', marginBottom:'44px' }}>
                  <Link href="/marketplace" className="gold-btn">Khám phá cây →</Link>
                  {user ? <Link href="/dashboard" className="outline-btn">📊 Vào Dashboard</Link> : <Link href="/login" className="outline-btn">🌱 Đăng bán ngay</Link>}
                </div>
                <div style={{ display:'flex', gap:'14px', flexWrap:'wrap' }} className="stats-row animate-in d4">
                  {[{value:'500+',label:'Cây cảnh đẹp'},{value:stats.cay+'+',label:'Người tham gia'},{value:stats.tin_ban+'+',label:'Tin đăng nổi bật'}].map((s,i)=>(
                    <div key={i} className="stat-card">
                      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'26px', fontWeight:700, color:'#c8a84b' }}>{s.value}</div>
                      <div style={{ color:'rgba(255,255,255,0.5)', fontSize:'12px', marginTop:'4px' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="tools-panel">
                <div style={{ color:'#c8a84b', fontWeight:700, fontSize:'14px', marginBottom:'16px' }}>💎 Công Cụ Hữu Ích</div>
                {[{icon:'🤖',title:'Tạo Tiêu Đề AI',desc:'Tạo tiêu đề hấp dẫn cho cây',href:'/chan-doan'},{icon:'🌿',title:'Mô Tả Cây AI',desc:'Viết mô tả chi tiết với AI',href:'/chan-doan'},{icon:'📅',title:'Lịch Trưng Bày',desc:'Xem lịch triển lãm bonsai',href:'/blog'},{icon:'💬',title:'Chat Bot',desc:'Hỏi đáp cây cảnh 24/7',href:'/chan-doan'}].map((tool,i)=>(
                  <Link key={i} href={tool.href} className="tool-item">
                    <div className="tool-icon">{tool.icon}</div>
                    <div>
                      <div style={{ fontSize:'13px', fontWeight:600, marginBottom:'2px' }}>{tool.title}</div>
                      <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', lineHeight:1.4 }}>{tool.desc}</div>
                    </div>
                  </Link>
                ))}
                <div style={{ marginTop:'16px', paddingTop:'16px', borderTop:'1px solid rgba(255,255,255,0.08)' }}>
                  {user ? (
                    <Link href="/dashboard" style={{ display:'flex', alignItems:'center', gap:'10px', background:'rgba(200,168,75,0.1)', border:'1px solid rgba(200,168,75,0.25)', borderRadius:'12px', padding:'12px', textDecoration:'none', color:'#fff' }}>
                      <div style={{ fontSize:'24px' }}>📊</div>
                      <div><div style={{ fontSize:'13px', fontWeight:600 }}>Vào Dashboard</div><div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)' }}>Quản lý cây của bạn</div></div>
                    </Link>
                  ) : (
                    <Link href="/login" style={{ display:'flex', alignItems:'center', gap:'10px', background:'rgba(200,168,75,0.1)', border:'1px solid rgba(200,168,75,0.25)', borderRadius:'12px', padding:'12px', textDecoration:'none', color:'#fff' }}>
                      <div style={{ fontSize:'24px' }}>🌿</div>
                      <div><div style={{ fontSize:'13px', fontWeight:600 }}>Tham gia cộng đồng</div><div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)' }}>Đăng ký miễn phí ngay</div></div>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background:'rgba(0,0,0,0.25)', borderTop:'1px solid rgba(255,255,255,0.06)', padding:'60px 32px' }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'40px' }}>
            <div className="badge">✨ Tính năng nổi bật</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(24px,3vw,36px)', fontWeight:700, marginTop:'8px' }}>Tất cả trong một nền tảng</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'16px' }} className="features-grid">
            {[{icon:'🔬',title:'AI Chẩn đoán',desc:'Upload ảnh → AI phân tích bệnh & gợi ý thuốc',href:'/chan-doan',color:'#3b82f6'},{icon:'🪪',title:'Hộ chiếu cây',desc:'Lịch sử chăm sóc, giải thưởng, QR code minh bạch',href:'/passport',color:'#10b981'},{icon:'🛒',title:'Chợ cây kiểng',desc:'Mua bán với hộ chiếu xác thực, ảnh & video',href:'/marketplace',color:'#f59e0b'},{icon:'📚',title:'Wiki cây cảnh',desc:'Kiến thức từ cộng đồng — Bonsai, chăm sóc, bệnh',href:'/blog',color:'#8b5cf6'},{icon:'✂️',title:'Định hướng dáng thế',desc:'AI gợi ý dáng thế + Bonsai Editor kéo thả cành',href:'/phai-dinh-huong',color:'#ec4899'}].map((f,i)=>(
              <Link key={i} href={f.href} className="feature-card">
                <div style={{ width:'52px', height:'52px', borderRadius:'16px', background:`${f.color}22`, border:`1px solid ${f.color}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'26px', marginBottom:'16px' }}>{f.icon}</div>
                <div style={{ color:'#fff', fontWeight:700, fontSize:'15px', marginBottom:'8px' }}>{f.title}</div>
                <div style={{ color:'rgba(255,255,255,0.5)', fontSize:'13px', lineHeight:1.6 }}>{f.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {listings.length > 0 && (
        <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'60px 32px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'28px' }}>
            <h2 className="section-title">🌿 Cây Nổi Bật</h2>
            <Link href="/marketplace" style={{ color:'#c8a84b', textDecoration:'none', fontSize:'14px', fontWeight:600, border:'1px solid rgba(200,168,75,0.3)', padding:'6px 16px', borderRadius:'20px' }}>Xem tất cả →</Link>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:'16px' }} className="listings-grid">
            {listings.map((item,i)=>(
              <Link key={i} href="/marketplace" className="listing-card">
                <div style={{ position:'relative' }}>
                  {item.hinh_anh ? <img src={item.hinh_anh} alt={item.ten_cay||'Cây kiểng'} loading="lazy" style={{ width:'100%', height:'180px', objectFit:'cover' }} /> : <div style={{ width:'100%', height:'180px', background:'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'48px' }}>🌿</div>}
                  <div style={{ position:'absolute', top:'10px', left:'10px', background:'#c8a84b', color:'#0a1f0f', fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'10px' }}>HOT</div>
                </div>
                <div style={{ padding:'14px' }}>
                  <div style={{ color:'#fff', fontWeight:600, fontSize:'14px', marginBottom:'6px', lineHeight:1.4 }}>{item.ten_cay}</div>
                  <div style={{ color:'#c8a84b', fontWeight:700, fontSize:'15px', marginBottom:'4px' }}>{Number(item.gia).toLocaleString('vi-VN')}đ</div>
                  {item.vi_tri && <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'12px' }}>📍 {item.vi_tri}</div>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {posts.length > 0 && (
        <div style={{ background:'rgba(0,0,0,0.2)', borderTop:'1px solid rgba(255,255,255,0.06)', padding:'60px 32px' }}>
          <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'28px' }}>
              <h2 className="section-title">📚 Bài Viết Mới Nhất</h2>
              <Link href="/blog" style={{ color:'#c8a84b', textDecoration:'none', fontSize:'14px', fontWeight:600, border:'1px solid rgba(200,168,75,0.3)', padding:'6px 16px', borderRadius:'20px' }}>Xem tất cả →</Link>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'20px' }} className="posts-grid">
              {posts.map((post,i)=>(
                <Link key={i} href={'/blog/'+(post.slug||post.id)} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'20px', overflow:'hidden', textDecoration:'none', display:'block', transition:'all 0.3s' }}
                  onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.transform='translateY(-4px)';el.style.borderColor='rgba(200,168,75,0.3)';}}
                  onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.transform='translateY(0)';el.style.borderColor='rgba(255,255,255,0.08)';}}>
                  {post.hinh_dai_dien ? <img src={post.hinh_dai_dien} alt={post.tieu_de||'Bài viết'} loading="lazy" style={{ width:'100%', height:'180px', objectFit:'cover' }} /> : <div style={{ width:'100%', height:'180px', background:'linear-gradient(135deg,rgba(45,107,66,0.3),rgba(200,168,75,0.1))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'48px' }}>📝</div>}
                  <div style={{ padding:'18px' }}>
                    {post.the_loai && <div style={{ color:'#c8a84b', fontSize:'11px', fontWeight:600, textTransform:'uppercase' as const, letterSpacing:'1px', marginBottom:'8px' }}>{post.the_loai}</div>}
                    <div style={{ color:'#fff', fontWeight:700, fontSize:'15px', lineHeight:1.5, marginBottom:'8px' }}>{post.tieu_de}</div>
                    {post.tom_tat && <div style={{ color:'rgba(255,255,255,0.45)', fontSize:'13px', lineHeight:1.6 }}>{post.tom_tat.slice(0,100)}...</div>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ position:'relative', overflow:'hidden', padding:'80px 32px', textAlign:'center' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at center,rgba(45,107,66,0.25) 0%,transparent 70%)' }} />
        <div style={{ position:'relative', zIndex:1 }}>
          <div className="badge">🌿 Miễn phí hoàn toàn</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(28px,4vw,46px)', fontWeight:700, margin:'12px 0 16px' }}>Sẵn sàng bắt đầu?</h2>
          <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'16px', marginBottom:'36px' }}>Miễn phí hoàn toàn · Không cần thẻ tín dụng</p>
          {user ? <Link href="/dashboard" className="gold-btn" style={{ fontSize:'16px', padding:'16px 48px' }}>Vào Dashboard của bạn →</Link> : <Link href="/login" className="gold-btn" style={{ fontSize:'16px', padding:'16px 48px' }}>Tạo tài khoản miễn phí →</Link>}
        </div>
      </div>

      <footer style={{ borderTop:'1px solid rgba(255,255,255,0.08)', padding:'48px 32px', background:'rgba(0,0,0,0.35)' }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'32px' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px' }}>
              <div style={{ width:'30px', height:'30px', borderRadius:'50%', background:'linear-gradient(135deg,#2d6b42,#c8a84b)', display:'flex', alignItems:'center', justifyContent:'center' }}>🌿</div>
              <span style={{ fontFamily:"'Playfair Display',serif", fontSize:'16px', fontWeight:700 }}>Vườn Kiểng AI</span>
            </div>
            <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'13px', lineHeight:1.8 }}>Nền tảng mua bán, giao lưu và chia sẻ kinh nghiệm cây cảnh Việt Nam</div>
          </div>
          <div>
            <div style={{ fontWeight:700, marginBottom:'14px', fontSize:'13px', color:'#c8a84b', textTransform:'uppercase' as const, letterSpacing:'1px' }}>Tính năng</div>
            {[{l:'🔬 Chẩn đoán AI',h:'/chan-doan'},{l:'🪪 Hộ chiếu cây',h:'/passport'},{l:'🛒 Chợ cây',h:'/marketplace'},{l:'📚 Blog & Wiki',h:'/blog'},{l:'✂️ Định hướng',h:'/phai-dinh-huong'}].map(item=>(
              <Link key={item.l} href={item.h} className="footer-link">{item.l}</Link>
            ))}
          </div>
          <div>
            <div style={{ fontWeight:700, marginBottom:'14px', fontSize:'13px', color:'#c8a84b', textTransform:'uppercase' as const, letterSpacing:'1px' }}>Hỗ trợ</div>
            {[{l:'📖 Hướng dẫn',h:'/huong-dan'},{l:'📋 Điều khoản',h:'#'},{l:'🔒 Bảo mật',h:'#'},{l:'✉️ Liên hệ',h:'#'}].map(item=>(
              <Link key={item.l} href={item.h} className="footer-link">{item.l}</Link>
            ))}
          </div>
          <div>
            <div style={{ fontWeight:700, marginBottom:'14px', fontSize:'13px', color:'#c8a84b', textTransform:'uppercase' as const, letterSpacing:'1px' }}>Liên hệ</div>
            <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'13px', lineHeight:2.2 }}>
              📧 khsongthao00@gmail.com<br />📍 Cà Mau, Việt Nam<br />🌐 vuon-kieng-ai.vercel.app
            </div>
          </div>
        </div>
        <div style={{ textAlign:'center', color:'rgba(255,255,255,0.2)', fontSize:'12px', marginTop:'48px', borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:'24px' }}>
          © 2026 Vườn Kiểng AI · Made with 🌿 in Cà Mau
        </div>
      </footer>
    </div>
  )
}
