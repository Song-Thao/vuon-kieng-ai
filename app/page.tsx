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
  const [stats, setStats] = useState({ cay: 0, tin_ban: 0 })
  const [cfg, setCfg] = useState<any>({
    banner_title:'', banner_content:'', banner_image:'', banner_link:'',
    hero_title:'Vườn Kiểng AI', hero_subtitle:'Chợ bonsai & cây cảnh toàn quốc',
    hero_desc:'AI chẩn đoán bệnh cây · Hộ chiếu điện tử minh bạch · Chợ cây xác thực · Wiki cây cảnh từ cộng đồng',
    hero_bg_image:'', bg_overlay:'0.35',
    contact_phone:'', contact_zalo:'', contact_facebook:'', contact_tax:''
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user || null)
      setLoading(false)
      loadData()
    })
  }, [])

  const loadData = async () => {
    const [{ data: l }, { data: p }, { count: c1 }, { count: c2 }, { data: s }] = await Promise.all([
      supabase.from('listings').select('*').eq('trang_thai','dang_ban').order('created_at',{ascending:false}).limit(8),
      supabase.from('posts').select('*').eq('trang_thai','da_duyet').order('created_at',{ascending:false}).limit(3),
      supabase.from('listings').select('*',{count:'exact',head:true}),
      supabase.from('passports').select('*',{count:'exact',head:true}),
      supabase.from('admin_settings').select('*')
    ])
    setListings(l || [])
    setPosts(p || [])
    setStats({ cay: c2||0, tin_ban: c1||0 })
    if (s) {
      const obj: any = {}
      s.forEach((r: any) => obj[r.key] = r.value)
      setCfg((prev: any) => ({ ...prev, ...obj }))
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null); setUserDropdown(false)
  }

  const heroBg = cfg.hero_bg_image ||
    'https://images.pexels.com/photos/1302305/pexels-photo-1302305.jpeg?auto=compress&cs=tinysrgb&w=1600'
  const overlayOpacity = parseFloat(cfg.bg_overlay || '0.5')

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0a1f0f'}}>
      <div style={{color:'#c8a84b',fontSize:'48px'}}>🌿</div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',color:'#fff',fontFamily:"'DM Sans',sans-serif",background:'#0a1f0f',overflowX:'hidden'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeInUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
        .hero-section{position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden;}
        .hero-content{position:relative;z-index:2;width:100%;}
        .badge{display:inline-block;background:rgba(200,168,75,0.15);border:1px solid rgba(200,168,75,0.35);color:#c8a84b;border-radius:20px;padding:6px 18px;font-size:13px;font-weight:500;margin-bottom:18px;}
        .gold-btn{background:linear-gradient(135deg,#c8a84b,#e8c86a,#c8a84b);background-size:200% auto;color:#0a1f0f;padding:13px 32px;border-radius:30px;text-decoration:none;font-size:15px;font-weight:700;display:inline-block;transition:all 0.3s;animation:shimmer 3s linear infinite;}
        .gold-btn:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(200,168,75,0.4);}
        .outline-btn{background:rgba(255,255,255,0.08);color:#fff;padding:13px 32px;border-radius:30px;text-decoration:none;font-size:15px;font-weight:600;border:1px solid rgba(255,255,255,0.2);display:inline-block;transition:all 0.3s;}
        .outline-btn:hover{background:rgba(255,255,255,0.15);transform:translateY(-2px);}
        .stat-card{background:rgba(255,255,255,0.08);backdrop-filter:blur(12px);border:1px solid rgba(200,168,75,0.25);border-radius:14px;padding:16px 20px;text-align:center;transition:all 0.3s;}
        .stat-card:hover{transform:translateY(-3px);border-color:rgba(200,168,75,0.5);}
        .tool-card{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px;text-decoration:none;display:flex;align-items:flex-start;gap:14px;transition:all 0.3s;color:#fff;}
        .tool-card:hover{background:rgba(255,255,255,0.09);transform:translateY(-3px);border-color:rgba(200,168,75,0.3);}
        .listing-card{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:18px;overflow:hidden;text-decoration:none;display:block;transition:all 0.3s;}
        .listing-card:hover{transform:translateY(-5px);border-color:rgba(200,168,75,0.4);box-shadow:0 16px 48px rgba(0,0,0,0.4);}
        .nav-link{color:rgba(255,255,255,0.75);text-decoration:none;font-size:14px;font-weight:500;transition:color 0.2s;white-space:nowrap;}
        .nav-link:hover{color:#c8a84b;}
        .section-title{font-family:'Playfair Display',serif;font-size:26px;font-weight:700;display:flex;align-items:center;gap:10px;}
        .dropdown{position:absolute;top:calc(100% + 10px);right:0;background:#0e2d1a;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:8px;min-width:210px;box-shadow:0 20px 60px rgba(0,0,0,0.6);z-index:300;}
        .dd-item{display:flex;align-items:center;gap:10px;width:100%;padding:10px 14px;color:rgba(255,255,255,0.8);text-decoration:none;font-size:14px;border-radius:10px;border:none;background:none;cursor:pointer;transition:background 0.2s;text-align:left;}
        .dd-item:hover{background:rgba(255,255,255,0.08);color:#fff;}
        .footer-link{color:rgba(255,255,255,0.4);font-size:13px;margin-bottom:10px;display:block;text-decoration:none;transition:color 0.2s;}
        .footer-link:hover{color:#c8a84b;}
        .ai{animation:fadeInUp 0.55s ease both;}
        .d1{animation-delay:.1s}.d2{animation-delay:.2s}.d3{animation-delay:.3s}.d4{animation-delay:.4s}
        @media(max-width:1100px){.right-panel{display:none!important;}}
        @media(max-width:768px){
          .hero-flex{flex-direction:column!important;}
          .listings-grid{grid-template-columns:repeat(2,1fr)!important;}
          .posts-grid{grid-template-columns:1fr!important;}
          .tools-grid{grid-template-columns:1fr!important;}
          .stats-row{gap:8px!important;}
          .hero-h1{font-size:30px!important;}
          .hidden-mobile{display:none!important;}
          .show-mobile{display:flex!important;}
        }
        .hidden-mobile{}.show-mobile{display:none;}
      `}</style>

      {/* NAV */}
      <nav style={{padding:'0 28px',height:'64px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'fixed',top:0,left:0,right:0,zIndex:200,background:'rgba(10,31,15,0.92)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:'10px',textDecoration:'none',flexShrink:0}}>
          <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'linear-gradient(135deg,#2d6b42,#c8a84b)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>🌿</div>
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:'17px',fontWeight:700,color:'#fff'}}>Vườn Kiểng AI</span>
        </Link>
        <div style={{display:'flex',gap:'20px',alignItems:'center'}} className="hidden-mobile">
          <Link href="/marketplace" className="nav-link">🛒 Chợ cây</Link>
          <Link href="/blog" className="nav-link">📚 Blog</Link>
          <Link href="/chan-doan" className="nav-link">🔬 Chẩn đoán AI</Link>
          <Link href="/phai-dinh-huong" className="nav-link">✂️ Định hướng</Link>
          <Link href="/huong-dan" className="nav-link">📖 Hướng dẫn</Link>
          {user ? (
            <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
              <Link href="/marketplace" style={{color:'rgba(255,255,255,0.85)',textDecoration:'none',fontSize:'14px',fontWeight:600,border:'1px solid rgba(200,168,75,0.4)',borderRadius:'20px',padding:'7px 16px'}} className="nav-link">🌱 Đăng tin</Link>
              <div style={{position:'relative'}}>
                <div onClick={()=>setUserDropdown(!userDropdown)} style={{width:'36px',height:'36px',borderRadius:'50%',background:'linear-gradient(135deg,#2d6b42,#c8a84b)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',cursor:'pointer',border:'2px solid rgba(200,168,75,0.4)'}}>
                  {user.user_metadata?.avatar_url?<img src={user.user_metadata.avatar_url} style={{width:'100%',height:'100%',borderRadius:'50%',objectFit:'cover'}}/>:'🌿'}
                </div>
                {userDropdown&&(
                  <div className="dropdown">
                    <div style={{padding:'10px 14px',borderBottom:'1px solid rgba(255,255,255,0.08)',marginBottom:'6px'}}>
                      <div style={{fontSize:'13px',fontWeight:600,color:'#fff'}}>{user.user_metadata?.full_name||user.email?.split('@')[0]}</div>
                      <div style={{fontSize:'11px',color:'rgba(255,255,255,0.4)',marginTop:'2px'}}>{user.email}</div>
                    </div>
                    <Link href="/dashboard" className="dd-item" onClick={()=>setUserDropdown(false)}>📊 Dashboard</Link>
                    <Link href="/passport" className="dd-item" onClick={()=>setUserDropdown(false)}>🪪 Hộ chiếu cây</Link>
                    <Link href="/profile" className="dd-item" onClick={()=>setUserDropdown(false)}>👤 Hồ sơ</Link>
                    <div style={{borderTop:'1px solid rgba(255,255,255,0.08)',margin:'6px 0'}}/>
                    <button className="dd-item" onClick={handleLogout} style={{color:'#ff8080'}}>🚪 Đăng xuất</button>
                  </div>
                )}
              </div>
            </div>
          ):(
            <Link href="/login" style={{background:'linear-gradient(135deg,#c8a84b,#e8c86a)',color:'#0a1f0f',padding:'8px 22px',borderRadius:'20px',textDecoration:'none',fontSize:'14px',fontWeight:700}}>Đăng nhập</Link>
          )}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}} className="show-mobile">
          {user
            ?<Link href="/dashboard" style={{background:'rgba(200,168,75,0.2)',color:'#c8a84b',padding:'7px 14px',borderRadius:'14px',textDecoration:'none',fontSize:'13px',fontWeight:600,border:'1px solid rgba(200,168,75,0.3)'}}>Dashboard</Link>
            :<Link href="/login" style={{background:'#c8a84b',color:'#0a1f0f',padding:'7px 16px',borderRadius:'14px',textDecoration:'none',fontSize:'13px',fontWeight:700}}>Đăng nhập</Link>
          }
          <button onClick={()=>setMenuOpen(!menuOpen)} style={{background:'none',border:'none',color:'#fff',fontSize:'22px',cursor:'pointer'}}>{menuOpen?'✕':'☰'}</button>
        </div>
      </nav>

      {menuOpen&&(
        <div style={{position:'fixed',top:'64px',left:0,right:0,zIndex:199,background:'rgba(10,31,15,0.97)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'8px 0'}} className="show-mobile">
          {[
            {href:'/marketplace',label:'🛒 Chợ cây'},
            {href:'/blog',label:'📚 Blog & Wiki'},
            {href:'/chan-doan',label:'🔬 Chẩn đoán AI'},
            {href:'/phai-dinh-huong',label:'✂️ Định hướng phôi'},
            {href:'/huong-dan',label:'📖 Hướng dẫn'},
            ...(user?[{href:'/dashboard',label:'📊 Dashboard'},{href:'/passport',label:'🪪 Hộ chiếu cây'},{href:'/profile',label:'👤 Hồ sơ'}]:[]),
          ].map(item=>(
            <Link key={item.href+item.label} href={item.href} onClick={()=>setMenuOpen(false)}
              style={{display:'block',padding:'14px 28px',color:'rgba(255,255,255,0.85)',textDecoration:'none',fontSize:'15px',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
              {item.label}
            </Link>
          ))}
          {user&&<button onClick={handleLogout} style={{display:'block',width:'100%',padding:'14px 28px',color:'#ff8080',background:'none',border:'none',fontSize:'15px',textAlign:'left',cursor:'pointer'}}>🚪 Đăng xuất</button>}
        </div>
      )}

      {/* HERO */}
      <div className="hero-section" style={{paddingTop:'64px'}}>
        <div style={{position:'absolute',inset:0,backgroundImage:`url('${heroBg}')`,backgroundSize:'cover',backgroundPosition:'center',filter:`brightness(0.5) saturate(0.9)`}}/>
        <div style={{position:'absolute',inset:0,background:`linear-gradient(135deg,rgba(10,31,15,${overlayOpacity*0.9}) 0%,rgba(10,31,15,${overlayOpacity*0.3}) 50%,rgba(10,31,15,${overlayOpacity*0.9}) 100%)`}}/>
        <div className="hero-content">
          <div style={{maxWidth:'1280px',margin:'0 auto',padding:'70px 28px'}}>
            {/* Banner admin */}
            {cfg.banner_title&&(
              <div style={{background:'rgba(200,168,75,0.12)',backdropFilter:'blur(12px)',border:'1px solid rgba(200,168,75,0.3)',borderRadius:'16px',padding:'14px 18px',display:'flex',gap:'12px',alignItems:'center',marginBottom:'28px',maxWidth:'700px'}} className="ai">
                {cfg.banner_image&&<img src={cfg.banner_image} alt="" style={{width:'48px',height:'48px',borderRadius:'10px',objectFit:'cover'}}/>}
                <div style={{flex:1}}>
                  <div style={{color:'#fff',fontSize:'14px',fontWeight:600}}>{cfg.banner_title}</div>
                  <div style={{color:'rgba(255,255,255,0.6)',fontSize:'12px'}}>{cfg.banner_content}</div>
                </div>
                {cfg.banner_link&&<a href={cfg.banner_link} style={{background:'#c8a84b',color:'#0a1f0f',padding:'7px 14px',borderRadius:'12px',fontSize:'13px',fontWeight:700,textDecoration:'none',whiteSpace:'nowrap'}}>Xem →</a>}
              </div>
            )}

            <div style={{display:'flex',gap:'40px',alignItems:'flex-start'}} className="hero-flex">
              {/* LEFT - Hero text */}
              <div style={{flex:1,minWidth:0}}>
                <div className="badge ai d1">🌿 Nền tảng cây cảnh số 1 Việt Nam</div>
                <h1 className="hero-h1 ai d2" style={{fontFamily:"'Playfair Display',serif",fontSize:'clamp(22px,3vw,42px)',fontWeight:900,lineHeight:1.1,margin:'8px 0 18px'}}>
                  {cfg.hero_title||'Vườn Kiểng AI'}<br/>
                  <span style={{background:'linear-gradient(135deg,#c8a84b,#f0d080)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
                    {cfg.hero_subtitle||'Chợ bonsai & cây cảnh toàn quốc'}
                  </span>
                </h1>
                <p className="ai d3" style={{color:'rgba(255,255,255,0.65)',fontSize:'15px',lineHeight:1.8,marginBottom:'28px',maxWidth:'480px'}}>
                  {cfg.hero_desc||'AI chẩn đoán bệnh cây · Hộ chiếu điện tử minh bạch · Chợ cây xác thực · Wiki cây cảnh từ cộng đồng'}
                </p>
                <div className="ai d4" style={{display:'flex',gap:'12px',flexWrap:'wrap',marginBottom:'36px'}}>
                  <Link href="/marketplace" className="gold-btn">🛒 Khám phá cây →</Link>
                  {user?<Link href="/dashboard" className="outline-btn">📊 Dashboard</Link>:<Link href="/login" className="outline-btn">🌱 Đăng bán ngay</Link>}
                </div>
                {/* Stats */}
                <div style={{display:'flex',gap:'12px',flexWrap:'wrap'}} className="stats-row ai d4">
                  {[
                    {value:'500+',label:'Cây cảnh đẹp'},
                    {value:stats.cay+'+',label:'Người tham gia'},
                    {value:stats.tin_ban+'+',label:'Tin đăng bán'},
                    {value:'100%',label:'Miễn phí'},
                  ].map((s,i)=>(
                    <div key={i} className="stat-card">
                      <div style={{fontFamily:"'Playfair Display',serif",fontSize:'24px',fontWeight:700,color:'#c8a84b'}}>{s.value}</div>
                      <div style={{color:'rgba(255,255,255,0.5)',fontSize:'12px',marginTop:'3px'}}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT - Công cụ thật + Tin bán nổi bật */}
              <div className="right-panel" style={{width:'320px',flexShrink:0,display:'flex',flexDirection:'column',gap:'12px'}}>
                {/* Công cụ thật */}
                <div style={{background:'rgba(10,31,15,0.85)',backdropFilter:'blur(20px)',border:'1px solid rgba(200,168,75,0.2)',borderRadius:'20px',padding:'20px'}}>
                  <div style={{color:'#c8a84b',fontWeight:700,fontSize:'14px',marginBottom:'14px'}}>💎 Công Cụ Hữu Ích</div>
                  {[
                    {icon:'🔬',title:'AI Chẩn đoán bệnh',desc:'Upload ảnh → phân tích ngay',href:'/chan-doan',color:'#3b82f6'},
                    {icon:'🪪',title:'Hộ chiếu cây',desc:'QR code · lịch sử · giải thưởng',href:'/passport',color:'#10b981'},
                    {icon:'✂️',title:'Định hướng dáng thế',desc:'AI gợi ý + Bonsai Editor',href:'/phai-dinh-huong',color:'#ec4899'},
                    {icon:'📚',title:'Wiki cây cảnh',desc:'Kiến thức từ cộng đồng',href:'/blog',color:'#8b5cf6'},
                  ].map((tool,i)=>(
                    <Link key={i} href={tool.href} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px',borderRadius:'12px',textDecoration:'none',color:'#fff',transition:'background 0.2s',marginBottom:'4px'}}
                      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.07)'}
                      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                      <div style={{width:'38px',height:'38px',borderRadius:'10px',background:`${tool.color}22`,border:`1px solid ${tool.color}44`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',flexShrink:0}}>{tool.icon}</div>
                      <div>
                        <div style={{fontSize:'13px',fontWeight:600,marginBottom:'1px'}}>{tool.title}</div>
                        <div style={{fontSize:'11px',color:'rgba(255,255,255,0.4)'}}>{tool.desc}</div>
                      </div>
                    </Link>
                  ))}
                  <Link href="/marketplace" style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px',borderRadius:'12px',textDecoration:'none',color:'#fff',transition:'background 0.2s'}}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.07)'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                    <div style={{width:'38px',height:'38px',borderRadius:'10px',background:'#f59e0b22',border:'1px solid #f59e0b44',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',flexShrink:0}}>🛒</div>
                    <div>
                      <div style={{fontSize:'13px',fontWeight:600,marginBottom:'1px'}}>Chợ cây kiểng</div>
                      <div style={{fontSize:'11px',color:'rgba(255,255,255,0.4)'}}>Mua bán · hộ chiếu xác thực</div>
                    </div>
                  </Link>
                </div>

                {/* Tin bán mới nhất - preview 2 cái */}
                {listings.length > 0 && (
                  <div style={{background:'rgba(10,31,15,0.85)',backdropFilter:'blur(20px)',border:'1px solid rgba(200,168,75,0.2)',borderRadius:'20px',padding:'16px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
                      <div style={{color:'#c8a84b',fontWeight:700,fontSize:'13px'}}>🌿 Tin bán mới nhất</div>
                      <Link href="/marketplace" style={{color:'rgba(255,255,255,0.5)',fontSize:'11px',textDecoration:'none'}}>Xem tất cả →</Link>
                    </div>
                    {listings.slice(0,2).map((item,i)=>(
                      <Link key={i} href="/marketplace" style={{display:'flex',gap:'10px',padding:'8px',borderRadius:'12px',textDecoration:'none',color:'#fff',marginBottom:'6px',transition:'background 0.2s'}}
                        onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.06)'}
                        onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                        {item.hinh_anh?<img src={item.hinh_anh} alt="" style={{width:'52px',height:'52px',borderRadius:'10px',objectFit:'cover',flexShrink:0}}/>:<div style={{width:'52px',height:'52px',borderRadius:'10px',background:'rgba(255,255,255,0.06)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',flexShrink:0}}>🌿</div>}
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:'13px',fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.ten_cay}</div>
                          <div style={{color:'#c8a84b',fontSize:'13px',fontWeight:700}}>{Number(item.gia).toLocaleString('vi-VN')}đ</div>
                          {item.vi_tri&&<div style={{color:'rgba(255,255,255,0.35)',fontSize:'11px'}}>📍{item.vi_tri}</div>}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CÂY NỔI BẬT - full width */}
      {listings.length > 0 && (
        <div style={{maxWidth:'1280px',margin:'0 auto',padding:'56px 28px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
            <h2 className="section-title">🌿 Cây Nổi Bật</h2>
            <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
              <span style={{color:'rgba(255,255,255,0.35)',fontSize:'13px'}}>🔥 {stats.tin_ban} tin đang bán</span>
              <Link href="/marketplace" style={{color:'#c8a84b',textDecoration:'none',fontSize:'14px',fontWeight:600,border:'1px solid rgba(200,168,75,0.3)',padding:'6px 16px',borderRadius:'20px'}}>Xem tất cả →</Link>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))',gap:'14px'}} className="listings-grid">
            {listings.map((item,i)=>(
              <Link key={i} href="/marketplace" className="listing-card">
                <div style={{position:'relative'}}>
                  {item.hinh_anh?<img src={item.hinh_anh} alt={item.ten_cay||'Cây kiểng'} loading="lazy" style={{width:'100%',height:'175px',objectFit:'cover'}}/>:<div style={{width:'100%',height:'175px',background:'rgba(255,255,255,0.05)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'44px'}}>🌿</div>}
                  <div style={{position:'absolute',top:'8px',left:'8px',background:'#c8a84b',color:'#0a1f0f',fontSize:'10px',fontWeight:700,padding:'3px 8px',borderRadius:'8px'}}>HOT</div>
                  {item.co_video&&<div style={{position:'absolute',top:'8px',right:'8px',background:'rgba(0,0,0,0.65)',color:'#fff',fontSize:'10px',padding:'3px 7px',borderRadius:'7px'}}>▶ Video</div>}
                </div>
                <div style={{padding:'12px'}}>
                  <div style={{color:'#fff',fontWeight:600,fontSize:'13px',marginBottom:'5px',lineHeight:1.4,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{item.ten_cay}</div>
                  <div style={{color:'#c8a84b',fontWeight:700,fontSize:'14px',marginBottom:'3px'}}>{Number(item.gia).toLocaleString('vi-VN')}đ</div>
                  {item.vi_tri&&<div style={{color:'rgba(255,255,255,0.4)',fontSize:'11px'}}>📍{item.vi_tri}</div>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* CÔNG CỤ - desktop full row */}
      <div style={{background:'rgba(0,0,0,0.22)',borderTop:'1px solid rgba(255,255,255,0.06)',padding:'56px 28px'}}>
        <div style={{maxWidth:'1280px',margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:'36px'}}>
            <div className="badge">✨ Tính năng nổi bật</div>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'clamp(22px,3vw,34px)',fontWeight:700,marginTop:'8px'}}>Tất cả trong một nền tảng</h2>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))',gap:'14px'}} className="tools-grid">
            {[
              {icon:'🔬',title:'AI Chẩn đoán',desc:'Upload ảnh → AI phân tích bệnh & gợi ý thuốc ngay lập tức',href:'/chan-doan',color:'#3b82f6'},
              {icon:'🪪',title:'Hộ chiếu cây',desc:'Lịch sử chăm sóc, giải thưởng, QR code — minh bạch 100%',href:'/passport',color:'#10b981'},
              {icon:'🛒',title:'Chợ cây kiểng',desc:'Mua bán với hộ chiếu xác thực, ảnh & video đầy đủ',href:'/marketplace',color:'#f59e0b'},
              {icon:'📚',title:'Wiki cây cảnh',desc:'Kiến thức từ cộng đồng — Bonsai, chăm sóc, bệnh cây',href:'/blog',color:'#8b5cf6'},
              {icon:'✂️',title:'Định hướng dáng thế',desc:'AI gợi ý dáng thế + Bonsai Editor kéo thả cành miễn phí',href:'/phai-dinh-huong',color:'#ec4899'},
            ].map((f,i)=>(
              <Link key={i} href={f.href} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'18px',padding:'24px',textDecoration:'none',display:'block',transition:'all 0.3s'}}
                onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.background='rgba(255,255,255,0.08)';el.style.transform='translateY(-4px)';el.style.borderColor='rgba(200,168,75,0.3)';}}
                onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.background='rgba(255,255,255,0.04)';el.style.transform='translateY(0)';el.style.borderColor='rgba(255,255,255,0.08)';}}>
                <div style={{width:'50px',height:'50px',borderRadius:'14px',background:`${f.color}22`,border:`1px solid ${f.color}44`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px',marginBottom:'14px'}}>{f.icon}</div>
                <div style={{color:'#fff',fontWeight:700,fontSize:'15px',marginBottom:'7px'}}>{f.title}</div>
                <div style={{color:'rgba(255,255,255,0.5)',fontSize:'13px',lineHeight:1.6}}>{f.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* BLOG */}
      {posts.length > 0 && (
        <div style={{maxWidth:'1280px',margin:'0 auto',padding:'56px 28px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
            <h2 className="section-title">📚 Bài Viết Mới Nhất</h2>
            <Link href="/blog" style={{color:'#c8a84b',textDecoration:'none',fontSize:'14px',fontWeight:600,border:'1px solid rgba(200,168,75,0.3)',padding:'6px 16px',borderRadius:'20px'}}>Xem tất cả →</Link>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'18px'}} className="posts-grid">
            {posts.map((post,i)=>(
              <Link key={i} href={'/blog/'+(post.slug||post.id)} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'18px',overflow:'hidden',textDecoration:'none',display:'block',transition:'all 0.3s'}}
                onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.transform='translateY(-4px)';el.style.borderColor='rgba(200,168,75,0.3)';}}
                onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.transform='translateY(0)';el.style.borderColor='rgba(255,255,255,0.08)';}}>
                {post.hinh_dai_dien?<img src={post.hinh_dai_dien} alt={post.tieu_de||'Bài viết'} loading="lazy" style={{width:'100%',height:'175px',objectFit:'cover'}}/>:<div style={{width:'100%',height:'175px',background:'linear-gradient(135deg,rgba(45,107,66,0.3),rgba(200,168,75,0.1))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'44px'}}>📝</div>}
                <div style={{padding:'16px'}}>
                  {post.the_loai&&<div style={{color:'#c8a84b',fontSize:'11px',fontWeight:600,textTransform:'uppercase' as const,letterSpacing:'1px',marginBottom:'7px'}}>{post.the_loai}</div>}
                  <div style={{color:'#fff',fontWeight:700,fontSize:'15px',lineHeight:1.5,marginBottom:'7px'}}>{post.tieu_de}</div>
                  {post.tom_tat&&<div style={{color:'rgba(255,255,255,0.45)',fontSize:'13px',lineHeight:1.6}}>{post.tom_tat.slice(0,100)}...</div>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div style={{position:'relative',overflow:'hidden',padding:'80px 28px',textAlign:'center'}}>
        <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at center,rgba(45,107,66,0.22) 0%,transparent 70%)'}}/>
        <div style={{position:'relative',zIndex:1}}>
          <div className="badge">🌿 Miễn phí hoàn toàn</div>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'clamp(26px,4vw,44px)',fontWeight:700,margin:'10px 0 14px'}}>Sẵn sàng bắt đầu?</h2>
          <p style={{color:'rgba(255,255,255,0.5)',fontSize:'15px',marginBottom:'32px'}}>Miễn phí hoàn toàn · Không cần thẻ tín dụng</p>
          {user?<Link href="/dashboard" className="gold-btn" style={{fontSize:'16px',padding:'15px 44px'}}>Vào Dashboard của bạn →</Link>:<Link href="/login" className="gold-btn" style={{fontSize:'16px',padding:'15px 44px'}}>Tạo tài khoản miễn phí →</Link>}
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{borderTop:'1px solid rgba(255,255,255,0.08)',padding:'48px 28px',background:'rgba(0,0,0,0.35)'}}>
        <div style={{maxWidth:'1280px',margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'32px'}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'14px'}}>
              <div style={{width:'30px',height:'30px',borderRadius:'50%',background:'linear-gradient(135deg,#2d6b42,#c8a84b)',display:'flex',alignItems:'center',justifyContent:'center'}}>🌿</div>
              <span style={{fontFamily:"'Playfair Display',serif",fontSize:'16px',fontWeight:700}}>Vườn Kiểng AI</span>
            </div>
            <div style={{color:'rgba(255,255,255,0.4)',fontSize:'13px',lineHeight:1.8}}>Nền tảng mua bán, giao lưu và chia sẻ kinh nghiệm cây cảnh Việt Nam</div>
          </div>
          <div>
            <div style={{fontWeight:700,marginBottom:'14px',fontSize:'13px',color:'#c8a84b',textTransform:'uppercase' as const,letterSpacing:'1px'}}>Tính năng</div>
            {[{l:'🔬 Chẩn đoán AI',h:'/chan-doan'},{l:'🪪 Hộ chiếu cây',h:'/passport'},{l:'🛒 Chợ cây',h:'/marketplace'},{l:'📚 Blog & Wiki',h:'/blog'},{l:'✂️ Định hướng',h:'/phai-dinh-huong'}].map(item=>(
              <Link key={item.l} href={item.h} className="footer-link">{item.l}</Link>
            ))}
          </div>
          <div>
            <div style={{fontWeight:700,marginBottom:'14px',fontSize:'13px',color:'#c8a84b',textTransform:'uppercase' as const,letterSpacing:'1px'}}>Hỗ trợ</div>
            {[{l:'📖 Hướng dẫn',h:'/huong-dan'},{l:'📋 Điều khoản',h:'#'},{l:'🔒 Bảo mật',h:'#'},{l:'✉️ Liên hệ',h:'#'}].map(item=>(
              <Link key={item.l} href={item.h} className="footer-link">{item.l}</Link>
            ))}
          </div>
          <div>
            <div style={{fontWeight:700,marginBottom:'14px',fontSize:'13px',color:'#c8a84b',textTransform:'uppercase' as const,letterSpacing:'1px'}}>Liên hệ</div>
            <div style={{color:'rgba(255,255,255,0.4)',fontSize:'13px',lineHeight:2.2}}>
              📧 khsongthao00@gmail.com<br/>
              📍 Cà Mau, Việt Nam<br/>
              🌐 vuon-kieng-ai.vercel.app
              {cfg.contact_phone && <><br/>📞 {cfg.contact_phone}</>}
              {cfg.contact_zalo && <><br/>💬 <a href={'https://zalo.me/'+cfg.contact_zalo.replace('https://zalo.me/','')} style={{color:'rgba(255,255,255,0.4)',textDecoration:'none'}}>Zalo: {cfg.contact_zalo}</a></>}
              {cfg.contact_facebook && <><br/>📘 <a href={cfg.contact_facebook} style={{color:'rgba(255,255,255,0.4)',textDecoration:'none'}}>Facebook</a></>}
              {cfg.contact_tax && <><br/>🏢 MST: {cfg.contact_tax}</>}
            </div>
          </div>
        </div>
        <div style={{textAlign:'center',color:'rgba(255,255,255,0.2)',fontSize:'12px',marginTop:'48px',borderTop:'1px solid rgba(255,255,255,0.06)',paddingTop:'24px'}}>
          © 2026 Vườn Kiểng AI · Made with 🌿 in Cà Mau
        </div>
      </footer>
    </div>
  )
}
