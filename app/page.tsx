'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) window.location.href = '/dashboard'
      else setChecking(false)
    })
  }, [])

  if (checking) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0e2d1a' }}>
      <div style={{ color: '#fff', fontSize: '24px' }}>🌿</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0e2d1a', color: '#fff' }}>
      {/* Nav */}
      <nav style={{ padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#c8a84b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🌿</div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 700 }}>Vườn Kiểng AI</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href="/marketplace" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px' }}>Chợ cây</Link>
          <Link href="/blog" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px' }}>Blog</Link>
          <Link href="/chan-doan" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px' }}>Chẩn đoán</Link>
          <Link href="/login" style={{ background: '#2d6b42', color: '#fff', padding: '8px 20px', borderRadius: '20px', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
            Đăng nhập
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>🌿</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '48px', fontWeight: 700, marginBottom: '16px', lineHeight: 1.2 }}>
          Nền tảng cây cảnh<br />
          <span style={{ color: '#c8a84b' }}>thông minh nhất Việt Nam</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '18px', marginBottom: '40px', lineHeight: 1.6 }}>
          AI chẩn đoán bệnh cây · Hộ chiếu điện tử · Chợ cây minh bạch · Wiki cây cảnh
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/login" style={{ background: '#2d6b42', color: '#fff', padding: '14px 32px', borderRadius: '30px', textDecoration: 'none', fontSize: '16px', fontWeight: 700 }}>
            Bắt đầu miễn phí →
          </Link>
          <Link href="/marketplace" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '14px 32px', borderRadius: '30px', textDecoration: 'none', fontSize: '16px', border: '1px solid rgba(255,255,255,0.2)' }}>
            Xem chợ cây
          </Link>
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 80px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px' }}>
        {[
          { icon: '📸', title: 'AI Chẩn đoán', desc: 'Upload ảnh → AI phân tích bệnh & gợi ý thuốc ngay' },
          { icon: '🪪', title: 'Hộ chiếu cây', desc: 'Lịch sử chăm sóc, giải thưởng, QR code minh bạch' },
          { icon: '🛒', title: 'Chợ cây', desc: 'Mua bán với hộ chiếu xác thực, 5 ảnh + video' },
          { icon: '📚', title: 'Wiki cây cảnh', desc: 'Kiến thức từ cộng đồng — Bonsai, chăm sóc, bệnh cây' },
        ].map((f, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>{f.icon}</div>
            <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>{f.title}</div>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', lineHeight: 1.5 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}