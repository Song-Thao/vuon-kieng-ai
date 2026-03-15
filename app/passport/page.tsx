'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const STATUS = {
  khoe_manh: { label: 'Khỏe mạnh', bg: '#eaf3de', color: '#3b6d11' },
  can_cham:  { label: 'Cần chăm',  bg: '#faeeda', color: '#854f0b' },
  benh:      { label: 'Đang bệnh', bg: '#fcebeb', color: '#a32d2d' },
}

const IMG_SLOTS = [
  { key: 'hinh_anh',   label: 'Ảnh chính',    icon: '📸' },
  { key: 'hinh_anh_2', label: 'Góc 2',         icon: '🔍' },
  { key: 'hinh_anh_3', label: 'Gốc cây',       icon: '🌱' },
  { key: 'hinh_anh_4', label: 'Ngọn / Lá',     icon: '🍃' },
  { key: 'hinh_anh_5', label: 'Toàn thân',     icon: '🌳' },
]

const emptyForm = {
  ten_cay: '', ten_khoa_hoc: '', tuoi_cay: '', the_cay: '',
  hoanh_goc: '', chieu_cao: '', xuat_xu: '', vi_tri: '',
  ngay_so_huu: '', ghi_chu: '', gia_tri_uoc_tinh: '', trang_thai: 'khoe_manh',
}

const emptyImages = { hinh_anh: '', hinh_anh_2: '', hinh_anh_3: '', hinh_anh_4: '', hinh_anh_5: '' }

function resizeImage(file: File): Promise<string> {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = ev => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const max = 900
        let w = img.width, h = img.height
        if (w > max) { h = h * max / w; w = max }
        if (h > max) { w = w * max / h; h = max }
        canvas.width = w; canvas.height = h
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.75))
      }
      img.src = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

export default function Passport() {
  const [passports, setPassports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [images, setImages] = useState({ ...emptyImages })
  const [viewPassport, setViewPassport] = useState<any>(null)
  const [activeImg, setActiveImg] = useState(0)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) fetchPassports(data.user.id)
      else setLoading(false)
    })
  }, [])

  const fetchPassports = async (uid: string) => {
    const { data } = await supabase.from('passports').select('*').eq('user_id', uid).order('created_at', { ascending: false })
    setPassports(data || [])
    setLoading(false)
  }

  const handleImageSlot = async (e: any, slot: string) => {
    const file = e.target.files[0]
    if (!file) return
    const b64 = await resizeImage(file)
    setImages(prev => ({ ...prev, [slot]: b64 }))
  }

  const save = async () => {
    if (!form.ten_cay) return alert('Vui lòng nhập tên cây!')
    setSaving(true)
    const payload = {
      ...form,
      ...images,
      gia_tri_uoc_tinh: form.gia_tri_uoc_tinh ? parseInt(form.gia_tri_uoc_tinh.replace(/\D/g, '')) : null,
      ngay_so_huu: form.ngay_so_huu || null,
      user_id: user.id,
    }
    if (selected) {
      await supabase.from('passports').update(payload).eq('id', selected.id)
    } else {
      await supabase.from('passports').insert(payload)
    }
    setSaving(false)
    setShowForm(false)
    setSelected(null)
    setForm({ ...emptyForm })
    setImages({ ...emptyImages })
    fetchPassports(user.id)
  }

  const openEdit = (p: any) => {
    setSelected(p)
    setForm({
      ten_cay: p.ten_cay||'', ten_khoa_hoc: p.ten_khoa_hoc||'', tuoi_cay: p.tuoi_cay||'',
      the_cay: p.the_cay||'', hoanh_goc: p.hoanh_goc||'', chieu_cao: p.chieu_cao||'',
      xuat_xu: p.xuat_xu||'', vi_tri: p.vi_tri||'', ngay_so_huu: p.ngay_so_huu||'',
      ghi_chu: p.ghi_chu||'', gia_tri_uoc_tinh: p.gia_tri_uoc_tinh?.toString()||'',
      trang_thai: p.trang_thai||'khoe_manh',
    })
    setImages({
      hinh_anh: p.hinh_anh||'', hinh_anh_2: p.hinh_anh_2||'',
      hinh_anh_3: p.hinh_anh_3||'', hinh_anh_4: p.hinh_anh_4||'', hinh_anh_5: p.hinh_anh_5||'',
    })
    setShowForm(true)
  }

  const openView = (p: any) => { setViewPassport(p); setActiveImg(0) }

  const deletePassport = async (id: string) => {
    if (!confirm('Xóa hộ chiếu này?')) return
    await supabase.from('passports').delete().eq('id', id)
    fetchPassports(user.id)
  }

  const formFields = [
    [{ key:'ten_cay', label:'Tên cây', icon:'🌿', ph:'VD: Bonsai Mai Vàng', required:true }, { key:'ten_khoa_hoc', label:'Tên khoa học', icon:'🔬', ph:'VD: Ochna integerrima' }],
    [{ key:'tuoi_cay', label:'Tuổi cây', icon:'⏳', ph:'VD: 10 năm' }, { key:'the_cay', label:'Thế cây', icon:'🎋', ph:'VD: Trực, Tà, Huyền...' }],
    [{ key:'hoanh_goc', label:'Hoành gốc', icon:'📏', ph:'VD: 15cm' }, { key:'chieu_cao', label:'Chiều cao', icon:'📐', ph:'VD: 60cm' }],
    [{ key:'xuat_xu', label:'Xuất xứ', icon:'🗺️', ph:'VD: Cà Mau' }, { key:'vi_tri', label:'Vị trí hiện tại', icon:'📍', ph:'VD: Sân vườn' }],
    [{ key:'gia_tri_uoc_tinh', label:'Giá trị ước tính', icon:'💰', ph:'VD: 5000000' }, { key:'ngay_so_huu', label:'Ngày sở hữu', icon:'📅', ph:'', type:'date' }],
  ]

  const inputStyle = { width:'100%', padding:'10px 14px', border:'1px solid var(--border)', borderRadius:'10px', fontSize:'13px', fontFamily:"'DM Sans',sans-serif", color:'var(--text)', background:'#fff', outline:'none', transition:'all .2s' }

  // ── VIEW DETAIL MODAL ──
  if (viewPassport) {
    const p = viewPassport
    const st = STATUS[p.trang_thai as keyof typeof STATUS] || STATUS.khoe_manh
    const imgs = IMG_SLOTS.map(s => p[s.key]).filter(Boolean)
    return (
      <div style={{ minHeight:'100vh', background:'var(--warm-white)' }}>
        <nav style={{ background:'var(--forest)', padding:'0 28px', height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'var(--gold)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px' }}>🌿</div>
            <span style={{ color:'#fff', fontFamily:"'Playfair Display',serif", fontSize:'18px', fontWeight:600 }}>Vườn Kiểng AI</span>
          </div>
          <button onClick={() => setViewPassport(null)} style={{ color:'rgba(255,255,255,0.7)', background:'transparent', border:'none', fontSize:'13px', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px' }}>← Quay lại</button>
        </nav>

        <div style={{ maxWidth:'800px', margin:'0 auto', padding:'32px 24px' }}>

          {/* Gallery */}
          {imgs.length > 0 && (
            <div style={{ marginBottom:'24px' }}>
              <div style={{ borderRadius:'16px', overflow:'hidden', aspectRatio:'16/9', background:'var(--cream)', marginBottom:'10px' }}>
                <img src={imgs[activeImg]} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
              </div>
              {imgs.length > 1 && (
                <div style={{ display:'flex', gap:'8px' }}>
                  {imgs.map((img: string, i: number) => (
                    <div key={i} onClick={() => setActiveImg(i)} style={{
                      width:'72px', height:'54px', borderRadius:'8px', overflow:'hidden', cursor:'pointer',
                      border: activeImg === i ? '2px solid var(--forest)' : '2px solid transparent',
                      opacity: activeImg === i ? 1 : 0.6, transition:'all .2s', flexShrink: 0,
                    }}>
                      <img src={img} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Info card */}
          <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:'20px', padding:'28px' }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'20px', paddingBottom:'16px', borderBottom:'1px solid var(--border)' }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'4px' }}>
                  <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'26px', fontWeight:700, color:'var(--forest)' }}>{p.ten_cay}</h1>
                  <span style={{ background:'var(--gold)', color:'var(--forest)', padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:700 }}>HC ✓</span>
                </div>
                {p.ten_khoa_hoc && <p style={{ fontSize:'14px', color:'var(--text-muted)', fontStyle:'italic' }}>{p.ten_khoa_hoc}</p>}
              </div>
              <span style={{ background:st.bg, color:st.color, padding:'5px 14px', borderRadius:'20px', fontSize:'12px', fontWeight:600 }}>{st.label}</span>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px', marginBottom:'20px' }}>
              {[
                { icon:'⏳', label:'Tuổi cây',      val: p.tuoi_cay },
                { icon:'🎋', label:'Thế cây',        val: p.the_cay },
                { icon:'📏', label:'Hoành gốc',      val: p.hoanh_goc },
                { icon:'📐', label:'Chiều cao',      val: p.chieu_cao },
                { icon:'🗺️', label:'Xuất xứ',        val: p.xuat_xu },
                { icon:'📍', label:'Vị trí',         val: p.vi_tri },
                { icon:'📅', label:'Ngày sở hữu',    val: p.ngay_so_huu },
                { icon:'💰', label:'Giá trị',        val: p.gia_tri_uoc_tinh && `${Number(p.gia_tri_uoc_tinh).toLocaleString('vi-VN')}đ` },
              ].filter(x => x.val).map((x, i) => (
                <div key={i} style={{ background:'var(--warm-white)', borderRadius:'12px', padding:'12px' }}>
                  <div style={{ fontSize:'11px', color:'var(--text-muted)', marginBottom:'4px' }}>{x.icon} {x.label}</div>
                  <div style={{ fontSize:'14px', fontWeight:600, color:'var(--forest)' }}>{x.val}</div>
                </div>
              ))}
            </div>

            {p.ghi_chu && (
              <div style={{ background:'var(--warm-white)', borderRadius:'12px', padding:'16px' }}>
                <div style={{ fontSize:'11px', color:'var(--text-muted)', marginBottom:'6px' }}>📝 Ghi chú</div>
                <p style={{ fontSize:'14px', color:'var(--text)', lineHeight:1.6 }}>{p.ghi_chu}</p>
              </div>
            )}

            <div style={{ display:'flex', gap:'10px', marginTop:'20px' }}>
              <button onClick={() => { setViewPassport(null); openEdit(p) }} style={{ flex:1, padding:'11px', background:'var(--forest)', color:'#fff', border:'none', borderRadius:'10px', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>✏️ Chỉnh sửa</button>
              <button onClick={() => { setViewPassport(null); deletePassport(p.id) }} style={{ padding:'11px 20px', background:'#fff', color:'#a32d2d', border:'1.5px solid #fcebeb', borderRadius:'10px', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>🗑️ Xóa</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--warm-white)' }}>
      <nav style={{ background:'var(--forest)', padding:'0 28px', height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'var(--gold)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px' }}>🌿</div>
          <span style={{ color:'#fff', fontFamily:"'Playfair Display',serif", fontSize:'18px', fontWeight:600 }}>Vườn Kiểng AI</span>
        </div>
        <div style={{ display:'flex', gap:'4px' }}>
          {[{label:'Dashboard',href:'/dashboard'},{label:'Chẩn đoán',href:'/chan-doan'},{label:'Chợ cây',href:'/marketplace'},{label:'Hộ chiếu',href:'/passport'}].map(link => (
            <Link key={link.href} href={link.href} style={{ color: link.href==='/passport' ? 'var(--gold-light)' : 'rgba(255,255,255,0.65)', textDecoration:'none', fontSize:'13px', padding:'6px 14px', borderRadius:'20px', background: link.href==='/passport' ? 'rgba(255,255,255,0.1)' : 'transparent' }}>{link.label}</Link>
          ))}
        </div>
        <div style={{ width:'34px', height:'34px', borderRadius:'50%', background:'var(--forest-light)', border:'2px solid var(--sage)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'13px', fontWeight:500 }}>AN</div>
      </nav>

      <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'32px 24px' }}>
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:'28px' }}>
          <div>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'28px', fontWeight:700, color:'var(--forest)' }}>Hộ Chiếu Cây 🪪</h1>
            <p style={{ color:'var(--text-muted)', fontSize:'14px', marginTop:'4px' }}>Lý lịch điện tử — minh bạch & tin cậy · Tối đa 5 ảnh/cây</p>
          </div>
          {user && !showForm && (
            <button onClick={() => { setSelected(null); setForm({...emptyForm}); setImages({...emptyImages}); setShowForm(true) }}
              style={{ background:'var(--forest)', color:'#fff', border:'none', padding:'10px 20px', borderRadius:'10px', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>
              ＋ Tạo hộ chiếu
            </button>
          )}
        </div>

        {!user && !loading && (
          <div style={{ textAlign:'center', padding:'80px 20px', background:'#fff', border:'1px solid var(--border)', borderRadius:'20px' }}>
            <div style={{ fontSize:'48px', marginBottom:'16px' }}>🔐</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'20px', color:'var(--forest)', marginBottom:'8px' }}>Đăng nhập để xem hộ chiếu</h2>
            <p style={{ color:'var(--text-muted)', fontSize:'14px', marginBottom:'20px' }}>Hộ chiếu giúp minh bạch thông tin cây khi mua bán</p>
            <Link href="/login" style={{ background:'var(--forest)', color:'#fff', textDecoration:'none', padding:'12px 28px', borderRadius:'10px', fontSize:'14px', fontWeight:600 }}>Đăng nhập ngay</Link>
          </div>
        )}

        {loading && (
          <div style={{ textAlign:'center', padding:'80px', color:'var(--text-muted)' }}>
            <div style={{ fontSize:'36px', marginBottom:'12px', opacity:0.3 }}>🪪</div>
            <p style={{ fontSize:'14px' }}>Đang tải...</p>
          </div>
        )}

        {!loading && user && passports.length === 0 && !showForm && (
          <div style={{ textAlign:'center', padding:'80px 20px', background:'#fff', border:'1.5px dashed var(--border)', borderRadius:'20px' }}>
            <div style={{ fontSize:'48px', marginBottom:'16px', opacity:0.4 }}>🪪</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'20px', color:'var(--forest)', marginBottom:'8px' }}>Chưa có hộ chiếu nào</h2>
            <p style={{ color:'var(--text-muted)', fontSize:'14px', marginBottom:'20px' }}>Tạo hộ chiếu điện tử cho từng cây trong vườn bạn</p>
            <button onClick={() => setShowForm(true)} style={{ background:'var(--forest)', color:'#fff', border:'none', padding:'12px 28px', borderRadius:'10px', fontSize:'14px', fontWeight:600, cursor:'pointer' }}>🪪 Tạo hộ chiếu đầu tiên</button>
          </div>
        )}

        {/* Grid */}
        {!loading && user && passports.length > 0 && !showForm && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px' }}>
            {passports.map(p => {
              const st = STATUS[p.trang_thai as keyof typeof STATUS] || STATUS.khoe_manh
              const imgs = IMG_SLOTS.map(s => p[s.key]).filter(Boolean)
              return (
                <div key={p.id} style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:'16px', overflow:'hidden', transition:'all .2s' }}
                  onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.borderColor='var(--sage)'; el.style.transform='translateY(-2px)'; el.style.boxShadow='0 8px 24px rgba(14,45,26,0.1)' }}
                  onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.borderColor='var(--border)'; el.style.transform='none'; el.style.boxShadow='none' }}>

                  {/* Main image — clickable */}
                  <div onClick={() => openView(p)} style={{ aspectRatio:'4/3', background:'var(--cream)', overflow:'hidden', position:'relative', cursor:'pointer' }}>
                    {p.hinh_anh
                      ? <img src={p.hinh_anh} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                      : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'56px' }}>🌳</div>
                    }
                    <div style={{ position:'absolute', top:'10px', left:'10px', background:'var(--gold)', color:'var(--forest)', padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:700 }}>HC ✓</div>
                    {imgs.length > 1 && (
                      <div style={{ position:'absolute', bottom:'10px', right:'10px', background:'rgba(0,0,0,0.55)', color:'#fff', padding:'3px 8px', borderRadius:'20px', fontSize:'11px' }}>
                        📷 {imgs.length} ảnh
                      </div>
                    )}
                  </div>

                  {/* Thumbnail strip */}
                  {imgs.length > 1 && (
                    <div style={{ display:'flex', gap:'4px', padding:'6px 10px', background:'var(--warm-white)', borderBottom:'1px solid var(--border)' }}>
                      {imgs.slice(1).map((img: string, i: number) => (
                        <div key={i} style={{ width:'36px', height:'28px', borderRadius:'5px', overflow:'hidden', flexShrink:0 }}>
                          <img src={img} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ padding:'14px' }}>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'16px', fontWeight:700, color:'var(--forest)', marginBottom:'2px', cursor:'pointer' }} onClick={() => openView(p)}>{p.ten_cay}</div>
                    {p.ten_khoa_hoc && <div style={{ fontSize:'12px', color:'var(--text-muted)', fontStyle:'italic', marginBottom:'8px' }}>{p.ten_khoa_hoc}</div>}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4px', marginBottom:'12px' }}>
                      {[
                        { icon:'⏳', val: p.tuoi_cay },
                        { icon:'📏', val: p.hoanh_goc && `Gốc ${p.hoanh_goc}` },
                        { icon:'📍', val: p.vi_tri },
                        { icon:'💰', val: p.gia_tri_uoc_tinh && `${Number(p.gia_tri_uoc_tinh).toLocaleString('vi-VN')}đ` },
                      ].filter(x => x.val).map((x, i) => (
                        <div key={i} style={{ fontSize:'11px', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:'3px' }}>
                          <span>{x.icon}</span><span>{x.val}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <span style={{ background:st.bg, color:st.color, padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:600 }}>{st.label}</span>
                      <div style={{ display:'flex', gap:'6px' }}>
                        <button onClick={() => openEdit(p)} style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:'6px', padding:'4px 10px', fontSize:'11px', cursor:'pointer', color:'var(--text-muted)' }}>Sửa</button>
                        <button onClick={() => deletePassport(p.id)} style={{ background:'transparent', border:'1px solid #fcebeb', borderRadius:'6px', padding:'4px 10px', fontSize:'11px', cursor:'pointer', color:'#a32d2d' }}>Xóa</button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            <button onClick={() => { setSelected(null); setForm({...emptyForm}); setImages({...emptyImages}); setShowForm(true) }}
              style={{ border:'1.5px dashed var(--border)', borderRadius:'16px', minHeight:'280px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'transparent', cursor:'pointer', color:'var(--text-muted)', transition:'all .2s' }}
              onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.borderColor='var(--sage)'; el.style.background='#f0f7f2' }}
              onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.borderColor='var(--border)'; el.style.background='transparent' }}>
              <div style={{ fontSize:'36px', marginBottom:'8px', opacity:0.4 }}>＋</div>
              <div style={{ fontSize:'14px', fontWeight:500 }}>Thêm hộ chiếu</div>
            </button>
          </div>
        )}

        {/* FORM */}
        {showForm && (
          <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:'20px', padding:'32px', maxWidth:'760px', margin:'0 auto' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px', paddingBottom:'16px', borderBottom:'1px solid var(--border)' }}>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'20px', fontWeight:700, color:'var(--forest)' }}>
                {selected ? '✏️ Sửa hộ chiếu' : '🪪 Tạo hộ chiếu mới'}
              </h2>
              <button onClick={() => setShowForm(false)} style={{ background:'transparent', border:'none', fontSize:'20px', cursor:'pointer', color:'var(--text-muted)' }}>✕</button>
            </div>

            {/* 5 image slots */}
            <div style={{ marginBottom:'24px' }}>
              <label style={{ display:'block', fontSize:'11px', fontWeight:500, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'10px' }}>
                📸 Ảnh cây — tối đa 5 ảnh (click từng ô để upload)
              </label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr 1fr', gap:'8px' }}>
                {IMG_SLOTS.map(slot => {
                  const val = images[slot.key as keyof typeof images]
                  return (
                    <label key={slot.key} style={{ cursor:'pointer', display:'block' }}>
                      <div style={{
                        aspectRatio:'1', borderRadius:'10px', overflow:'hidden',
                        border: val ? '2px solid var(--sage)' : '2px dashed var(--border)',
                        background: val ? 'transparent' : 'var(--warm-white)',
                        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                        transition:'all .2s', position:'relative',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor='var(--forest)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = val ? 'var(--sage)' : 'var(--border)' }}>
                        {val
                          ? <img src={val} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                          : <>
                              <div style={{ fontSize:'20px', marginBottom:'4px' }}>{slot.icon}</div>
                              <div style={{ fontSize:'10px', color:'var(--text-muted)', textAlign:'center', padding:'0 4px' }}>{slot.label}</div>
                            </>
                        }
                        {val && (
                          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.35)', display:'flex', alignItems:'center', justifyContent:'center', opacity:0, transition:'opacity .2s' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity='1' }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity='0' }}>
                            <span style={{ color:'#fff', fontSize:'11px', fontWeight:600 }}>🔄 Đổi</span>
                          </div>
                        )}
                      </div>
                      <input type="file" accept="image/*" onChange={e => handleImageSlot(e, slot.key)} style={{ display:'none' }} />
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Fields */}
            {formFields.map((row, ri) => (
              <div key={ri} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'14px' }}>
                {row.map((f: any) => (
                  <div key={f.key}>
                    <label style={{ display:'block', fontSize:'11px', fontWeight:500, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'6px' }}>
                      {f.icon} {f.label} {f.required && <span style={{ color:'#e74c3c' }}>*</span>}
                    </label>
                    <input type={f.type||'text'} placeholder={f.ph} value={(form as any)[f.key]}
                      onChange={e => setForm({...form, [f.key]: e.target.value})}
                      style={inputStyle}
                      onFocus={e => { e.target.style.borderColor='var(--sage)'; e.target.style.boxShadow='0 0 0 3px rgba(90,143,106,0.1)' }}
                      onBlur={e => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none' }}
                    />
                  </div>
                ))}
              </div>
            ))}

            <div style={{ marginBottom:'14px' }}>
              <label style={{ display:'block', fontSize:'11px', fontWeight:500, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'6px' }}>📝 Ghi chú</label>
              <textarea value={form.ghi_chu} onChange={e => setForm({...form, ghi_chu: e.target.value})}
                placeholder="Lịch sử chăm sóc, giải thưởng, đặc điểm nổi bật..."
                style={{ ...inputStyle, height:'80px', resize:'vertical' } as any}
                onFocus={e => { e.target.style.borderColor='var(--sage)'; e.target.style.boxShadow='0 0 0 3px rgba(90,143,106,0.1)' }}
                onBlur={e => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none' }}
              />
            </div>

            <div style={{ marginBottom:'24px' }}>
              <label style={{ display:'block', fontSize:'11px', fontWeight:500, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'8px' }}>🌡️ Trạng thái</label>
              <div style={{ display:'flex', gap:'8px' }}>
                {Object.entries(STATUS).map(([key, val]) => (
                  <button key={key} onClick={() => setForm({...form, trang_thai: key})} style={{
                    padding:'7px 16px', borderRadius:'20px', border:'1.5px solid', cursor:'pointer', fontSize:'12px', fontWeight:600, transition:'all .2s',
                    background: form.trang_thai===key ? val.bg : 'transparent',
                    borderColor: form.trang_thai===key ? val.color : 'var(--border)',
                    color: form.trang_thai===key ? val.color : 'var(--text-muted)',
                  }}>{val.label}</button>
                ))}
              </div>
            </div>

            <div style={{ display:'flex', gap:'12px' }}>
              <button onClick={save} disabled={saving} style={{ flex:1, padding:'13px', background: saving ? 'var(--sage)' : 'var(--forest)', color:'#fff', border:'none', borderRadius:'12px', fontSize:'14px', fontWeight:600, fontFamily:"'DM Sans',sans-serif", cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving ? '⏳ Đang lưu...' : selected ? '💾 Cập nhật' : '🪪 Tạo hộ chiếu'}
              </button>
              <button onClick={() => setShowForm(false)} style={{ padding:'13px 20px', background:'#fff', color:'var(--text-muted)', border:'1.5px solid var(--border)', borderRadius:'12px', fontSize:'14px', cursor:'pointer' }}>Hủy</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
