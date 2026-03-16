'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Login() {
  const [mode, setMode] = useState<'login'|'register'|'forgot'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    // Nếu URL có token reset → redirect sang trang reset
    const hash = window.location.hash
    if (hash.includes('type=recovery')) {
      window.location.href = '/reset-password' + hash
    }
  }, [])

  const handleSubmit = async () => {
    if (!email) return setMsg('Vui lòng nhập email!')
    setLoading(true)
    setMsg('')

    if (mode === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      if (error) setMsg('Lỗi: ' + error.message)
      else setMsg('✅ Đã gửi link vào email! Kiểm tra hộp thư (kể cả spam).')
    } else if (mode === 'register') {
      if (!password) return setMsg('Vui lòng nhập mật khẩu!')
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { name, phone } }
      })
      if (error) setMsg('Lỗi: ' + error.message)
      else setMsg('✅ Đăng ký thành công! Kiểm tra email để xác nhận.')
    } else {
      if (!password) return setMsg('Vui lòng nhập mật khẩu!')
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMsg('Lỗi: ' + error.message)
      else window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-green-400 text-center mb-2">🌿 Vườn Kiểng AI</h1>
        <p className="text-gray-400 text-center text-sm mb-6">
          {mode === 'login' ? 'Đăng nhập để tiếp tục' : mode === 'register' ? 'Tạo tài khoản mới' : 'Đặt lại mật khẩu'}
        </p>

        {mode !== 'forgot' && (
          <div className="flex bg-gray-700 rounded-lg p-1 mb-6">
            <button onClick={() => { setMode('login'); setMsg('') }}
              className={`flex-1 py-2 rounded-md text-sm font-semibold transition ${mode === 'login' ? 'bg-green-600 text-white' : 'text-gray-400'}`}>
              Đăng nhập
            </button>
            <button onClick={() => { setMode('register'); setMsg('') }}
              className={`flex-1 py-2 rounded-md text-sm font-semibold transition ${mode === 'register' ? 'bg-green-600 text-white' : 'text-gray-400'}`}>
              Đăng ký
            </button>
          </div>
        )}

        <div className="space-y-3">
          {mode === 'register' && (
            <>
              <div>
                <label className="text-sm text-gray-400">Họ tên</label>
                <input className="w-full bg-gray-700 rounded p-2 mt-1 text-white placeholder-gray-500"
                  placeholder="Nguyễn Văn A" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-gray-400">Số điện thoại</label>
                <input className="w-full bg-gray-700 rounded p-2 mt-1 text-white placeholder-gray-500"
                  placeholder="0917161003" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
            </>
          )}
          <div>
            <label className="text-sm text-gray-400">Email</label>
            <input type="email" className="w-full bg-gray-700 rounded p-2 mt-1 text-white placeholder-gray-500"
              placeholder="email@gmail.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          {mode !== 'forgot' && (
            <div>
              <label className="text-sm text-gray-400">Mật khẩu</label>
              <input type="password" className="w-full bg-gray-700 rounded p-2 mt-1 text-white placeholder-gray-500"
                placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>
          )}
        </div>

        {mode === 'login' && (
          <button onClick={() => { setMode('forgot'); setMsg('') }}
            className="text-green-400 text-xs mt-2 hover:underline block">
            Quên mật khẩu?
          </button>
        )}

        {msg && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${msg.includes('✅') ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
            {msg}
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading}
          className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-600 rounded-xl p-3 font-bold mt-6">
          {loading ? 'Đang xử lý...' : mode === 'login' ? '🔑 Đăng nhập' : mode === 'register' ? '✨ Đăng ký' : '📧 Gửi link đặt lại MK'}
        </button>

        {mode === 'forgot' && (
          <button onClick={() => { setMode('login'); setMsg('') }}
            className="w-full text-gray-400 text-sm mt-3 hover:text-white">
            ← Quay lại đăng nhập
          </button>
        )}

        <p className="text-center text-gray-500 text-sm mt-4">
          <a href="/marketplace" className="text-green-400 hover:underline">← Quay lại chợ cây</a>
        </p>
      </div>
    </div>
  )
}