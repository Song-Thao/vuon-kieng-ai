'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const handleReset = async () => {
    if (!password) return setMsg('Nhập mật khẩu mới!')
    if (password !== confirm) return setMsg('Mật khẩu không khớp!')
    if (password.length < 6) return setMsg('Mật khẩu tối thiểu 6 ký tự!')
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setMsg('Lỗi: ' + error.message)
    else {
      setMsg('✅ Đổi mật khẩu thành công!')
      setTimeout(() => window.location.href = '/dashboard', 2000)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-green-400 text-center mb-2">🔐 Đặt lại mật khẩu</h1>
        <p className="text-gray-400 text-center text-sm mb-6">Nhập mật khẩu mới của bạn</p>

        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-400">Mật khẩu mới</label>
            <input type="password" className="w-full bg-gray-700 rounded p-2 mt-1 text-white placeholder-gray-500"
              placeholder="Tối thiểu 6 ký tự" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-400">Xác nhận mật khẩu</label>
            <input type="password" className="w-full bg-gray-700 rounded p-2 mt-1 text-white placeholder-gray-500"
              placeholder="Nhập lại mật khẩu" value={confirm} onChange={e => setConfirm(e.target.value)} />
          </div>
        </div>

        {msg && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${msg.includes('✅') ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
            {msg}
          </div>
        )}

        <button onClick={handleReset} disabled={loading}
          className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-600 rounded-xl p-3 font-bold mt-6">
          {loading ? 'Đang xử lý...' : '💾 Đặt lại mật khẩu'}
        </button>
      </div>
    </div>
  )
}