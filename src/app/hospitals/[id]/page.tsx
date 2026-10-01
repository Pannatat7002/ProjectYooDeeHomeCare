import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Navigation, MapPin } from 'lucide-react';
import { getHospitalById } from '../../../lib/db';
import { calculateHaversineDistance, getGoogleMapsRouteUrl } from '../../../lib/hospitalProximity';

export const revalidate = 300;

interface Props {
    params: Promise<{ id: string }>;
    searchParams: Promise<{
        fromCenter?: string;
        centerLat?: string;
        centerLng?: string;
    }>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { id } = await params;
    const { fromCenter } = await searchParams;
    const hospital = await getHospitalById(id);

    if (!hospital) {
        return {
            title: 'ไม่พบข้อมูลสถานพยาบาล | ThaiCareCenter',
        };
    }

    const titleName = hospital.nameEn ? `${hospital.nameTh} (${hospital.nameEn})` : hospital.nameTh;
    const fromText = fromCenter ? ` ใกล้${fromCenter}` : '';
    return {
        title: `${titleName}${fromText} - ข้อมูลสถานพยาบาลและแผนที่นำทาง | ThaiCareCenter`,
        description: `แผนที่ พิกัด และเส้นทางนำทางไปยัง ${titleName}${hospital.address ? ` ตั้งอยู่ที่ ${hospital.address}` : ''} ${hospital.province ? `จ.${hospital.province}` : ''}`,
    };
}

export default async function HospitalDetailPage({ params, searchParams }: Props) {
    const { id } = await params;
    const { fromCenter, centerLat, centerLng } = await searchParams;

    const hospital = await getHospitalById(id);

    if (!hospital) {
        notFound();
    }

    // คำนวณระยะทางและเส้นทาง Google Maps ถ้าส่งพิกัดศูนย์มาจากหน้ารายละเอียดหรือหน้าแรก
    const hasOrigin = centerLat && centerLng && !isNaN(Number(centerLat)) && !isNaN(Number(centerLng));
    const distanceKm = hasOrigin && hospital.latitude && hospital.longitude
        ? calculateHaversineDistance(
            Number(centerLat),
            Number(centerLng),
            Number(hospital.latitude),
            Number(hospital.longitude)
        ).toFixed(1)
        : null;

    const navigationUrl = hasOrigin && hospital.latitude && hospital.longitude
        ? getGoogleMapsRouteUrl(
            Number(centerLat),
            Number(centerLng),
            Number(hospital.latitude),
            Number(hospital.longitude)
        )
        : `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`;

    const mapEmbedUrl = hospital.latitude && hospital.longitude
        ? `https://maps.google.com/maps?q=${hospital.latitude},${hospital.longitude}&hl=th&z=15&output=embed`
        : null;

    const displayName = hospital.nameEn
        ? `${hospital.nameTh} (${hospital.nameEn})`
        : hospital.nameTh;

    return (
        <div className="min-h-screen bg-white">
            <main className="container mx-auto max-w-4xl px-4 pt-6 pb-12">

                {/* ปุ่มย้อนกลับ */}
                <div className="mb-4">
                    <Link
                        href="/"
                        className="inline-flex items-center text-gray-500 hover:text-[#2b64a0] transition-colors text-sm font-medium"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1.5" />
                        กลับ
                    </Link>
                </div>

                {/* Header / Detail Title */}
                <div className="mb-4">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                            <Image src="/images/badges/badge-hospital.png" alt="สถานพยาบาล" width={24} height={24} className="w-5 h-5 object-contain shrink-0" />
                            ข้อมูลสถานพยาบาลและการนำทาง
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <Image src="/images/badges/badge-emergency.png" alt="การส่งต่อฉุกเฉิน" width={24} height={24} className="w-5 h-5 object-contain shrink-0" />
                            รองรับการส่งต่อฉุกเฉิน
                        </span>
                        {hospital.hospitalType && (
                            <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                                {hospital.hospitalType}
                            </span>
                        )}
                        {hospital.province && (
                            <span className="text-xs text-gray-500 font-medium">
                                📍 {hospital.province}
                            </span>
                        )}
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-snug">
                        {hospital.nameTh}
                        {hospital.nameEn && (
                            <span className="text-lg sm:text-xl font-normal text-gray-500 ml-2 block sm:inline">
                                ({hospital.nameEn})
                            </span>
                        )}
                    </h1>

                    {/* Proximity & Address info */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 mt-1.5">
                        {fromCenter && (
                            <p className="text-sm text-gray-700">
                                ห่างจาก <span className="font-semibold text-gray-900">{fromCenter}</span>
                                {distanceKm && (
                                    <> ระยะประมาณ <span className="font-semibold text-[#2b64a0]">{distanceKm}</span> กม.*</>
                                )}
                            </p>
                        )}
                        {hospital.address && (
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                {hospital.address}
                            </p>
                        )}
                    </div>
                </div>

                {/* [ MAP ] */}
                <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-xs h-[340px] sm:h-[440px] bg-gray-100 relative mb-4">
                    {mapEmbedUrl ? (
                        <iframe
                            src={mapEmbedUrl}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title={`แผนที่ ${displayName}`}
                            className="w-full h-full"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                            <MapPin className="w-8 h-8 mb-2 opacity-40" />
                            <span>ไม่พบข้อมูลพิกัดแผนที่</span>
                        </div>
                    )}
                </div>

                {/* [ นำทาง ] */}
                <a
                    href={navigationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 bg-[#2b64a0] hover:bg-[#1e4a77] text-white text-base font-bold rounded-xl shadow-md shadow-[#2b64a0]/25 transition-all active:scale-[0.99]"
                >
                    <Navigation className="w-5 h-5" />
                    นำทาง
                </a>

                {fromCenter && (
                    <p className="text-[11px] text-gray-400 text-center mt-3">
                        *ระยะทางตรง ไม่ได้อิงจากเส้นทางถนน
                    </p>
                )}

            </main>
        </div>
    );
}
