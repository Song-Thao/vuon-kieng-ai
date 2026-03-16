import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { image, info } = await req.json()

    const tenCay = info?.ten_cay || 'chua biet'
    const chieuCao = info?.chieu_cao || 'chua biet'
    const hoanh = info?.hoanh_goc || 'chua biet'
    const tuoi = info?.tuoi_cay || 'chua biet'
    const moTa = info?.mo_ta || 'khong co'

    const prompt = `Ban la Nghe nhan Bonsai Viet Nam 30 nam kinh nghiem, chuyen dinh huong cay phoi thanh tac pham nghe thuat.

Thong tin cay phoi:
- Ten cay: ${tenCay}
- Chieu cao uoc tinh: ${chieuCao}
- Hoanh goc: ${hoanh}
- Tuoi cay: ${tuoi}
- Mo ta them: ${moTa}

Phan tich ky anh cay phoi nay va tra ve JSON chuyen sau:
{
  "nhan_dinh_chung": "danh gia tong quan ve tiem nang cay phoi nay (2-3 cau)",
  "dac_diem_than": "dac diem duong than (thang/cong/doc/hoang...) va y nghia",
  "dang_the_goi_y": [
    {
      "ten_the": "Ten dang the (VD: The Truc, The Van Nhan, The Huyen...)",
      "do_phu_hop": "XX% phu hop",
      "mo_ta": "tai sao dang the nay phu hop voi cay nay",
      "uu_diem": "diem manh neu theo dang nay",
      "kho_khan": "thach thuc khi tao dang nay"
    }
  ],
  "ke_hoach_uon_canh": [
    {
      "giai_doan": "Giai doan 1 (thang 1-3)",
      "viec_can_lam": "mo ta cu the viec can lam",
      "ky_thuat": "ky thuat thuc hien",
      "luu_y": "dieu can chu y"
    }
  ],
  "diem_cat_chien_luoc": [
    "Vi tri canh nen cat de tao dang (mo ta vi tri cu the)",
    "Ly do cat canh nay"
  ],
  "vat_tu_can_chuan_bi": [
    {
      "ten": "Ten vat tu cu the",
      "quy_cach": "Kich co/thong so (VD: Day nhom 2mm, 3mm)",
      "so_luong": "uoc tinh",
      "muc_dich": "dung de lam gi"
    }
  ],
  "lo_trinh_thoi_gian": {
    "giai_doan_1": "0-6 thang: viec gi",
    "giai_doan_2": "6-12 thang: viec gi",
    "giai_doan_3": "1-3 nam: viec gi",
    "hoan_thien": "uoc tinh bao lau de co tac pham"
  },
  "du_bao_gia_tri": {
    "gia_tri_hien_tai": "uoc tinh gia phoi hien tai",
    "gia_tri_sau_1_nam": "neu cham soc dung huong",
    "gia_tri_hoan_thien": "neu thanh tac pham dep",
    "he_so_tang": "uoc tinh tang X lan"
  },
  "diem_manh_noi_bat": "diem doc dao nhat cua cay phoi nay ma nghe nhan nen giu lai",
  "canh_bao": "dieu tuyet doi khong nen lam voi cay phoi nay"
}
Chi JSON thuan, khong markdown.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 3000,
        messages: [
          {
            role: 'system',
            content: 'Ban la nghe nhan Bonsai Viet Nam chuyen sau, dac biet gioi dinh huong cay phoi. Tra loi bang tieng Viet chuyen nganh, thuc te, co kinh nghiem thuc chien. Chi tra ve JSON thuan.'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: image } }
            ]
          }
        ]
      })
    })

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content || '{}'
    console.log('PHAI AI:', text.slice(0, 200))
    try {
      const clean = text.replace(/```json|```/g, '').trim()
      return NextResponse.json(JSON.parse(clean))
    } catch {
      return NextResponse.json({ error: 'Khong phan tich duoc', raw: text.slice(0, 300) })
    }
  } catch (e) {
    console.error('ERR:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}