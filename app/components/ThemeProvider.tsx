'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function hexToRgb(hex: string) {
  try {
    const r = parseInt(hex.slice(1,3),16)
    const g = parseInt(hex.slice(3,5),16)
    const b = parseInt(hex.slice(5,7),16)
    return `${r},${g},${b}`
  } catch { return '10,31,15' }
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [cfg, setCfg] = useState<any>({
    bg_color: '#0a1f0f', bg_image: '', hero_bg_image: '',
    bg_overlay: '0.35', primary_color: '#c8a84b',
  })

  useEffect(() => {
    supabase.from('admin_settings').select('*').then(({ data }) => {
      if (data) {
        const obj: any = {}
        data.forEach((r: any) => obj[r.key] = r.value)
        setCfg((prev: any) => ({ ...prev, ...obj }))
      }
    })
  }, [])

  const overlay = parseFloat(cfg.bg_overlay || '0.35')
  const bgImage = cfg.bg_image || cfg.hero_bg_image || ''
  const bgColor = cfg.bg_color || '#0a1f0f'

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        body {
          background-color: ${bgColor} !important;
          ${bgImage ? `background-image: url('${bgImage}'); background-size: cover; background-position: center; background-attachment: fixed;` : ''}
        }
        body::before {
          content: '';
          position: fixed;
          inset: 0;
          background: rgba(${hexToRgb(bgColor)}, ${overlay});
          pointer-events: none;
          z-index: 0;
        }
        #__next, body > * { position: relative; z-index: 1; }
        :root { --primary: ${cfg.primary_color || '#c8a84b'}; --bg: ${bgColor}; }
      `}} />
      {children}
    </>
  )
}
