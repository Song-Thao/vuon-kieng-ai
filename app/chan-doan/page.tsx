'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ChanDoan() {
  const [image, setImage] = useState<string>('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [info, setInfo] = useState({
    ten_cay: '', moi_truong: '', tuoi_cay: '', tinh_trang: '', vung: ''
  })

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

  const analyze = async () => {
    if (!image) return
    setLoading(true); setResult(null)
    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, info })
      })
      setResult(await res.json())
    } catch { setResult({ ten_benh: 'Lỗi kết nối', mo_ta_benh: 'Vui lòng thử lại' }) }
    setLoading(false)
  }

  const fields = [
    { key: 'ten_cay',    label: 'Tên cây',           icon: '🌿', ph: 'VD: Mai vàng, Bonsai sanh...' },
    { key: 'moi_truong', label: 'Môi trường trồng',  icon: '🪴', ph: 'VD: Trên chậu, dưới đất...' },
    { key: 'vung',       label: 'Vùng khí hậu',      icon: '🌍', ph: 'VD: Miền Nam - Cà Mau...' },
    { key: 'tuoi_cay',   label: 'Tuổi cây',           icon: '⏳', ph: 'VD: 5 năm, mới mua 2 tuần...' },
  ]

  return (
    <>
      <style>{`
        .cd-wrap { min-height:100vh; background:var(--forest); font-family:'DM Sans',sans-serif; color:#f0ede6; }
        .cd-hero { background:linear-gradient(135deg,#1a4428,#0e2d1a); padding:40px 24px 32px; text-align:center; position:relative; overflow:hidden; }
        .cd-hero::before { content:''; position:absolute; inset:0; background-image:repeating-linear-gradient(45deg,transparent,transparent 40px,rgba(255,255,255,0.015) 40px,rgba(255,255,255,0.015) 41px); }
        .cd-hero-badge { display:inline-block; background:rgba(200,168,75,0.15); border:1px solid rgba(200,168,75,0.3); color:var(--gold); font-size:11px; font-weight:600; letter-spacing:2px; text-transform:uppercase; padding:6px 16px; border-radius:20px; margin-bottom:16px; position:relative; }
        .cd-hero h1 { font-family:'Playfair Display',serif; font-size:clamp(26px,6vw,38px); font-weight:700; color:#f0ede6; line-height:1.2; margin-bottom:8px; position:relative; }
        .cd-hero h1 span { color:#a8d5b5; }
        .cd-hero p { color:rgba(184,212,190,0.7); font-size:14px; position:relative; }
        .cd-body { max-width:640px; margin:0 auto; padding:0 16px 60px; }
        .cd-card { background:rgba(26,58,30,0.5); border:1px solid rgba(127,184,138,0.15); border-radius:20px; padding:24px; margin-top:20px; }
        .cd-card-title { font-family:'Playfair Display',serif; font-size:16px; color:#a8d5b5; margin-bottom:20px; display:flex; align-items:center; gap:8px; }
        .cd-card-title::after { content:''; flex:1; height:1px; background:linear-gradient(90deg,rgba(127,184,138,0.3),transparent); }
        .cd-field { margin-bottom:16px; }
        .cd-field label { display:flex; align-items:center; gap:6px; font-size:12px; font-weight:500; color:rgba(184,212,190,0.8); letter-spacing:0.5px; margin-bottom:8px; text-transform:uppercase; }
        .cd-field input, .cd-field textarea { width:100%; background:rgba(13,31,15,0.6); border:1px solid rgba(127,184,138,0.2); border-radius:12px; padding:12px 16px; color:#f0ede6; font-family:'DM Sans',sans-serif; font-size:14px; transition:all 0.2s; outline:none; }
        .cd-field input::placeholder, .cd-field textarea::placeholder { color:rgba(184,212,190,0.3); font-size:13px; }
        .cd-field input:focus, .cd-field textarea:focus { border-color:rgba(127,184,138,0.5); box-shadow:0 0 0 3px rgba(127,184,138,0.08); }
        .cd-field textarea { height:90px; resize:vertical; }
        .cd-upload-area { border:2px dashed rgba(127,184,138,0.25); border-radius:16px; overflow:hidden; cursor:pointer; position:relative; transition:border-color .2s; }
        .cd-upload-area:hover { border-color:rgba(127,184,138,0.5); }
        .cd-upload-placeholder { padding:32px; text-align:center; }
        .cd-upload-icon { font-size:36px; margin-bottom:8px; }
        .cd-upload-text { color:rgba(184,212,190,0.8); font-size:14px; margin-bottom:4px; }
        .cd-upload-sub { color:rgba(184,212,190,0.45); font-size:12px; }
        .cd-upload-area input[type=file] { position:absolute; inset:0; opacity:0; cursor:pointer; width:100%; height:100%; }
        .cd-preview { width:100%; max-height:280px; object-fit:cover; display:block; }
        .cd-preview-overlay { position:absolute; inset:0; background:rgba(13,31,15,0.4); display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity .2s; }
        .cd-upload-area:hover .cd-preview-overlay { opacity:1; }
        .cd-preview-change { background:rgba(13,31,15,0.8); border:1px solid rgba(127,184,138,0.4); color:#a8d5b5; padding:8px 20px; border-radius:20px; font-size:13px; }
        .cd-btn { width:100%; margin-top:20px; padding:16px; background:linear-gradient(135deg,var(--forest-light),var(--sage)); border:none; border-radius:16px; color:white; font-family:'DM Sans',sans-serif; font-size:15px; font-weight:600; cursor:pointer; transition:all .3s; }
        .cd-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 24px rgba(45,90,50,0.4); }
        .cd-btn:disabled { opacity:0.4; cursor:not-allowed; }
        .cd-spinner { width:18px; height:18px; border:2px solid rgba(255,255,255,0.3); border-top-color:white; border-radius:50%; animation:spin .7s linear infinite; display:inline-block; vertical-align:middle; margin-right:8px; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .cd-result { animation:fadeUp .4s ease; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .cd-result-header { display:flex; align-items:center; gap:10px; margin-bottom:20px; padding-bottom:16px; border-bottom:1px solid rgba(127,184,138,0.15); }
        .cd-result-header h2 { font-family:'Playfair Display',serif; font-size:20px; color:#a8d5b5; }
        .cd-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px; }
        .cd-info-box { background:rgba(13,31,15,0.5); border:1px solid rgba(127,184,138,0.12); border-radius:14px; padding:14px; }
        .cd-info-label { font-size:10px; text-transform:uppercase; letter-spacing:1px; color:#5a8f6a; margin-bottom:6px; }
        .cd-info-value { font-size:15px; font-weight:600; color:#f0ede6; }
        .cd-info-sub { font-size:11px; color:rgba(184,212,190,0.6); margin-top:3px; }
        .cd-disease { color:#ff7675; }
        .cd-badge { display:inline-flex; align-items:center; gap:4px; font-size:12px; margin-top:4px; }
        .cd-section { background:rgba(13,31,15,0.4); border:1px solid rgba(127,184,138,0.1); border-radius:14px; padding:16px; margin-bottom:10px; }
        .cd-section-title { font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#5a8f6a; margin-bottom:10px; }
        .cd-cause-main { color:#e8d08a; font-weight:600; font-size:15px; margin-bottom:6px; }
        .cd-cause-sub { color:rgba(184,212,190,0.7); font-size:13px; padding:3px 0; }
        .cd-step { display:flex; gap:12px; margin-bottom:10px; align-items:flex-start; }
        .cd-step-num { width:24px; height:24px; min-width:24px; background:linear-gradient(135deg,var(--forest-light),var(--sage)); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:white; }
        .cd-step-text { font-size:14px; color:rgba(184,212,190,0.85); padding-top:3px; line-height:1.5; }
        .cd-care-row { display:flex; margin-bottom:8px; font-size:13px; align-items:center; }
        .cd-care-icon { width:24px; text-align:center; margin-right:8px; }
        .cd-care-label { color:#5a8f6a; margin-right:6px; font-size:12px; min-width:70px; }
        .cd-care-val { color:rgba(184,212,190,0.85); }
        .cd-shopee-btn { display:block; background:linear-gradient(135deg,#ee4d2d,#d03b1f); border-radius:10px; padding:12px 16px; text-align:center; color:white; font-size:13px; font-weight:600; text-decoration:none; margin-bottom:8px; transition:all .2s; }
        .cd-shopee-btn:hover { transform:translateY(-1px); box-shadow:0 4px 16px rgba(238,77,45,0.3); }
        .cd-warning { background:rgba(192,57,43,0.15); border:1px solid rgba(192,57,43,0.3); border-radius:14px; padding:16px; }
        .cd-warning-title { color:#e74c3c; font-weight:600; font-size:14px; margin-bottom:6px; }
        .cd-warning-text { color:rgba(240,237,230,0.8); font-size:13px; line-height:1.6; }
      `}</style>

      <div className="cd-wrap">

        {/* ── NAV ── */}
        <nav style={{ background:'rgba(14,45,26,0.95)', backdropFilter:'blur(10px)', padding:'0 28px', height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100, borderBottom:'1px solid rgba(127,184,138,0.12)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'var(--gold)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px' }}>🌿</div>
            <span style={{ color:'#fff', fontFamily:"'Playfair Display',serif", fontSize:'18px', fontWeight:600 }}>Vườn Kiểng AI</span>
          </div>
          <div style={{ display:'flex', gap:'4px' }}>
            {[{label:'Dashboard',href:'/dashboard'},{label:'Chẩn đoán',href:'/chan-doan'},{label:'Chợ cây',href:'/marketplace'}].map(link => (
              <Link key={link.href} href={link.href} style={{ color: link.href==='/chan-doan' ? 'var(--gold-light)' : 'rgba(255,255,255,0.65)', textDecoration:'none', fontSize:'13px', padding:'6px 14px', borderRadius:'20px', background: link.href==='/chan-doan' ? 'rgba(255,255,255,0.1)' : 'transparent' }}>{link.label}</Link>
            ))}
          </div>
          <div style={{ width:'34px', height:'34px', borderRadius:'50%', background:'var(--forest-light)', border:'2px solid var(--sage)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'13px', fontWeight:500 }}>AN</div>
        </nav>

        {/* ── HERO ── */}
        <div className="cd-hero">
          <div className="cd-hero-badge">✦ AI Chẩn Đoán Cây Cảnh</div>
          <h1>Bác Sĩ <span>Cây Xanh</span><br/>Thông Minh</h1>
          <p>Chụp ảnh → AI phân tích → Giải pháp tức thì</p>
        </div>

        <div className="cd-body">
          {/* Form */}
          <div className="cd-card">
            <div className="cd-card-title">📋 Thông tin cây</div>
            {fields.map(f => (
              <div className="cd-field" key={f.key}>
                <label>{f.icon} {f.label}</label>
                <input placeholder={f.ph} value={(info as any)[f.key]} onChange={e => setInfo({...info, [f.key]: e.target.value})} />
              </div>
            ))}
            <div className="cd-field">
              <label>📝 Mô tả thêm</label>
              <textarea placeholder="VD: Tưới mỗi sáng 1 lít, lá vàng từ rìa vào..." value={info.tinh_trang} onChange={e => setInfo({...info, tinh_trang: e.target.value})} />
            </div>
          </div>

          {/* Upload */}
          <div className="cd-card">
            <div className="cd-card-title">📸 Ảnh cây</div>
            <div className="cd-upload-area">
              {image ? (
                <>
                  <img src={image} className="cd-preview" />
                  <div className="cd-preview-overlay"><span className="cd-preview-change">🔄 Đổi ảnh</span></div>
                </>
              ) : (
                <div className="cd-upload-placeholder">
                  <div className="cd-upload-icon">🌱</div>
                  <div className="cd-upload-text">Chạm để chọn ảnh</div>
                  <div className="cd-upload-sub">Chụp rõ lá + gốc cây để AI phân tích chính xác hơn</div>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleImage} />
            </div>
          </div>

          <button className="cd-btn" onClick={analyze} disabled={!image || loading}>
            {loading ? <><span className="cd-spinner"/>Đang phân tích...</> : '🤖 Phân tích với AI'}
          </button>

          {/* Kết quả */}
          {result && (
            <div className="cd-card cd-result">
              <div className="cd-result-header">
                <span style={{fontSize:24}}>🔬</span>
                <h2>Kết quả chẩn đoán</h2>
              </div>
              <div className="cd-grid">
                <div className="cd-info-box">
                  <div className="cd-info-label">Tên cây</div>
                  <div className="cd-info-value">{result.ten_cay || 'Chưa xác định'}</div>
                  {result.do_chinh_xac_nhan_dang && <div className="cd-info-sub">Độ tin cậy: {result.do_chinh_xac_nhan_dang}</div>}
                </div>
                <div className="cd-info-box">
                  <div className="cd-info-label">Bệnh / Vấn đề</div>
                  <div className="cd-info-value cd-disease">{result.ten_benh || 'Không phát hiện'}</div>
                  <div className="cd-badge">{result.muc_do==='nang'?'🔴 Nặng':result.muc_do==='trung_binh'?'🟡 Trung bình':'🟢 Nhẹ'}</div>
                </div>
              </div>
              {result.mo_ta_benh && <div className="cd-section"><div className="cd-section-title">Mô tả triệu chứng</div><div style={{fontSize:14,color:'rgba(184,212,190,0.85)',lineHeight:1.6}}>{result.mo_ta_benh}</div></div>}
              {result.nguyen_nhan_chinh && (
                <div className="cd-section">
                  <div className="cd-section-title">Nguyên nhân</div>
                  <div className="cd-cause-main">⚡ {result.nguyen_nhan_chinh}</div>
                  {result.nguyen_nhan_phu?.map((n:string,i:number) => <div className="cd-cause-sub" key={i}>• {n}</div>)}
                </div>
              )}
              {result.cach_xu_ly?.length > 0 && (
                <div className="cd-section">
                  <div className="cd-section-title">Cách xử lý</div>
                  {result.cach_xu_ly.map((b:string,i:number) => (
                    <div className="cd-step" key={i}>
                      <div className="cd-step-num">{i+1}</div>
                      <div className="cd-step-text">{b}</div>
                    </div>
                  ))}
                </div>
              )}
              {result.lich_cham_soc && (
                <div className="cd-section">
                  <div className="cd-section-title">Lịch chăm sóc</div>
                  {[{icon:'💧',label:'Tưới nước',val:result.lich_cham_soc.tuoi_nuoc},{icon:'🌱',label:'Bón phân',val:result.lich_cham_soc.bon_phan},{icon:'☀️',label:'Ánh sáng',val:result.lich_cham_soc.anh_sang}].map((r,i) => (
                    <div className="cd-care-row" key={i}><span className="cd-care-icon">{r.icon}</span><span className="cd-care-label">{r.label}:</span><span className="cd-care-val">{r.val}</span></div>
                  ))}
                </div>
              )}
              {result.san_pham_can?.length > 0 && (
                <div className="cd-section">
                  <div className="cd-section-title">🛒 Sản phẩm cần mua</div>
                  {result.san_pham_can.map((s:string,i:number) => (
                    <a key={i} href={`https://shopee.vn/search?keyword=${encodeURIComponent(s)}`} target="_blank" className="cd-shopee-btn">🛒 {s} → Tìm trên Shopee</a>
                  ))}
                </div>
              )}
              {result.canh_bao && (
                <div className="cd-warning">
                  <div className="cd-warning-title">⚠️ Cảnh báo quan trọng</div>
                  <div className="cd-warning-text">{result.canh_bao}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
