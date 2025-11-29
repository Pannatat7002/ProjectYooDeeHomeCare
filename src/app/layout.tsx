// src/app/layout.tsx

import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { GA_TRACKING_ID } from "../lib/gtag";
import { Analytics } from "@vercel/analytics/next";

const sarabun = Sarabun({
  weight: ['400', '500', '700'],
  subsets: ['thai', 'latin'],
  variable: '--font-sarabun',
});

// กำหนด Base URL ของเว็บไซต์
const BASE_URL = 'https://ThaiCareCenter.com';

export const metadata: Metadata = {
  // === เพิ่ม metadataBase ที่นี่ ===
  metadataBase: new URL(BASE_URL),
  // ===============================

  // ** 1. SEO หลัก (Title & Description & Keywords) **
  // ใช้ Title ที่เน้นคำค้นหาหลักและบริการสำคัญ
  title: "ThaiCareCenter - ค้นหาศูนย์ดูแลผู้สูงอายุ/ผู้ป่วยพักฟื้น รายวัน รายเดือน",  // ใช้ Description ที่ดึงดูดใจและใส่คุณสมบัติเด่นที่ปรากฏในภาพ (การเปรียบเทียบราคา/ช่วงราคา)
  description:
    "ยกระดับคุณภาพชีวิตของผู้สูงอายุและผู้ป่วยพักฟื้น ด้วยการค้นหา ศูนย์ดูแลที่ได้มาตรฐานสูงสุด พร้อมเปรียบเทียบราคา รีวิว และบริการ รายวัน/รายเดือน ใกล้บ้านคุณ ให้คนที่คุณรักได้รับการดูแลที่ดีที่สุดอย่างแท้จริง",  // เพิ่ม Keywords ที่ครอบคลุมคำค้นหาที่เกี่ยวข้อง
  keywords:
    ["ศูนย์ดูแลผู้สูงอายุ", "บ้านพักคนชรา", "Nursing Home", "ดูแลผู้ป่วยพักฟื้น",
      "กายภาพบำบัดผู้สูงอายุ", "ศูนย์ดูแลมาตรฐาน", "ยกระดับคุณภาพชีวิตผู้สูงอายุ",
      "ดูแลรายวัน", "ดูแลรายเดือน", "เปรียบเทียบศูนย์ดูแล",
      // <<< เพิ่มคำที่เน้นความสะดวก/ทำเล >>>
      "ศูนย์ดูแลผู้สูงอายุใกล้ฉัน",
      "ศูนย์ดูแลผู้สูงอายุใกล้บ้าน",
      "ค้นหาสะดวก",
      "ศูนย์ดูแลใกล้บ้านพักคนชรา"],
  // ** 2. Robots Tag (สำหรับควบคุม Bot ของ Search Engine) **
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },

  // ** 3. Icons (Favicon) **
  icons: {
    icon: '/logo_thai_care_center_v1.png',
    shortcut: '/logo_thai_care_center_v1.png',
    apple: '/logo_thai_care_center_v1.png',
  },

  // ** 4. Open Graph (สำหรับแชร์บน Facebook, Line) **
  openGraph: {
    title: "ThaiCareCenter - เว็บไซต์รวบรวมศูนย์ดูแลผู้สูงอายุไทย", // Title สำหรับ Social Media
    description: "ค้นหาสถานที่ดูแลคนที่คุณรัก สะดวก ปลอดภัย มาตรฐานวิชาชีพ พร้อมเปรียบเทียบราคาและรีวิว", // Description สำหรับ Social Media
    url: BASE_URL,
    siteName: "ThaiCareCenter",
    images: [
      {
        url: "/ThaiCareCenter.png", // Next.js จะรวม BASE_URL เข้ากับ Path นี้โดยอัตโนมัติ
        width: 1200,
        height: 630,
        alt: "ThaiCareCenter: เว็บไซต์รวบรวมศูนย์ดูแลผู้สูงอายุไทย",
      },
    ],
    locale: "th_TH",
    type: "website",
  },

  // ** 5. Twitter Card (สำหรับแชร์บน X/Twitter) **
  twitter: {
    card: 'summary_large_image', // รูปแบบการ์ดแบบรูปภาพขนาดใหญ่
    title: "ThaiCareCenter - เว็บไซต์รวบรวมศูนย์ดูแลผู้สูงอายุไทย",
    description: "ค้นหาสถานที่ดูแลคนที่คุณรัก สะดวก ปลอดภัย มาตรฐานวิชาชีพ",
    creator: '@ThaiCareCenter', // เปลี่ยนเป็น Twitter Handle ของ ThaiCareCenter
    images: ['/ThaiCareCenter.png'],
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
        <Header />
        <main className="bg-white flex-grow">
          {children}
        </main>
        <Footer />
        <Analytics />
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