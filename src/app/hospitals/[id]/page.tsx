import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Navigation, MapPin, Phone, Building2, ShieldCheck, Compass } from 'lucide-react';
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const hospital = await getHospitalById(id);

    if (!hospital) {
        return {
            title: 'ไม่พบข้อมูลสถานพยาบาล | ThaiCareCenter',
        };
    }

    return {
        title: `${hospital.nameTh} | รายละเอียดสถานพยาบาล ThaiCareCenter`,
        description: `ข้อมูลและพิกัดเส้นทาง ${hospital.nameTh} (${hospital.nameEn || ''}) ${hospital.district || ''} ${hospital.province || ''}`,
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

    return (
        <div className="min-h-screen bg-white">
            <article className="pt-10 pb-16">
                <div className="container mx-auto max-w-4xl px-4">

                    {/* Back Link */}
                    <div className="mb-6">
                        <Link
                            href="/"
                            className="inline-flex items-center text-gray-500 hover:text-[#2b64a0] transition-colors text-sm font-medium"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1.5" />
                            กลับหน้าหลัก
                        </Link>
                    </div>

                    {/* Header */}
                    <header className="mb-8 border-b border-gray-100 pb-6">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                <Building2 className="w-3.5 h-3.5" />
                                {hospital.hospitalType || 'สถานพยาบาล'}
                            </span>
                            {hospital.province && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                                    <MapPin className="w-3.5 h-3.5 text-gray-500" />
                                    {hospital.province}
                                </span>
                            )}
                            {hospital.level && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                                    <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                                    {hospital.level}
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-2 leading-tight">
                            {hospital.nameTh}
                        </h1>

                        {hospital.nameEn && (
                            <p className="text-lg md:text-xl text-gray-500 font-medium mb-3">
                                {hospital.nameEn}
                            </p>
                        )}

                        {hospital.affiliation && (
                            <p className="text-sm text-gray-600">
                                สังกัด: <span className="font-semibold text-gray-800">{hospital.affiliation}</span>
                            </p>
                        )}
                    </header>

                    {/* Content Section */}
                    <div className="space-y-6">

                        {/* Relative Proximity to Care Center Notice (if navigated from center) */}
                        {fromCenter && (
                            <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-xl text-sm text-blue-900 flex items-start gap-3">
                                <Compass className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                <div>
                                    <div className="font-bold">
                                        เชื่อมโยงกับศูนย์ดูแล: {fromCenter}
                                    </div>
                                    {distanceKm && (
                                        <div className="text-xs text-blue-700 mt-0.5">
                                            ระยะห่างจากศูนย์ดูแล: <span className="font-extrabold">~{distanceKm} กม.</span> (ระยะทางตรง ไม่ได้อิงจากเส้นทางถนน)
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Hospital Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* ที่อยู่ */}
                            <div className="p-5 rounded-xl border border-gray-100 bg-gray-50/60">
                                <div className="flex items-center gap-2 text-gray-700 font-bold mb-2 text-sm">
                                    <MapPin className="w-4 h-4 text-blue-600" />
                                    ที่อยู่และสถานที่ตั้ง
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed">
                                    {hospital.address || `${hospital.district || ''} ${hospital.province || ''}`}
                                </p>
                                {hospital.latitude && hospital.longitude && (
                                    <p className="text-xs text-gray-400 mt-2 font-mono">
                                        พิกัด: {hospital.latitude.toFixed(4)}, {hospital.longitude.toFixed(4)}
                                    </p>
                                )}
                            </div>

                            {/* เบอร์โทรศัพท์ */}
                            <div className="p-5 rounded-xl border border-gray-100 bg-gray-50/60">
                                <div className="flex items-center gap-2 text-gray-700 font-bold mb-2 text-sm">
                                    <Phone className="w-4 h-4 text-blue-600" />
                                    การติดต่อ
                                </div>
                                <div className="space-y-1.5 text-sm">
                                    {hospital.phone && (
                                        <div>
                                            <span className="text-gray-500">โทรทั่วไป: </span>
                                            <a
                                                href={`tel:${hospital.phone.replace(/[^0-9]/g, '')}`}
                                                className="font-bold text-gray-900 hover:text-blue-600 hover:underline"
                                            >
                                                {hospital.phone}
                                            </a>
                                        </div>
                                    )}
                                    {hospital.emergencyPhone && (
                                        <div>
                                            <span className="text-red-600 font-semibold">เบอร์ฉุกเฉิน: </span>
                                            <a
                                                href={`tel:${hospital.emergencyPhone.replace(/[^0-9]/g, '')}`}
                                                className="font-extrabold text-red-600 hover:underline"
                                            >
                                                {hospital.emergencyPhone}
                                            </a>
                                        </div>
                                    )}
                                    {!hospital.phone && !hospital.emergencyPhone && (
                                        <p className="text-gray-400 text-xs">ติดต่อสายด่วนกู้ชีพฉุกเฉิน 1669</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Single Clean Action: ปุ่มเปิด Google Maps นำทาง */}
                        <div className="pt-6">
                            <a
                                href={navigationUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#2b64a0] hover:bg-[#1e4a77] text-white text-base font-bold rounded-xl transition-all shadow-md shadow-[#2b64a0]/25"
                            >
                                <Navigation className="w-5 h-5" />
                                {hasOrigin ? 'เปิด Google Maps นำทางจากศูนย์ดูแล' : 'เปิด Google Maps นำทางไปยังโรงพยาบาล'}
                            </a>
                        </div>

                        {/* Simple Clean Disclaimer Note */}
                        <div className="pt-8 border-t border-gray-100 text-xs text-gray-400 leading-relaxed">
                            * ข้อมูลสถานพยาบาลและพิกัดจัดทำขึ้นเพื่อความสะดวกในการสัญจรและการประสานงานส่งต่อผู้สูงอายุ กรณีเหตุฉุกเฉินทางการแพทย์วิกฤต กรุณาติดต่อสายด่วนกู้ชีพ 1669
                        </div>

                    </div>

                </div>
            </article>
        </div>
    );
}
