import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function uploadImage(base64: string, folder: string = 'general'): Promise<string | null> {
  try {
    // Chuyển base64 thành blob
    const res = await fetch(base64)
    const blob = await res.blob()
    
    // Tạo tên file unique
    const ext = blob.type === 'image/png' ? 'png' : 'jpg'
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    
    // Upload lên Supabase Storage
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, blob, {
        contentType: blob.type,
        upsert: false
      })
    
    if (error) {
      console.error('Upload error:', error)
      return null
    }
    
    // Lấy public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(fileName)
    
    return publicUrl
  } catch (e) {
    console.error('Upload failed:', e)
    return null
  }
}