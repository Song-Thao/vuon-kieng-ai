import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { image, info } = await req.json()

    const tenCay = info?.ten_cay || 'chua biet'
    const moiTruong = info?.moi_truong || 'chua biet'
    const vung = info?.vung || 'mien nam'
    const tuoiCay = info?.tuoi_cay || 'chua biet'
    const moTa = info?.tinh_trang || 'khong co'

    const prompt = `Ban la chuyen gia cay canh Viet Nam 20 nam kinh nghiem, dac biet chuyen sau ve:
- Bonsai, cay kieng mien Nam Viet Nam
- Benh ly cay trong: nam, vi khuan, sau hai, thieu chat dinh duong
- Dac tinh tung loai cay: Mai vang, Sanh, Sung, Tung, Kim tien, Phat tai, Lan...
- Moi truong trong: chau, dat vuon, moi chuyen chau, khi hau nhiet doi

THONG TIN NGUOI DUNG CUNG CAP (RAT QUAN TRONG - phai dua vao day de phan tich):
- Ten cay: ${tenCay}
- Moi truong trong: ${moiTruong}  
- Vung khi hau: ${vung}
- Tuoi cay / thoi gian trong: ${tuoiCay}
- Mo ta cu the: ${moTa}

QUY TAC BAT BUOC:
1. Neu nguoi dung da noi ten cay -> PHAI dung ten do, KHONG duoc doan sang cay khac
2. Neu la "mai vang moi vo chau" -> phan tich theo dac tinh mai vang + stress chuyen chau
3. Neu la "mien Nam" -> phan tich theo khi hau nong am, mua kho ro ret
4. Phai neu RO RANG nguyen nhan chinh vs phu, khong chung chung
5. San pham phai LA TEN THUOC/PHAN cu the ban o Viet Nam (khong noi chung "phan huu co")

Vi du san pham dung: "Thuoc tru nam Ridomil Gold", "Phan bon la Growmore 30-10-10", "Thuoc tru sau Confidor 100SL"
Vi du san pham SAI: "phan huu co", "thuoc tru sau", "dung dich duong la"

Tra ve JSON chinh xac (khong markdown, khong giai thich):
{
  "ten_cay": "ten cay + ten khoa hoc neu biet",
  "do_chinh_xac_nhan_dang": "XX% - ly do ngan",
  "moi_truong_song": "mo ta moi truong dang trong",
  "ten_benh": "ten benh/hien tuong cu the",
  "mo_ta_benh": "mo ta trieu chung nhin thay trong anh",
  "nguyen_nhan_chinh": "nguyen nhan cu the nhat phu hop voi loai cay + moi truong nay",
  "nguyen_nhan_phu": ["nguyen nhan 2", "nguyen nhan 3"],
  "muc_do": "nhe/trung_binh/nang",
  "cach_xu_ly": [
    "Buoc 1: hanh dong cu the ngay hom nay",
    "Buoc 2: hanh dong tiep theo",
    "Buoc 3: phong ngua tai phat"
  ],
  "lich_cham_soc": {
    "tuoi_nuoc": "tan suat + luong nuoc cu the cho loai cay nay o moi truong nay",
    "bon_phan": "ten phan cu the + lieu luong + tan suat",
    "anh_sang": "so gio nang + thoi diem trong ngay"
  },
  "san_pham_can": [
    "Ten thuoc/phan cu the 1 (co ban tren Shopee VN)",
    "Ten thuoc/phan cu the 2"
  ],
  "canh_bao": "dieu tuyet doi tranh voi loai cay nay trong tinh trang nay"
}`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 2000,
        messages: [
          {
            role: 'system',
            content: 'Ban la chuyen gia cay canh Viet Nam. Luon tra loi bang tieng Viet. Neu nguoi dung noi ten cay, PHAI dung ten do. Chi tra ve JSON thuan.'
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
    console.log('AI:', text.slice(0, 200))
    try {
      const clean = text.replace(/```json|```/g, '').trim()
      return NextResponse.json(JSON.parse(clean))
    } catch {
      return NextResponse.json({
        ten_cay: tenCay,
        ten_benh: 'Khong phan tich duoc',
        mo_ta_benh: text.slice(0, 300),
        nguyen_nhan_chinh: 'Vui long thu lai voi anh ro hon',
        nguyen_nhan_phu: [],
        muc_do: 'nhe',
        cach_xu_ly: ['Chup lai anh ro hon', 'Dam bao anh chup duoi anh sang tot'],
        lich_cham_soc: { tuoi_nuoc: '', bon_phan: '', anh_sang: '' },
        san_pham_can: [],
        canh_bao: ''
      })
    }
  } catch (e) {
    console.error('ERR:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}