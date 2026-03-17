import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vườn Kiểng AI — Nơi buôn bán, giao lưu và chia sẻ kinh nghiệm cây cảnh",
  description: "Hỗ trợ định hướng, tạo thế bonsai cùng các công cụ và AI phân tích cây. Chẩn đoán bệnh cây, hộ chiếu điện tử, chợ cây kiểng Việt Nam.",
  keywords: "cây cảnh, bonsai, cây kiểng, chẩn đoán bệnh cây, định hướng dáng thế, hộ chiếu cây, chợ cây",
  authors: [{ name: "Vườn Kiểng AI" }],
  openGraph: {
    title: "Vườn Kiểng AI — Cộng đồng cây cảnh Việt Nam",
    description: "Hỗ trợ định hướng, tạo thế bonsai cùng các công cụ và AI phân tích cây",
    url: "https://vuon-kieng-ai.vercel.app",
    siteName: "Vườn Kiểng AI",
    locale: "vi_VN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0e2d1a" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
