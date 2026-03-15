'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Login() {
  const [mode, setMode] = useState<'login'|'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const handleSubmit = async () => {
    if (!email || !password) return setMsg('Vui lòng nhập đầy đủ!')
    setLoading(true); setMsg('')
    if (mode === 'register') {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { name, phone } } })
      if (error) setMsg('Lỗi: ' + error.message)
      else setMsg('✅ Đăng ký thành công! Kiểm tra email để xác nhận.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMsg('Lỗi: ' + error.message)
      else window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  const fields = mode === 'register'
    ? [
        { key: 'name',     label: 'Họ tên',           type: 'text',     icon: '👤', ph: 'Nguyễn Văn A',   val: name,     set: setName },
        { key: 'phone',    label: 'Số điện thoại',    type: 'tel',      icon: '📞', ph: '0917 161 003',   val: phone,    set: setPhone },
        { key: 'email',    label: 'Email',             type: 'email',    icon: '✉️', ph: 'email@gmail.com', val: email,    set: setEmail },
        { key: 'password', label: 'Mật khẩu',         type: 'password', icon: '🔒', ph: '••••••••',        val: password, set: setPassword },
      ]
    : [
        { key: 'email',    label: 'Email',             type: 'email',    icon: '✉️', ph: 'email@gmail.com', val: email,    set: setEmail },
        { key: 'password', label: 'Mật khẩu',         type: 'password', icon: '🔒', ph: '••••••••',        val: password, set: setPassword },
      ]

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, var(--forest) 0%, #0a2010 50%, #1a3a20 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: "'DM Sans', sans-serif",
      position: 'relative', overflow: 'hidden',
    }}>
      {/* decorative bg circles */}
      <div style={{ position:'absolute', top:'-80px', right:'-80px', width:'300px', height:'300px', borderRadius:'50%', background:'rgba(200,168,75,0.06)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-60px', left:'-60px', width:'240px', height:'240px', borderRadius:'50%', background:'rgba(90,143,106,0.08)', pointerEvents:'none' }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--gold), #a07830)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', margin: '0 auto 14px',
            boxShadow: '0 8px 24px rgba(200,168,75,0.3)',
          }}>🌿</div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '26px', fontWeight: 700, color: '#f0ede6',
            margin: '0 0 6px',
          }}>Vườn Kiểng AI</h1>
          <p style={{ color: 'rgba(184,212,190,0.6)', fontSize: '13px' }}>
            {mode === 'login' ? 'Đăng nhập để tiếp tục' : 'Tạo tài khoản miễn phí'}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(127,184,138,0.15)',
          borderRadius: '24px',
          padding: '28px',
          backdropFilter: 'blur(12px)',
        }}>

          {/* Tab switcher */}
          <div style={{
            display: 'flex', background: 'rgba(0,0,0,0.25)', borderRadius: '12px',
            padding: '4px', marginBottom: '24px',
          }}>
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setMsg('') }} style={{
                flex: 1, padding: '9px', border: 'none', borderRadius: '9px', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 600,
                transition: 'all .2s',
                background: mode === m ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: mode === m ? '#a8d5b5' : 'rgba(184,212,190,0.45)',
              }}>
                {m === 'login' ? 'Đăng nhập' : 'Đăng ký'}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
            {fields.map(f => (
              <div key={f.key}>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: '11px', fontWeight: 500, color: 'rgba(184,212,190,0.7)',
                  textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '7px',
                }}>
                  <span>{f.icon}</span>{f.label}
                </label>
                <input
                  type={f.type}
                  placeholder={f.ph}
                  value={f.val}
                  onChange={e => f.set(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  style={{
                    width: '100%', padding: '11px 14px',
                    background: 'rgba(13,31,15,0.5)',
                    border: '1px solid rgba(127,184,138,0.2)',
                    borderRadius: '10px', color: '#f0ede6',
                    fontFamily: "'DM Sans', sans-serif", fontSize: '14px',
                    outline: 'none', transition: 'all .2s',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'rgba(127,184,138,0.5)'
                    e.target.style.boxShadow = '0 0 0 3px rgba(90,143,106,0.1)'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(127,184,138,0.2)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
            ))}
          </div>

          {/* Message */}
          {msg && (
            <div style={{
              padding: '11px 14px', borderRadius: '10px', fontSize: '13px',
              marginBottom: '16px', lineHeight: 1.5,
              background: msg.includes('✅') ? 'rgba(46,125,50,0.2)' : 'rgba(192,57,43,0.2)',
              border: `1px solid ${msg.includes('✅') ? 'rgba(46,125,50,0.35)' : 'rgba(192,57,43,0.35)'}`,
              color: msg.includes('✅') ? '#a8d5b5' : '#ff9f9f',
            }}>
              {msg}
            </div>
          )}

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading} style={{
            width: '100%', padding: '14px',
            background: loading ? 'rgba(90,143,106,0.4)' : 'linear-gradient(135deg, var(--forest-light), var(--sage))',
            border: 'none', borderRadius: '12px',
            color: '#fff', fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all .2s',
          }}
          onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none' }}>
            {loading ? '⏳ Đang xử lý...' : mode === 'login' ? '🌿 Đăng nhập' : '🌱 Tạo tài khoản'}
          </button>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'rgba(184,212,190,0.45)' }}>
          <Link href="/marketplace" style={{ color: 'rgba(168,213,181,0.7)', textDecoration: 'none' }}>
            ← Quay lại chợ cây
          </Link>
        </p>
      </div>
    </div>
  )
}
