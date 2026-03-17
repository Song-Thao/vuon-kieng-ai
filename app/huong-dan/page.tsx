'use client'
import Link from 'next/link'
import { useTheme } from '@/lib/useTheme'

const FEATURES = [
  {
    icon: '🔬',
    title: 'AI Chẩn đoán bệnh cây',
    href: '/chan-doan',
    color: '#16a34a',
    free: true,
    steps: [
      'Vào trang "Chẩn đoán AI"',
      'Nhập tên cây, môi trường trồng, vùng khí hậu',
      'Chụp ảnh lá/thân cây bị bệnh và upload',
      'AI phân tích và gợi ý thuốc điều trị ngay',
    ],
    tips: 'Chụp ảnh rõ, đủ ánh sáng, zoom vào chỗ bị bệnh để AI phân tích chính xác hơn.',
  },
  {
    icon: '✂️',
    title: 'Định hướng dáng thế Bonsai',
    href: '/phai-dinh-huong',
    color: '#c8a84b',
    free: true,
    steps: [
      'Vào trang "Định hướng phôi"',
      'Nhập thông tin cây: tên, chiều cao, hoành gốc, tuổi cây',
      'Upload ảnh cây phôi chụp rõ toàn thân + gốc',
      'Bấm "Phân Tích AI" → nhận gợi ý dáng thế + kế hoạch chi tiết',
      'Chuyển sang tab "Bonsai Editor" để phác thảo dáng thế trực quan',
    ],
    tips: 'Trong Bonsai Editor: dùng 📚 Thu viện để thêm cành mẫu, ✂️ Cắt ảnh để tạo template riêng.',
  },
  {
    icon: '🪪',
    title: 'Hộ chiếu cây',
    href: '/passport',
    color: '#3b82f6',
    free: false,
    steps: [
      'Đăng nhập tài khoản (miễn phí)',
      'Vào "Hộ chiếu cây" → bấm "+ Tạo hộ chiếu"',
      'Nhập đầy đủ thông tin: tên, tuổi, kích thước, xuất xứ',
      'Upload tối đa 5 ảnh (ảnh chính, gốc, tán lá...)',
      'Chia sẻ QR code khi mua bán để tăng uy tín',
    ],
    tips: 'Mỗi tài khoản có tối đa 5 hộ chiếu. Cập nhật ảnh định kỳ để theo dõi sự phát triển của cây.',
  },
  {
    icon: '🛒',
    title: 'Chợ cây kiểng',
    href: '/marketplace',
    color: '#f59e0b',
    free: false,
    steps: [
      'Vào "Chợ cây" → bấm "+ Đăng bán"',
      'Nhập tên, giá, mô tả chi tiết và địa điểm',
      'Upload tối đa 5 ảnh + video (nếu có)',
      'Liên kết hộ chiếu cây để tăng độ tin cậy',
      'Người mua liên hệ qua Zalo hoặc gọi điện trực tiếp',
    ],
    tips: 'Tin đăng có hộ chiếu cây và nhiều ảnh rõ ràng sẽ được mua nhanh hơn.',
  },
  {
    icon: '📚',
    title: 'Wiki & Blog cây cảnh',
    href: '/blog',
    color: '#8b5cf6',
    free: true,
    steps: [
      'Vào "Blog" để đọc kiến thức từ cộng đồng',
      'Lọc theo chủ đề: Chăm sóc, Bệnh cây, Bonsai, Thị trường...',
      'Bấm "Viết bài" để chia sẻ kinh nghiệm của bạn',
      'Bài viết được admin duyệt trong 24 giờ trước khi công khai',
    ],
    tips: 'Chia sẻ kinh nghiệm thực tế của bạn — cộng đồng sẽ đánh giá cao những bài viết có ảnh minh họa rõ ràng.',
  },
]

const FAQS = [
  { q: 'Web này có miễn phí không?', a: 'Hoàn toàn miễn phí! Chẩn đoán AI, Định hướng phôi, Blog đều dùng được ngay không cần đăng ký. Hộ chiếu cây và Đăng bán cần tạo tài khoản (miễn phí).' },
  { q: 'AI phân tích có chính xác không?', a: 'AI được huấn luyện để hỗ trợ gợi ý — không thay thế hoàn toàn kinh nghiệm của nghệ nhân. Kết quả tốt nhất khi bạn cung cấp ảnh rõ và mô tả chi tiết.' },
  { q: 'Tôi có thể đăng bán bao nhiêu cây?', a: 'Hiện tại mỗi tài khoản có thể đăng nhiều tin bán. Admin có thể điều chỉnh giới hạn theo chính sách.' },
  { q: 'Bonsai Editor dùng như thế nào?', a: 'Upload ảnh cây phôi → mở tab Bonsai Editor → dùng Thu viện thêm cành mẫu → kéo thả, xoay, đổi màu → lưu ảnh PNG.' },
  { q: 'Template Library là gì?', a: 'Thư viện ảnh PNG cành, tán lá, chậu do cộng đồng đóng góp. Ai cũng có thể upload template mới tại /editor-templates.' },
]

export default function HuongDan() {
  const { getBgStyle } = useTheme()

  return (
    <div style={{ ...getBgStyle(), minHeight: '100vh', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
      {/* HEADER */}
      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <span style={{ fontSize: '28px' }}>🌿</span>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '18px' }}>Vườn Kiểng AI</span>
        </Link>
        <Link href="/dashboard" style={{ background: '#2d6b42', color: '#fff', padding: '8px 20px', borderRadius: '20px', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
          Vào Dashboard →
        </Link>
      </div>

      {/* HERO */}
      <div style={{ textAlign: 'center', padding: '60px 24px 40px' }}>
        <div style={{ display: 'inline-block', background: 'rgba(200,168,75,0.15)', border: '1px solid rgba(200,168,75,0.3)', color: '#c8a84b', fontSize: '12px', fontWeight: 600, letterSpacing: '2px', padding: '6px 16px', borderRadius: '20px', marginBottom: '20px' }}>
          HƯỚNG DẪN SỬ DỤNG
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '42px', fontWeight: 700, marginBottom: '16px', lineHeight: 1.2 }}>
          Bắt đầu với<br />
          <span style={{ color: '#c8a84b' }}>Vườn Kiểng AI</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', maxWidth: '500px', margin: '0 auto 32px' }}>
          Hướng dẫn từng bước sử dụng tất cả tính năng — từ chẩn đoán bệnh đến định hướng dáng thế bonsai
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/chan-doan" style={{ background: '#16a34a', color: '#fff', padding: '12px 24px', borderRadius: '24px', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
            🔬 Chẩn đoán ngay
          </Link>
          <Link href="/phai-dinh-huong" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '12px 24px', borderRadius: '24px', textDecoration: 'none', fontSize: '14px', border: '1px solid rgba(255,255,255,0.2)' }}>
            ✂️ Định hướng phôi
          </Link>
        </div>
      </div>

      {/* FEATURES */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px 60px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', overflow: 'hidden' }}>
              {/* Feature header */}
              <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: `${f.color}22`, border: `1px solid ${f.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', flexShrink: 0 }}>
                  {f.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#fff' }}>{f.title}</h2>
                    <span style={{ background: f.free ? 'rgba(22,163,74,0.2)' : 'rgba(59,130,246,0.2)', color: f.free ? '#4ade80' : '#93c5fd', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px', border: `1px solid ${f.free ? 'rgba(22,163,74,0.3)' : 'rgba(59,130,246,0.3)'}` }}>
                      {f.free ? '✓ Miễn phí' : '🔑 Cần đăng ký'}
                    </span>
                  </div>
                </div>
                <Link href={f.href} style={{ background: f.color, color: '#fff', padding: '8px 18px', borderRadius: '20px', textDecoration: 'none', fontSize: '13px', fontWeight: 600, flexShrink: 0, whiteSpace: 'nowrap' }}>
                  Dùng ngay →
                </Link>
              </div>

              {/* Steps */}
              <div style={{ padding: '20px 24px' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: 600, letterSpacing: '1px', marginBottom: '12px' }}>CÁC BƯỚC THỰC HIỆN</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  {f.steps.map((step, j) => (
                    <div key={j} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: `${f.color}33`, border: `1px solid ${f.color}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: f.color, flexShrink: 0 }}>
                        {j + 1}
                      </div>
                      <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: 1.5, paddingTop: '2px' }}>{step}</p>
                    </div>
                  ))}
                </div>
                <div style={{ background: `${f.color}11`, border: `1px solid ${f.color}22`, borderRadius: '10px', padding: '12px 14px', display: 'flex', gap: '8px' }}>
                  <span style={{ fontSize: '16px', flexShrink: 0 }}>💡</span>
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.65)', fontSize: '13px', lineHeight: 1.5 }}>{f.tips}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ marginTop: '48px' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 700, marginBottom: '24px', textAlign: 'center' }}>
            ❓ Câu hỏi thường gặp
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '18px 20px' }}>
                <p style={{ margin: '0 0 8px', fontWeight: 700, color: '#c8a84b', fontSize: '15px' }}>Q: {faq.q}</p>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.75)', fontSize: '14px', lineHeight: 1.6 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ marginTop: '48px', textAlign: 'center', background: 'rgba(200,168,75,0.1)', border: '1px solid rgba(200,168,75,0.2)', borderRadius: '20px', padding: '40px 24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌱</div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Sẵn sàng bắt đầu?</h3>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '15px', marginBottom: '24px' }}>Tạo tài khoản miễn phí để dùng đầy đủ tính năng</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" style={{ background: '#c8a84b', color: '#0e2d1a', padding: '14px 32px', borderRadius: '30px', textDecoration: 'none', fontSize: '15px', fontWeight: 700 }}>
              Tạo tài khoản miễn phí →
            </Link>
            <Link href="/" style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', padding: '14px 32px', borderRadius: '30px', textDecoration: 'none', fontSize: '15px', border: '1px solid rgba(255,255,255,0.15)' }}>
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
