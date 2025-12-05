// src/app/layout.tsx

import type { Metadata, Viewport } from "next"; // เพิ่ม Viewport
import { Sarabun } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { GA_TRACKING_ID, GOOGLE_ADS_ID } from "../lib/gtag";
import { Analytics } from "@vercel/analytics/next";
import Header from "../components/Header";
import Footer from "../components/Footer";

const sarabun = Sarabun({
  weight: ['400', '500', '700'],
  subsets: ['thai', 'latin'],
  variable: '--font-sarabun',
  display: 'swap', // แนะนำ: ช่วยเรื่อง LCP (ลด Flash of Unstyled Text)
});

const BASE_URL = 'https://ThaiCareCenter.com';

// ** ส่วนเสริม: Viewport (แยกออกมาใน Next.js เวอร์ชันใหม่) **
export const viewport: Viewport = {
  themeColor: '#ffffff', // ปรับตามสีแบรนด์ของคุณ
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // อนุญาตให้ user zoom ได้ (Accessibility)
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  // ** 1. SEO หลัก (ปรับปรุง Title Template) **
  title: {
    template: '%s | ThaiCareCenter', // หน้าลูกจะเป็น "ชื่อหน้า | ThaiCareCenter"
    default: "ThaiCareCenter - รวมศูนย์ดูแลผู้สูงอายุและผู้ป่วยพักฟื้นในไทย", // ปรับให้ดูน่าเชื่อถือขึ้น
  },
  description: "ยกระดับคุณภาพชีวิตคนที่คุณรัก ค้นหาศูนย์ดูแลผู้สูงอายุ บ้านพักคนชรา และศูนย์พักฟื้นมาตรฐานสูงสุด เปรียบเทียบราคา อ่านรีวิว และค้นหาสถานที่ใกล้บ้านคุณได้ที่นี่",

  keywords: [
    "ศูนย์ดูแลผู้สูงอายุ", "บ้านพักคนชรา", "Nursing Home", "ดูแลผู้ป่วยพักฟื้น",
    "กายภาพบำบัดผู้สูงอายุ", "ศูนย์ดูแลมาตรฐาน", "หาศูนย์ดูแลผู้สูงอายุ",
    "ราคาศูนย์ดูแลผู้สูงอายุ", "ศูนย์ดูแลผู้สูงอายุ กรุงเทพ", "ศูนย์ดูแลผู้สูงอายุ นนทบุรี", "ดูแลผู้ป่วยติดเตียง"
  ],

  // ** 2. Canonical URL (สำคัญมากเพื่อป้องกัน Duplicate Content) **
  alternates: {
    canonical: './',
  },

  // ** 3. Robots **
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

  // ** 4. Verification (สำหรับ GSC / Bing) **
  verification: {
    google: 'DUBlCRLJRX8u4ADzZFTczYaqelMwGbynT02BG1tpxuI',
    // other: { me: ['my-email'], },
  },

  // ** 5. Icons / Manifest **
  icons: {
    icon: [
      { url: '/favicon_io/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon_io/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      // ✅ เพิ่มบรรทัดนี้: ให้ Google เห็นรูปใหญ่ชัดๆ ใน tag rel="icon"
      { url: '/favicon_io/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon_io/favicon.ico', sizes: 'any' }
    ],
    shortcut: '/favicon_io/favicon.ico',
    apple: '/favicon_io/apple-touch-icon.png',
    other: [
      { rel: 'android-chrome', url: '/favicon_io/android-chrome-192x192.png', sizes: '192x192' },
      { rel: 'android-chrome', url: '/favicon_io/android-chrome-512x512.png', sizes: '512x512' },
    ]
  },
  manifest: '/favicon_io/site.webmanifest',

  // ** 6. Open Graph **
  openGraph: {
    title: "ThaiCareCenter - รวมศูนย์ดูแลผู้สูงอายุมาตรฐาน",
    description: "ค้นหาสถานที่ดูแลคนที่คุณรัก สะดวก ปลอดภัย มาตรฐานวิชาชีพ พร้อมเปรียบเทียบราคาและรีวิว",
    url: BASE_URL,
    siteName: "ThaiCareCenter",
    images: [
      {
        url: "/ThaiCareCenter.png",
        width: 1200,
        height: 630,
        alt: "ThaiCareCenter: เว็บไซต์รวบรวมศูนย์ดูแลผู้สูงอายุไทย",
      },
    ],
    locale: "th_TH",
    type: "website",
  },

  // ** 7. Twitter **
  twitter: {
    card: 'summary_large_image',
    title: "ThaiCareCenter - รวมศูนย์ดูแลผู้สูงอายุมาตรฐาน",
    description: "ค้นหาสถานที่ดูแลคนที่คุณรัก สะดวก ปลอดภัย มาตรฐานวิชาชีพ",
    creator: '@ThaiCareCenter',
    images: ['/ThaiCareCenter.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  // ** สร้าง Schema.org (JSON-LD) **
  // ช่วยให้ Google รู้ว่าเว็บนี้คือ "WebSite" และมีช่องค้นหา
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ThaiCareCenter',
    url: BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BASE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <html lang="th">
      <body className={`${sarabun.className} bg-gray-50 min-h-screen flex flex-col`}>
        {/* ใส่ JSON-LD Script */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <Header />
        <main className="bg-white flex-grow">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>

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
          ${GOOGLE_ADS_ID ? `gtag('config', '${GOOGLE_ADS_ID}');` : ''}
        `}
      </Script>
    </html>
  );
}