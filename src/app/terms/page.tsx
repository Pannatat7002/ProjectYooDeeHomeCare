/* eslint-disable @next/next/no-html-link-for-pages */
import React from 'react';

export const metadata = {
    title: 'ข้อกำหนดและเงื่อนไข | ThaiCareCenter',
    description: 'ข้อกำหนดและเงื่อนไขการใช้บริการของ ThaiCareCenter - แพลตฟอร์มค้นหาศูนย์ดูแลผู้สูงอายุและผู้ป่วย',
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div
                className="relative h-[300px] flex items-center justify-center bg-cover bg-center"
                style={{
                    backgroundImage: 'url("/images/hero-background.jpg")',
                    backgroundPosition: 'center 40%',
                }}
            >
                <div className="absolute inset-0 bg-blue-900/50"></div>
                <div className="relative z-10 container mx-auto px-4 text-center text-white">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        ข้อกำหนดและเงื่อนไข
                    </h1>
                    <p className="text-lg text-blue-100">
                        Terms and Conditions
                    </p>
                    <p className="mt-4 text-sm text-blue-200">
                        อัปเดตล่าสุด: 24 พฤศจิกายน 2568
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white border border-gray-200 p-8 md:p-12">

                    {/* Introduction */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
                            1. บทนำ
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            ยินดีต้อนรับสู่ ThaiCareCenter แพลตฟอร์มค้นหาและเปรียบเทียบศูนย์ดูแลผู้สูงอายุและผู้ป่วย
                            การใช้บริการของเราถือว่าคุณยอมรับข้อกำหนดและเงื่อนไขที่ระบุไว้ในเอกสารนี้
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            หากคุณไม่เห็นด้วยกับข้อกำหนดเหล่านี้ กรุณาหยุดการใช้บริการของเราทันที
                        </p>
                    </section>

                    {/* Service Description */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
                            2. คำอธิบายบริการ
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            ThaiCareCenter เป็นแพลตฟอร์มที่ให้บริการ:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>ข้อมูลและรายละเอียดของศูนย์ดูแลผู้สูงอายุและผู้ป่วย</li>
                            <li>เครื่องมือค้นหาและเปรียบเทียบศูนย์ดูแล</li>
                            <li>ข้อมูลแพ็กเกจบริการและราคา</li>
                            <li>ช่องทางติดต่อและขอคำปรึกษากับศูนย์ดูแล</li>
                            <li>ข้อมูลรีวิวและคะแนนจากผู้ใช้บริการ</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mt-4">
                            <strong>หมายเหตุ:</strong> ThaiCareCenter เป็นเพียงแพลตฟอร์มกลางในการให้ข้อมูล
                            เราไม่ได้เป็นผู้ให้บริการดูแลโดยตรง และไม่รับผิดชอบต่อคุณภาพการบริการของศูนย์ดูแลแต่ละแห่ง
                        </p>
                    </section>

                    {/* User Responsibilities */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
                            3. ความรับผิดชอบของผู้ใช้
                        </h2>
                        <div className="space-y-4 text-gray-700">
                            <div>
                                <h3 className="font-semibold text-lg mb-2 text-gray-900">3.1 การใช้งานที่ถูกต้อง</h3>
                                <p className="leading-relaxed">
                                    ผู้ใช้ต้องใช้บริการอย่างถูกต้องตามกฎหมาย ไม่ใช้เพื่อวัตถุประสงค์ที่ผิดกฎหมายหรือทำให้ผู้อื่นเดือดร้อน
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2 text-gray-900">3.2 ข้อมูลที่ให้</h3>
                                <p className="leading-relaxed">
                                    ผู้ใช้ต้องให้ข้อมูลที่ถูกต้อง ครบถ้วน และเป็นปัจจุบันเมื่อติดต่อหรือขอคำปรึกษา
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2 text-gray-900">3.3 การรักษาความปลอดภัย</h3>
                                <p className="leading-relaxed">
                                    หากมีการสร้างบัญชีผู้ใช้ คุณมีหน้าที่รักษาความลับของรหัสผ่านและรับผิดชอบต่อกิจกรรมทั้งหมดภายใต้บัญชีของคุณ
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Intellectual Property */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
                            4. ทรัพย์สินทางปัญญา
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            เนื้อหา ออกแบบ โลโก้ รูปภาพ และส่วนประกอบอื่นๆ ของเว็บไซต์นี้เป็นทรัพย์สินของ ThaiCareCenter
                            หรือผู้ให้อนุญาต และได้รับการคุ้มครองตามกฎหมายทรัพย์สินทางปัญญา
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            ห้ามคัดลอก ทำซ้ำ แจกจ่าย หรือใช้เนื้อหาใดๆ จากเว็บไซต์โดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษร
                        </p>
                    </section>

                    {/* Limitation of Liability */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
                            5. ข้อจำกัดความรับผิด
                        </h2>
                        <div className="space-y-4 text-gray-700">
                            <div>
                                <h3 className="font-semibold text-lg mb-2 text-gray-900">5.1 ความถูกต้องของข้อมูล</h3>
                                <p className="leading-relaxed">
                                    เราพยายามให้ข้อมูลที่ถูกต้องและเป็นปัจจุบัน แต่ไม่สามารถรับประกันความถูกต้อง ครบถ้วน
                                    หรือความทันสมัยของข้อมูลทั้งหมด ผู้ใช้ควรตรวจสอบข้อมูลกับศูนย์ดูแลโดยตรงก่อนตัดสินใจ
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2 text-gray-900">5.2 บริการของบุคคลที่สาม</h3>
                                <p className="leading-relaxed">
                                    ThaiCareCenter ไม่รับผิดชอบต่อคุณภาพ ความปลอดภัย หรือการบริการของศูนย์ดูแลที่แสดงบนแพลตฟอร์ม
                                    ความสัมพันธ์ทางสัญญาเกิดขึ้นระหว่างผู้ใช้และศูนย์ดูแลโดยตรง
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2 text-gray-900">5.3 ความเสียหาย</h3>
                                <p className="leading-relaxed">
                                    เราไม่รับผิดชอบต่อความเสียหายใดๆ ที่เกิดจากการใช้หรือไม่สามารถใช้บริการของเรา
                                    รวมถึงความเสียหายทางตรง ทางอ้อม หรือที่เป็นผลสืบเนื่อง
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Privacy */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
                            6. ความเป็นส่วนตัว
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            การเก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลของคุณเป็นไปตาม{' '}
                            <a href="/privacy" className="text-gray-900 hover:text-gray-700 underline font-semibold">
                                นโยบายความเป็นส่วนตัว
                            </a>{' '}
                            ของเรา กรุณาอ่านนโยบายดังกล่าวเพื่อเข้าใจวิธีการจัดการข้อมูลของคุณ
                        </p>
                    </section>

                    {/* Reviews and Content */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
                            7. รีวิวและเนื้อหาที่ผู้ใช้สร้าง
                        </h2>
                        <div className="space-y-4 text-gray-700">
                            <p className="leading-relaxed">
                                หากคุณส่งรีวิว ความคิดเห็น หรือเนื้อหาอื่นๆ ผ่านแพลตฟอร์ม คุณรับรองว่า:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>เนื้อหาเป็นความจริงตามประสบการณ์ของคุณ</li>
                                <li>ไม่มีเนื้อหาที่หมิ่นประมาท ละเมิดสิทธิ์ หรือผิดกฎหมาย</li>
                                <li>ไม่มีข้อมูลส่วนบุคคลของผู้อื่นโดยไม่ได้รับอนุญาต</li>
                                <li>ยินยอมให้เราใช้ แสดงผล และเผยแพร่เนื้อหาดังกล่าว</li>
                            </ul>
                            <p className="leading-relaxed mt-4">
                                เราขอสงวนสิทธิ์ในการลบหรือแก้ไขเนื้อหาที่ไม่เหมาะสมโดยไม่ต้องแจ้งให้ทราบล่วงหน้า
                            </p>
                        </div>
                    </section>

                    {/* Service Modifications */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
                            8. การเปลี่ยนแปลงบริการ
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            เราขอสงวนสิทธิ์ในการเปลี่ยนแปลง ระงับ หรือยกเลิกบริการใดๆ ของแพลตฟอร์มโดยไม่ต้องแจ้งให้ทราบล่วงหน้า
                            เราจะไม่รับผิดชอบต่อความเสียหายใดๆ ที่เกิดจากการเปลี่ยนแปลงดังกล่าว
                        </p>
                    </section>

                    {/* Terms Modifications */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
                            9. การแก้ไขข้อกำหนด
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            เราอาจแก้ไขข้อกำหนดและเงื่อนไขเหล่านี้เป็นครั้งคราว การเปลี่ยนแปลงจะมีผลทันทีเมื่อเผยแพร่บนเว็บไซต์
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            การใช้บริการต่อไปหลังจากมีการเปลี่ยนแปลงถือว่าคุณยอมรับข้อกำหนดที่แก้ไขแล้ว
                            เราแนะนำให้ตรวจสอบหน้านี้เป็นประจำ
                        </p>
                    </section>

                    {/* Governing Law */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
                            10. กฎหมายที่ใช้บังคับ
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            ข้อกำหนดและเงื่อนไขเหล่านี้อยู่ภายใต้และตีความตามกฎหมายของประเทศไทย
                            ข้อพิพาทใดๆ จะอยู่ในเขตอำนาจของศาลไทย
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
                            11. ติดต่อเรา
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            หากคุณมีคำถามเกี่ยวกับข้อกำหนดและเงื่อนไขเหล่านี้ กรุณาติดต่อเราผ่าน:
                        </p>
                        <div className="bg-gray-50 p-6 border border-gray-200">
                            <ul className="space-y-2 text-gray-700">
                                <li className="flex items-start">
                                    <span className="font-semibold min-w-[100px]">อีเมล:</span>
                                    <a href="mailto:Pannatat7002@gmail.com" className="text-gray-900 hover:text-gray-700 underline">
                                        support@ThaiCareCenter.com
                                    </a>
                                </li>
                                <li className="flex items-start">
                                    <span className="font-semibold min-w-[100px]">โทรศัพท์:</span>
                                    <a href="tel:+66123456789" className="text-gray-900 hover:text-gray-700 underline">
                                        02-XXX-XXXX
                                    </a>
                                </li>
                                <li className="flex items-start">
                                    <span className="font-semibold min-w-[100px]">ที่อยู่:</span>
                                    <span>กรุงเทพมหานคร ประเทศไทย</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* Footer Note */}
                    <div className="mt-12 pt-8 border-t border-gray-300">
                        <p className="text-sm text-gray-500 text-center">
                            เอกสารนี้อัปเดตล่าสุดเมื่อวันที่ 24 พฤศจิกายน 2568
                        </p>
                        <p className="text-sm text-gray-500 text-center mt-2">
                            © 2025 ThaiCareCenter. สงวนลิขสิทธิ์.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
