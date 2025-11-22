// src/app/layout.tsx

import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { GA_TRACKING_ID } from "../lib/gtag";

const sarabun = Sarabun({
  weight: ['400', '500', '700'],
  subsets: ['thai', 'latin'],
  variable: '--font-sarabun',
});

// กำหนด Base URL ของเว็บไซต์
const BASE_URL = 'https://yoodeehomecare.com';

export const metadata: Metadata = {
  // === เพิ่ม metadataBase ที่นี่ ===
  metadataBase: new URL(BASE_URL),
  // ===============================

  title: "YoodeeHomeCare - ค้นหาศูนย์ดูแลผู้สูงอายุ รายวัน รายเดือน",
  description: "บริการค้นหาศูนย์ดูแลผู้สูงอายุที่ได้มาตรฐาน ใกล้บ้านคุณ พร้อมเปรียบเทียบราคาและรีวิว ดูแลโดยทีมงานมืออาชีพ",
  keywords: ["ศูนย์ดูแลผู้สูงอายุ", "บ้านพักคนชรา", "Nursing Home", "ดูแลผู้ป่วยติดเตียง", "กายภาพบำบัดผู้สูงอายุ"],
  openGraph: {
    title: "YoodeeHomeCare - ค้นหาศูนย์ดูแลผู้สูงอายุที่ดีที่สุด",
    description: "ค้นหาสถานที่ดูแลคนที่คุณรัก สะดวก ปลอดภัย มาตรฐานวิชาชีพ",
    url: BASE_URL, // ใช้ค่าที่กำหนดไว้
    siteName: "YoodeeHomeCare",
    images: [
      {
        url: "/YooDeeHomeCare.png", // Next.js จะรวม BASE_URL เข้ากับ Path นี้โดยอัตโนมัติ
        width: 1200,
        height: 630,
      },
    ],
    locale: "th_TH",
    type: "website",
  },
};

import Header from "../components/Header";
import Footer from "../components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${sarabun.className} bg-gray-50 min-h-screen flex flex-col`}>
        {/* <Header /> */}
        <main className="bg-white flex-grow">
          {children}
        </main>
        {/* <Footer /> */}
      </body>

      {/* Google Analytics Scripts */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_TRACKING_ID}');
        `}
      </Script>
    </html>
  );
}