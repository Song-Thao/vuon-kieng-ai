'use client'
import Link from 'next/link'

const stats = [
  { label: 'Cây trong vườn',      value: '0',  icon: '🪴', accent: '#2d6b42' },
  { label: 'Chẩn đoán tháng này', value: '0',  icon: '🔬', accent: '#2d6b42' },
  { label: 'Giá trị vườn ảo',     value: '0đ', icon: '💰', accent: '#c8a84b' },
  { label: 'Nhắc nhở hôm nay',    value: '0',  icon: '🔔', accent: '#2d6b42' },
]

const actions = [
  { label: 'Chẩn đoán bệnh cây', desc: 'Upload ảnh → AI phân tích bệnh & gợi ý thuốc ngay', icon: '📸', href: '/chan-doan', highlight: true },
  { label: 'Hộ chiếu cây',       desc: 'Xem thông tin, lịch sử chăm sóc & QR code',          icon: '🪪', href: '/passport',   highlight: false },
  { label: 'Chợ cây kiểng',      desc: 'Mua bán cây với Hộ chiếu minh bạch',                 icon: '🛒', href: '/marketplace', highlight: false },
]

export default function Dashboard() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--warm-white)' }}>
      <nav style={{ background: 'var(--forest)', padding: '0 28px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🌿</div>
          <span style={{ color: '#fff', fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 600 }}>Vườn Kiểng AI</span>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[{label:'Dashboard',href:'/dashboard'},{label:'Chẩn đoán',href:'/chan-doan'},{label:'Chợ cây',href:'/marketplace'}].map(link => (
            <Link key={link.href} href={link.href} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '13px', padding: '6px 14px', borderRadius: '20px' }}>{link.label}</Link>
          ))}
        </div>
        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--forest-light)', border: '2px solid var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '13px', fontWeight: 500 }}>AN</div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 700, color: 'var(--forest)' }}>Chào buổi chiều, A Nguyễn 🌱</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Vườn của bạn đang chờ được chăm sóc hôm nay</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '28px' }}>
          {stats.map((s,i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#eaf3de', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '12px' }}>{s.icon}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '30px', fontWeight: 700, color: s.accent, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 600, color: 'var(--forest)', marginBottom: '16px' }}>Truy cập nhanh</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '32px' }}>
          {actions.map((a,i) => (
            <Link key={i} href={a.href} style={{ background: a.highlight ? 'linear-gradient(135deg,#2d6b42,#0e2d1a)' : 'var(--forest)', borderRadius: '16px', padding: '24px', textDecoration: 'none', display: 'block', position: 'relative' }}>
              <div style={{ fontSize: '28px', marginBottom: '14px' }}>{a.icon}</div>
              <div style={{ position: 'absolute', top: '20px', right: '20px', color: 'rgba(255,255,255,0.3)', fontSize: '18px' }}>↗</div>
              <div style={{ color: '#fff', fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>{a.label}</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px', lineHeight: 1.5 }}>{a.desc}</div>
            </Link>
          ))}
        </div>

        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 600, color: 'var(--forest)', marginBottom: '16px' }}>Vườn của bạn</p>
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
            {[
              { name: 'Mai Vàng',    age: '5 tuổi', loc: 'Cà Mau', icon: '🌳', status: 'Khỏe mạnh', bg: '#eaf3de', color: '#3b6d11' },
              { name: 'Sanh Bonsai', age: '3 tuổi', loc: 'Cà Mau', icon: '🎋', status: 'Cần tưới',  bg: '#faeeda', color: '#854f0b' },
            ].map((plant,i) => (
              <div key={i} style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>{plant.icon}</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '15px', fontWeight: 600, color: 'var(--forest)' }}>{plant.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{plant.age} · {plant.loc}</div>
                <div style={{ marginTop: '10px' }}>
                  <span style={{ background: plant.bg, color: plant.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>{plant.status}</span>
                </div>
              </div>
            ))}
            <Link href="/them-cay" style={{ border: '1.5px dashed var(--border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '120px', textDecoration: 'none', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '28px', marginBottom: '6px', color: 'var(--border)' }}>＋</div>
              <div style={{ fontSize: '13px' }}>Thêm cây mới</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
