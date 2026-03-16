import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { tieu_de, the_loai } = await req.json()

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
            content: 'Ban la chuyen gia cay canh Viet Nam 20 nam kinh nghiem. Viet bai bang tieng Viet, gion di, thuc te, co meo hay tu vuon nha. Khong dung tu hoa my qua muc.'
          },
          {
            role: 'user',
            content: `Viet bai blog ve chu de: "${tieu_de}"
Chu de: ${the_loai}

Yeu cau:
- Dai 600-800 tu
- Co cau truc ro rang: mo dau, than bai (3-4 muc), ket luan
- Dung dau ** ** de in dam tieu de muc
- Co meo thuc te, ten thuoc/phan cu the
- Cuoi bai co phan "Luu y quan trong"
- Viet nhu nguoi co kinh nghiem chia se, khong phai sach giao khoa

Tra ve JSON:
{
  "tom_tat": "tom tat 2 cau",
  "noi_dung": "noi dung day du"
}`
          }
        ]
      })
    })

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content || '{}'
    const clean = text.replace(/```json|```/g, '').trim()
    return NextResponse.json(JSON.parse(clean))
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}