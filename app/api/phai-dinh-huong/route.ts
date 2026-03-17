import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { info, image } = await req.json()
    const ten = info?.ten_cay || 'chua biet'
    const cao = info?.chieu_cao || 'chua ro'
    const goc = info?.hoanh_goc || 'chua ro'
    const tuoi = info?.tuoi_cay || 'chua ro'
    const mota = info?.mo_ta || 'khong co'

    const prompt = `Ban la Nghe nhan Bonsai Viet Nam 30 nam kinh nghiem, chuyen dinh huong cay phoi thanh tac pham nghe thuat. Tra loi bang tieng Viet, chi tiet va thuc te.

Thong tin cay phoi:
- Ten cay: ${ten}
- Chieu cao: ${cao}
- Hoanh goc: ${goc}
- Tuoi cay: ${tuoi}
- Mo ta: ${mota}

Hay phan tich ky anh cay phoi va tra ve JSON theo dung cu phap nay, chi JSON thuan khong markdown:
{
  "nhan_dinh_chung": "danh gia tong quan tiem nang 2-3 cau",
  "dac_diem_than": "dac diem duong than goc re diem cat",
  "diem_manh_noi_bat": "diem doc dao can giu lai",
  "dang_the_goi_y": [
    {"ten_the": "ten dang", "do_phu_hop": "85%", "mo_ta": "ly do phu hop", "uu_diem": "diem manh", "kho_khan": "thach thuc"}
  ],
  "ke_hoach_uon_canh": [
    {"giai_doan": "Giai doan 1 (thang 1-3)", "viec_can_lam": "mo ta", "ky_thuat": "ky thuat", "luu_y": "luu y"}
  ],
  "diem_cat_chien_luoc": ["vi tri 1", "vi tri 2"],
  "vat_tu_can_chuan_bi": [
    {"ten": "ten vat tu", "quy_cach": "kich co", "so_luong": "so luong", "muc_dich": "muc dich"}
  ],
  "lo_trinh_thoi_gian": {
    "giai_doan_1": "0-6 thang: ...",
    "giai_doan_2": "6-12 thang: ...",
    "giai_doan_3": "1-3 nam: ...",
    "hoan_thien": "uoc tinh..."
  },
  "du_bao_gia_tri": {
    "gia_tri_hien_tai": "x trieu",
    "gia_tri_sau_1_nam": "x trieu",
    "gia_tri_hoan_thien": "x trieu",
    "he_so_tang": "tang x lan"
  },
  "canh_bao": "tuyet doi khong nen lam gi"
}`

    const messages: any[] = [
      { role: 'system', content: 'Ban la nghe nhan bonsai Viet Nam 30 nam kinh nghiem. Chi tra ve JSON thuan, khong markdown, khong giai thich them.' },
      { role: 'user', content: image
        ? [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: image, detail: 'high' } }]
        : [{ type: 'text', text: prompt }]
      }
    ]

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({ model: 'gpt-4o', max_tokens: 3000, messages })
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error?.message || 'OpenAI error')

    const text = data.choices?.[0]?.message?.content || '{}'
    const clean = text.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)
    return NextResponse.json({ success: true, result })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 })
  }
}
