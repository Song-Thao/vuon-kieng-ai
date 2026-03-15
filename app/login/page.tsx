'use client'
import { useState } from 'react'
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
    setLoading(true)
    setMsg('')

    if (mode === 'register') {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { name, phone } }
      })
      if (error) setMsg('Lỗi: ' + error.message)
      else setMsg('✅ Đăng ký thành công! Kiểm tra email để xác nhận.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMsg('Lỗi: ' + error.message)
      else window.location.href = '/marketplace/dang-ban'
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-green-400 text-center mb-2">🌿 Vườn Kiểng AI</h1>
        <p className="text-gray-400 text-center text-sm mb-6">
          {mode === 'login' ? 'Đăng nhập để đăng bán cây' : 'Tạo tài khoản mới'}
        </p>

        <div className="flex bg-gray-700 rounded-lg p-1 mb-6">
          <button onClick={() => setMode('login')}
            className={`flex-1 py-2 rounded-md text-sm font-semibold transition ${mode === 'login' ? 'bg-green-600 text-white' : 'text-gray-400'}`}>
            Đăng nhập
          </button>
          <button onClick={() => setMode('register')}
            className={`flex-1 py-2 rounded-md text-sm font-semibold transition ${mode === 'register' ? 'bg-green-600 text-white' : 'text-gray-400'}`}>
            Đăng ký
          </button>
        </div>

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
          <div>
            <label className="text-sm text-gray-400">Mật khẩu</label>
            <input type="password" className="w-full bg-gray-700 rounded p-2 mt-1 text-white placeholder-gray-500"
              placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
        </div>

        {msg && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${msg.includes('✅') ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
            {msg}
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading}
          className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-600 rounded-xl p-3 font-bold mt-6">
          {loading ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
        </button>

        <p className="text-center text-gray-500 text-sm mt-4">
          <a href="/marketplace" className="text-green-400 hover:underline">← Quay lại chợ cây</a>
        </p>
      </div>
    </div>
  )
}