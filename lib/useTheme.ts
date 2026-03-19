import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface Theme {
  bg_color: string
  bg_image: string
  bg_overlay: string
  primary_color: string
  secondary_color: string
}

const DEFAULT_THEME: Theme = {
  bg_color: '#0e2d1a',
  bg_image: '',
  bg_overlay: '0.5',
  primary_color: '#c8a84b',
  secondary_color: '#2d6b42',
}

let cachedTheme: Theme | null = null

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(cachedTheme || DEFAULT_THEME)
  const [loading, setLoading] = useState(!cachedTheme)

  useEffect(() => {
    if (cachedTheme) { setTheme(cachedTheme); setLoading(false); return }
    supabase.from('admin_settings').select('*')
      .in('key', ['bg_color','bg_image','bg_overlay','primary_color','secondary_color','hero_bg_image'])
      .then(({ data }) => {
        if (data && data.length > 0) {
          const obj: any = {}
          data.forEach((r: any) => obj[r.key] = r.value)
          const t = { ...DEFAULT_THEME, ...obj }
          cachedTheme = t
          setTheme(t)
        }
        setLoading(false)
      })
  }, [])

  const getBgStyle = () => {
    const bgImg = (theme as any).hero_bg_image || theme.bg_image
    if (bgImg) {
      return {
        background: `linear-gradient(rgba(0,0,0,${theme.bg_overlay}), rgba(0,0,0,${theme.bg_overlay})), url(${bgImg}) center/cover no-repeat fixed`,
        backgroundColor: theme.bg_color,
      }
    }
    return { background: theme.bg_color }
  }

  return { theme, loading, getBgStyle }
}
