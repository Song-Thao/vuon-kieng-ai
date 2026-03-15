'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function DangBan() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [image, setImage] = useState<string>('')
  const [form, setForm] = useState({ ten_cay:'', mo_ta:'', gia:'', vi_tri:'', zalo:'', sdt:'' })

  const handleImage = (e: any) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const max = 800
        let w = img.width, h = img.height
        if (w > max) { h = h * max / w; w = max }
        if (h > max) { w = w * max / h; h = max }
        canvas.width = w; canvas.height = h
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
        setImage(canvas.toDataURL('image/jpeg', 0.7))
      }
      img.src = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const submit = async () => {
    if (!form.ten_cay || !form.gia) return alert('Vui lòng nhập tên cây và giá!')
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }
    const { error } = await supabase.from('listings').insert({
      ten_cay: form.ten_cay, mo_ta: form.mo_ta,
      gia: parseInt(form.gia.replace(/\D/g, '')),
      vi_tri: form.vi_tri, zalo: form.zalo, sdt: form.sdt,
      hinh_anh: image || null, user_id: user.id
    })
    setLoading(false)
    if (error) alert('Lỗi: ' + error.message)
    else setSuccess(true)
  }

  const fields = [
    { key:'ten_cay', label:'Tên cây',           icon:'🌿', ph:'VD: Bonsai Mai Vàng 10 năm tuổi', required: true },
    { key:'gia',     label:'Giá bán (VNĐ)',      icon:'💰', ph:'VD: 5000000',                      required: true },
    { key:'vi_tri',  label:'Vị trí',             icon:'📍', ph:'VD: Cà Mau, Cần Thơ, TP.HCM...',  required: false },
    { key:'zalo',    label:'Zalo',               icon:'💬', ph:'Số Zalo của bạn',                  required: false },
    { key:'sdt',     label:'Số điện thoại',      icon:'📞', ph:'Số điện thoại liên hệ',            required: false },
  ]

  if (success) return (
    <div style={{ minHeight:'100vh', background:'var(--warm-white)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center', padding:'40px' }}>
        <div style={{ fontSize:'64px', marginBottom:'16px' }}>🎉</div>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'26px', fontWeight:700, color:'var(--forest)', marginBottom:'8px' }}>Đăng bán thành công!</h2>
        <p style={{ color:'var(--text-muted)', fontSize:'14px', marginBottom:'28px' }}>Cây của bạn đã được đăng lên chợ</p>
        <div style={{ display:'flex', gap:'12px', justifyContent:'center' }}>
          <Link href="/marketplace" style={{ background:'var(--forest)', color:'#fff', textDecoration:'none', padding:'12px 24px', borderRadius:'10px', fontSize:'14px', fontWeight:600 }}>Xem chợ →</Link>
          <button onClick={() => { setSuccess(false); setForm({ ten_cay:'',mo_ta:'',gia:'',vi_tri:'',zalo:'',sdt:'' }); setImage('') }}
            style={{ background:'#fff', color:'var(--forest)', border:'1.5px solid var(--border)', padding:'12px 24px', borderRadius:'10px', fontSize:'14px', fontWeight:600, cursor:'pointer' }}>
            Đăng tiếp
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'var(--warm-white)' }}>

      {/* NAV */}
      <nav style={{ background:'var(--forest)', padding:'0 28px', height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'var(--gold)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px' }}>🌿</div>
          <span style={{ color:'#fff', fontFamily:"'Playfair Display',serif", fontSize:'18px', fontWeight:600 }}>Vườn Kiểng AI</span>
        </div>
        <div style={{ display:'flex', gap:'4px' }}>
          {[{label:'Dashboard',href:'/dashboard'},{label:'Chẩn đoán',href:'/chan-doan'},{label:'Chợ cây',href:'/marketplace'}].map(link => (
            <Link key={link.href} href={link.href} style={{ color:'rgba(255,255,255,0.65)', textDecoration:'none', fontSize:'13px', padding:'6px 14px', borderRadius:'20px' }}>{link.label}</Link>
          ))}
        </div>
        <div style={{ width:'34px', height:'34px', borderRadius:'50%', background:'var(--forest-light)', border:'2px solid var(--sage)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'13px', fontWeight:500 }}>AN</div>
      </nav>

      {/* BODY */}
      <div style={{ maxWidth:'640px', margin:'0 auto', padding:'32px 24px' }}>

        {/* Back + Title */}
        <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'28px' }}>
          <Link href="/marketplace" style={{ color:'var(--text-muted)', textDecoration:'none', fontSize:'13px', display:'flex', alignItems:'center', gap:'4px' }}>← Chợ cây</Link>
          <div style={{ width:'1px', height:'16px', background:'var(--border)' }} />
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'22px', fontWeight:700, color:'var(--forest)' }}>Đăng bán cây</h1>
        </div>

        {/* Form card */}
        <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:'20px', padding:'28px', marginBottom:'16px' }}>
          <p style={{ fontFamily:"'Playfair Display',serif", fontSize:'15px', color:'var(--forest)', marginBottom:'20px', paddingBottom:'16px', borderBottom:'1px solid var(--border)' }}>
            📋 Thông tin cây
          </p>

          {fields.map(f => (
            <div key={f.key} style={{ marginBottom:'16px' }}>
              <label style={{ display:'block', fontSize:'12px', fontWeight:500, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'6px' }}>
                {f.icon} {f.label} {f.required && <span style={{ color:'#e74c3c' }}>*</span>}
              </label>
              <input
                style={{ width:'100%', padding:'10px 14px', border:'1px solid var(--border)', borderRadius:'10px', fontSize:'14px', fontFamily:"'DM Sans',sans-serif", color:'var(--text)', background:'#fff', outline:'none', transition:'all .2s' }}
                placeholder={f.ph}
                value={(form as any)[f.key]}
                onChange={e => setForm({...form, [f.key]: e.target.value})}
                onFocus={e => { e.target.style.borderColor='var(--sage)'; e.target.style.boxShadow='0 0 0 3px rgba(90,143,106,0.12)' }}
                onBlur={e => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none' }}
              />
            </div>
          ))}

          <div style={{ marginBottom:'16px' }}>
            <label style={{ display:'block', fontSize:'12px', fontWeight:500, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'6px' }}>
              📝 Mô tả chi tiết
            </label>
            <textarea
              style={{ width:'100%', padding:'10px 14px', border:'1px solid var(--border)', borderRadius:'10px', fontSize:'14px', fontFamily:"'DM Sans',sans-serif", color:'var(--text)', background:'#fff', outline:'none', transition:'all .2s', height:'96px', resize:'vertical' }}
              placeholder="Mô tả chi tiết: tuổi cây, thế cây, tình trạng sức khỏe, hoành gốc..."
              value={form.mo_ta}
              onChange={e => setForm({...form, mo_ta: e.target.value})}
              onFocus={e => { e.target.style.borderColor='var(--sage)'; e.target.style.boxShadow='0 0 0 3px rgba(90,143,106,0.12)' }}
              onBlur={e => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none' }}
            />
          </div>
        </div>

        {/* Image card */}
        <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:'20px', padding:'28px', marginBottom:'16px' }}>
          <p style={{ fontFamily:"'Playfair Display',serif", fontSize:'15px', color:'var(--forest)', marginBottom:'20px', paddingBottom:'16px', borderBottom:'1px solid var(--border)' }}>
            📸 Ảnh cây
          </p>
          {image && (
            <img src={image} style={{ width:'100%', borderRadius:'12px', marginBottom:'12px', maxHeight:'280px', objectFit:'cover', display:'block' }} />
          )}
          <label style={{
            display:'block', border:'2px dashed var(--border)', borderRadius:'12px',
            padding:'28px', textAlign:'center', cursor:'pointer', transition:'all .2s',
          }}
          onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor='var(--sage)'; el.style.background='#f0f7f2' }}
          onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor='var(--border)'; el.style.background='transparent' }}>
            <div style={{ fontSize:'32px', marginBottom:'8px' }}>{image ? '🔄' : '📷'}</div>
            <div style={{ fontSize:'14px', fontWeight:500, color:'var(--forest)', marginBottom:'4px' }}>{image ? 'Đổi ảnh khác' : 'Chọn ảnh cây'}</div>
            <div style={{ fontSize:'12px', color:'var(--text-muted)' }}>Chụp rõ toàn thân cây, ảnh đẹp bán nhanh hơn</div>
            <input type="file" accept="image/*" onChange={handleImage} style={{ display:'none' }} />
          </label>
        </div>

        {/* Submit */}
        <button onClick={submit} disabled={loading} style={{
          width:'100%', padding:'16px', background: loading ? 'var(--sage)' : 'var(--forest)',
          color:'#fff', border:'none', borderRadius:'14px', fontSize:'15px', fontWeight:600,
          fontFamily:"'DM Sans',sans-serif", cursor: loading ? 'not-allowed' : 'pointer',
          transition:'all .2s', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
        }}
        onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.transform='translateY(-1px)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform='none' }}>
          {loading ? '⏳ Đang đăng...' : '🌿 Đăng bán ngay'}
        </button>

        <p style={{ textAlign:'center', fontSize:'12px', color:'var(--text-muted)', marginTop:'12px', lineHeight:1.6 }}>
          Bằng cách đăng bán, bạn đồng ý với điều khoản sử dụng.<br/>
          Cây có Hộ chiếu sẽ được hiển thị badge xác thực ✓
        </p>
      </div>
    </div>
  )
}
