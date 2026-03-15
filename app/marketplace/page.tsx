'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Marketplace() {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { fetchListings() }, [])

  const fetchListings = async () => {
    const { data } = await supabase
      .from('listings')
      .select('*')
      .eq('trang_thai', 'dang_ban')
      .order('created_at', { ascending: false })
    setListings(data || [])
    setLoading(false)
  }

  const filtered = listings.filter(l =>
    l.ten_cay.toLowerCase().includes(search.toLowerCase()) ||
    l.vi_tri?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--warm-white)' }}>

      {/* NAV */}
      <nav style={{ background: 'var(--forest)', padding: '0 28px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🌿</div>
          <span style={{ color: '#fff', fontFamily: "'Playfair Display',serif", fontSize: '18px', fontWeight: 600 }}>Vườn Kiểng AI</span>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Chẩn đoán', href: '/chan-doan' },
            { label: 'Chợ cây',   href: '/marketplace' },
          ].map(link => (
            <Link key={link.href} href={link.href} style={{
              color: link.href === '/marketplace' ? 'var(--gold-light)' : 'rgba(255,255,255,0.65)',
              textDecoration: 'none', fontSize: '13px', padding: '6px 14px', borderRadius: '20px',
              background: link.href === '/marketplace' ? 'rgba(255,255,255,0.1)' : 'transparent',
            }}>{link.label}</Link>
          ))}
        </div>
        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--forest-light)', border: '2px solid var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '13px', fontWeight: 500 }}>AN</div>
      </nav>

      {/* BODY */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: '28px', fontWeight: 700, color: 'var(--forest)' }}>Chợ Cây Kiểng</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Mua bán minh bạch · Hộ chiếu xác thực</p>
          </div>
          <Link href="/marketplace/dang-ban" style={{
            background: 'var(--forest)', color: '#fff', textDecoration: 'none',
            padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>＋ Đăng bán</Link>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', pointerEvents: 'none' }}>🔍</span>
          <input
            style={{ width: '100%', padding: '12px 16px 12px 44px', border: '1.5px solid var(--border)', borderRadius: '12px', fontSize: '14px', fontFamily: "'DM Sans',sans-serif", background: '#fff', outline: 'none', transition: 'all .2s', color: 'var(--text)' }}
            placeholder="Tìm tên cây, địa điểm..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={e => { e.target.style.borderColor = 'var(--sage)'; e.target.style.boxShadow = '0 0 0 3px rgba(90,143,106,0.1)' }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
          />
        </div>

        {/* Stats bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {loading ? 'Đang tải...' : `${filtered.length} cây đang bán`}
          </span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.3 }}>🌿</div>
            <p style={{ fontSize: '14px' }}>Đang tải danh sách...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>🌱</div>
            <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--forest)', marginBottom: '8px' }}>
              {search ? 'Không tìm thấy cây phù hợp' : 'Chưa có cây nào được đăng bán'}
            </p>
            <p style={{ fontSize: '13px', marginBottom: '16px' }}>
              {search ? 'Thử tìm với từ khóa khác' : 'Hãy là người đầu tiên đăng bán!'}
            </p>
            <Link href="/marketplace/dang-ban" style={{ color: 'var(--forest-light)', fontWeight: 600, fontSize: '14px', textDecoration: 'none', borderBottom: '1px solid var(--forest-light)' }}>
              Đăng bán ngay →
            </Link>
          </div>
        )}

        {/* Grid */}
        {!loading && filtered.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
            {filtered.map(item => (
              <div key={item.id} style={{
                background: '#fff', border: '1px solid var(--border)', borderRadius: '16px',
                overflow: 'hidden', transition: 'all .2s', cursor: 'pointer',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = 'var(--sage)'
                el.style.transform = 'translateY(-3px)'
                el.style.boxShadow = '0 12px 28px rgba(14,45,26,0.1)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = 'var(--border)'
                el.style.transform = 'none'
                el.style.boxShadow = 'none'
              }}>

                {/* Image */}
                <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: 'var(--cream)' }}>
                  {item.hinh_anh ? (
                    <img src={item.hinh_anh} alt={item.ten_cay} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '56px' }}>🌳</div>
                  )}
                  {item.ho_chieu && (
                    <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'var(--gold)', color: 'var(--forest)', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                      Hộ chiếu ✓
                    </div>
                  )}
                </div>

                {/* Body */}
                <div style={{ padding: '14px' }}>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '16px', fontWeight: 600, color: 'var(--forest)', marginBottom: '4px' }}>
                    {item.ten_cay}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--forest-light)', marginBottom: '8px' }}>
                    {Number(item.gia).toLocaleString('vi-VN')}đ
                  </div>
                  {item.mo_ta && (
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.mo_ta}
                    </p>
                  )}
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    {item.vi_tri && `📍 ${item.vi_tri}`}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {item.zalo && (
                      <a href={`https://zalo.me/${item.zalo}`} target="_blank" style={{
                        flex: 1, padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                        border: '1.5px solid #0068ff', color: '#0068ff', background: '#fff',
                        textAlign: 'center', textDecoration: 'none', transition: 'all .2s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#0068ff'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; (e.currentTarget as HTMLElement).style.color = '#0068ff' }}>
                        Zalo
                      </a>
                    )}
                    {item.sdt && (
                      <a href={`tel:${item.sdt}`} style={{
                        flex: 1, padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                        border: '1.5px solid var(--forest-light)', color: 'var(--forest-light)', background: '#fff',
                        textAlign: 'center', textDecoration: 'none', transition: 'all .2s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--forest-light)'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; (e.currentTarget as HTMLElement).style.color = 'var(--forest-light)' }}>
                        Gọi
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Add card */}
            <Link href="/marketplace/dang-ban" style={{
              border: '1.5px dashed var(--border)', borderRadius: '16px', minHeight: '280px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              textDecoration: 'none', color: 'var(--text-muted)', transition: 'all .2s',
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--sage)'; el.style.background = '#f0f7f2' }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.background = 'transparent' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px', opacity: 0.4 }}>＋</div>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>Đăng bán cây của bạn</div>
              <div style={{ fontSize: '12px', marginTop: '4px', textAlign: 'center', padding: '0 20px' }}>Kèm Hộ chiếu → giá cao hơn 20–30%</div>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
