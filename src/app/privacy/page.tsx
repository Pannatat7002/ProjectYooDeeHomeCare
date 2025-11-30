import React from 'react';

export const metadata = {
    title: 'นโยบายความเป็นส่วนตัว | ThaiCareCenter',
    description: 'นโยบายความเป็นส่วนตัวของ ThaiCareCenter - เราให้ความสำคัญกับการปกป้องข้อมูลส่วนบุคคลของคุณ',
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div
                className="relative h-[300px] flex items-center justify-center bg-cover bg-center"
                style={{
                    backgroundImage: 'url("/images/bg-home.jpg")',
                    backgroundPosition: 'center 40%',
                }}
            >
                <div className="absolute inset-0 bg-blue-900/50"></div>
                <div className="relative z-10 container mx-auto px-4 text-center text-white">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        นโยบายความเป็นส่วนตัว
                    </h1>
                    <p className="text-lg text-blue-100">
                        Privacy Policy
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
                            ThaiCareCenter (&quot;เรา&quot; &quot;ของเรา&quot;) ให้ความสำคัญกับความเป็นส่วนตัวของคุณ
                            นโยบายความเป็นส่วนตัวนี้อธิบายวิธีที่เราเก็บรวบรวม ใช้ เปิดเผย และปกป้องข้อมูลส่วนบุคคลของคุณ
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            การใช้บริการของเราถือว่าคุณยอมรับการปฏิบัติที่อธิบายไว้ในนโยบายนี้
                            หากคุณไม่เห็นด้วย กรุณาหยุดการใช้บริการของเราทันที
                        </p>
                    </section>

                    {/* Information We Collect */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
                            2. ข้อมูลที่เราเก็บรวบรวม
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <h3 className="font-semibold text-lg mb-3 text-gray-900">2.1 ข้อมูลที่คุณให้โดยตรง</h3>
                                <p className="text-gray-700 leading-relaxed mb-3">
                                    เมื่อคุณใช้บริการของเรา เราอาจเก็บข้อมูลต่อไปนี้:
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                    <li><strong>ข้อมูลติดต่อ:</strong> ชื่อ-นามสกุล อีเมล หมายเลขโทรศัพท์</li>
                                    <li><strong>ข้อมูลการสมัครสมาชิก:</strong> ชื่อผู้ใช้ รหัสผ่าน (เข้ารหัส)</li>
                                    <li><strong>ข้อมูลการขอคำปรึกษา:</strong> ข้อมูลผู้ป่วย ความต้องการพิเศษ งบประมาณ</li>
                                    <li><strong>ข้อมูลการชำระเงิน:</strong> ข้อมูลบัตรเครดิต/เดบิต (ผ่านระบบปลอดภัย)</li>
                                    <li><strong>รีวิวและความคิดเห็น:</strong> เนื้อหาที่คุณโพสต์บนแพลตฟอร์ม</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-3 text-gray-900">2.2 ข้อมูลที่เก็บอัตโนมัติ</h3>
                                <p className="text-gray-700 leading-relaxed mb-3">
                                    เมื่อคุณเข้าใช้เว็บไซต์ เราอาจเก็บข้อมูลต่อไปนี้โดยอัตโนมัติ:
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                    <li><strong>ข้อมูลการใช้งาน:</strong> หน้าที่เข้าชม เวลาที่ใช้ ลิงก์ที่คลิก</li>
                                    <li><strong>ข้อมูลอุปกรณ์:</strong> ประเภทอุปกรณ์ ระบบปฏิบัติการ เบราว์เซอร์</li>
                                    <li><strong>ข้อมูลตำแหน่ง:</strong> ที่อยู่ IP ตำแหน่งทางภูมิศาสตร์โดยประมาณ</li>
                                    <li><strong>คุกกี้:</strong> ข้อมูลที่เก็บผ่านคุกกี้และเทคโนโลยีคล้ายกัน</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-3 text-gray-900">2.3 ข้อมูลจากแหล่งอื่น</h3>
                                <p className="text-gray-700 leading-relaxed">
                                    เราอาจได้รับข้อมูลเกี่ยวกับคุณจากแหล่งอื่น เช่น โซเชียลมีเดีย (หากคุณเชื่อมต่อบัญชี)
                                    หรือพันธมิตรทางธุรกิจของเรา
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* How We Use Information */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
                            3. วิธีการใช้ข้อมูล
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            เราใช้ข้อมูลที่เก็บรวบรวมเพื่อวัตถุประสงค์ต่อไปนี้:
                        </p>
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-5 border border-gray-200">
                                <h3 className="font-semibold text-gray-900 mb-2">การให้บริการ</h3>
                                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                                    <li>ประมวลผลคำขอคำปรึกษาและการจอง</li>
                                    <li>เชื่อมต่อคุณกับศูนย์ดูแลที่เหมาะสม</li>
                                    <li>จัดการบัญชีและการตั้งค่าของคุณ</li>
                                </ul>
                            </div>

                            <div className="bg-gray-50 p-5 border border-gray-200">
                                <h3 className="font-semibold text-gray-900 mb-2">การปรับปรุงบริการ</h3>
                                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                                    <li>วิเคราะห์การใช้งานเพื่อปรับปรุงประสบการณ์ผู้ใช้</li>
                                    <li>พัฒนาฟีเจอร์และบริการใหม่</li>
                                    <li>ทำความเข้าใจความต้องการของผู้ใช้</li>
                                </ul>
                            </div>

                            <div className="bg-gray-50 p-5 border border-gray-200">
                                <h3 className="font-semibold text-gray-900 mb-2">การสื่อสาร</h3>
                                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                                    <li>ส่งการแจ้งเตือนเกี่ยวกับบริการ</li>
                                    <li>ตอบกลับคำถามและให้การสนับสนุน</li>
                                    <li>ส่งข่าวสารและโปรโมชั่น (หากคุณยินยอม)</li>
                                </ul>
                            </div>

                            <div className="bg-gray-50 p-5 border border-gray-200">
                                <h3 className="font-semibold text-gray-900 mb-2">ความปลอดภัย</h3>
                                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                                    <li>ป้องกันการฉ้อโกงและการใช้งานที่ผิดกฎหมาย</li>
                                    <li>รักษาความปลอดภัยของแพลตฟอร์ม</li>
                                    <li>ปฏิบัติตามกฎหมายและข้อบังคับ</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Information Sharing */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
                            4. การแบ่งปันข้อมูล
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            เราอาจแบ่งปันข้อมูลของคุณในกรณีต่อไปนี้:
                        </p>
                        <div className="space-y-4 text-gray-700">
                            <div>
                                <h3 className="font-semibold text-lg mb-2 text-gray-900">4.1 กับศูนย์ดูแล</h3>
                                <p className="leading-relaxed">
                                    เมื่อคุณขอคำปรึกษาหรือติดต่อศูนย์ดูแล เราจะแบ่งปันข้อมูลที่จำเป็นเพื่อให้พวกเขาสามารถตอบสนองความต้องการของคุณ
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2 text-gray-900">4.2 กับผู้ให้บริการ</h3>
                                <p className="leading-relaxed">
                                    เราใช้บริการของบุคคลที่สามเพื่อช่วยดำเนินการแพลตฟอร์ม เช่น โฮสติ้ง การวิเคราะห์ การชำระเงิน
                                    ผู้ให้บริการเหล่านี้มีหน้าที่รักษาความลับของข้อมูล
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2 text-gray-900">4.3 ตามกฎหมาย</h3>
                                <p className="leading-relaxed">
                                    เราอาจเปิดเผยข้อมูลหากจำเป็นตามกฎหมาย คำสั่งศาล หรือกระบวนการทางกฎหมาย
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2 text-gray-900">4.4 การโอนธุรกิจ</h3>
                                <p className="leading-relaxed">
                                    หากมีการควบรวม ขาย หรือโอนสินทรัพย์ ข้อมูลของคุณอาจถูกโอนไปยังเจ้าของใหม่
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Data Security */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
                            5. ความปลอดภัยของข้อมูล
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            เราใช้มาตรการรักษาความปลอดภัยทางเทคนิคและองค์กรที่เหมาะสมเพื่อปกป้องข้อมูลของคุณ รวมถึง:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-5 border border-gray-200">
                                <h3 className="font-semibold text-gray-900 mb-2">การเข้ารหัส</h3>
                                <p className="text-sm text-gray-700">
                                    ข้อมูลสำคัญทั้งหมดถูกเข้ารหัสด้วย SSL/TLS
                                </p>
                            </div>
                            <div className="bg-gray-50 p-5 border border-gray-200">
                                <h3 className="font-semibold text-gray-900 mb-2">ไฟร์วอลล์</h3>
                                <p className="text-sm text-gray-700">
                                    ระบบป้องกันการเข้าถึงที่ไม่ได้รับอนุญาต
                                </p>
                            </div>
                            <div className="bg-gray-50 p-5 border border-gray-200">
                                <h3 className="font-semibold text-gray-900 mb-2">การควบคุมการเข้าถึง</h3>
                                <p className="text-sm text-gray-700">
                                    เฉพาะพนักงานที่ได้รับอนุญาตเท่านั้นที่เข้าถึงข้อมูล
                                </p>
                            </div>
                            <div className="bg-gray-50 p-5 border border-gray-200">
                                <h3 className="font-semibold text-gray-900 mb-2">การสำรองข้อมูล</h3>
                                <p className="text-sm text-gray-700">
                                    สำรองข้อมูลเป็นประจำเพื่อป้องกันการสูญหาย
                                </p>
                            </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed mt-4 text-sm">
                            <strong>หมายเหตุ:</strong> แม้เราจะใช้มาตรการรักษาความปลอดภัยที่เหมาะสม
                            แต่ไม่มีระบบใดที่ปลอดภัย 100% เราไม่สามารถรับประกันความปลอดภัยสมบูรณ์ของข้อมูล
                        </p>
                    </section>

                    {/* Your Rights */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
                            6. สิทธิของคุณ
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            ตามกฎหมายคุ้มครองข้อมูลส่วนบุคคล (PDPA) คุณมีสิทธิต่อไปนี้:
                        </p>
                        <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                                <span className="text-gray-900 font-bold text-xl mt-1">•</span>
                                <div>
                                    <h3 className="font-semibold text-gray-900">สิทธิในการเข้าถึง</h3>
                                    <p className="text-gray-700 text-sm">ขอเข้าถึงและรับสำเนาข้อมูลส่วนบุคคลของคุณ</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <span className="text-gray-900 font-bold text-xl mt-1">•</span>
                                <div>
                                    <h3 className="font-semibold text-gray-900">สิทธิในการแก้ไข</h3>
                                    <p className="text-gray-700 text-sm">ขอแก้ไขข้อมูลที่ไม่ถูกต้องหรือไม่สมบูรณ์</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <span className="text-gray-900 font-bold text-xl mt-1">•</span>
                                <div>
                                    <h3 className="font-semibold text-gray-900">สิทธิในการลบ</h3>
                                    <p className="text-gray-700 text-sm">ขอลบข้อมูลส่วนบุคคลของคุณในบางกรณี</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <span className="text-gray-900 font-bold text-xl mt-1">•</span>
                                <div>
                                    <h3 className="font-semibold text-gray-900">สิทธิในการจำกัด</h3>
                                    <p className="text-gray-700 text-sm">ขอจำกัดการประมวลผลข้อมูลของคุณ</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <span className="text-gray-900 font-bold text-xl mt-1">•</span>
                                <div>
                                    <h3 className="font-semibold text-gray-900">สิทธิในการโอนย้าย</h3>
                                    <p className="text-gray-700 text-sm">ขอรับข้อมูลในรูปแบบที่สามารถอ่านได้ด้วยเครื่อง</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <span className="text-gray-900 font-bold text-xl mt-1">•</span>
                                <div>
                                    <h3 className="font-semibold text-gray-900">สิทธิในการคัดค้าน</h3>
                                    <p className="text-gray-700 text-sm">คัดค้านการประมวลผลข้อมูลในบางกรณี</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 bg-gray-50 p-5 border border-gray-200">
                            <p className="text-gray-700 leading-relaxed">
                                <strong>วิธีใช้สิทธิ:</strong> หากต้องการใช้สิทธิใดๆ ข้างต้น กรุณาติดต่อเราผ่านช่องทางที่ระบุในหัวข้อ &quot;ติดต่อเรา&quot;
                                เราจะตอบกลับภายใน 30 วัน
                            </p>
                        </div>
                    </section>

                    {/* Cookies */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
                            7. คุกกี้และเทคโนโลยีติดตาม
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            เราใช้คุกกี้และเทคโนโลยีคล้ายกันเพื่อปรับปรุงประสบการณ์การใช้งาน ประเภทของคุกกี้ที่เราใช้:
                        </p>
                        <div className="space-y-3 text-gray-700">
                            <div className="border-l-4 border-gray-400 pl-4">
                                <h3 className="font-semibold">คุกกี้ที่จำเป็น</h3>
                                <p className="text-sm">จำเป็นสำหรับการทำงานพื้นฐานของเว็บไซต์</p>
                            </div>
                            <div className="border-l-4 border-gray-400 pl-4">
                                <h3 className="font-semibold">คุกกี้การวิเคราะห์</h3>
                                <p className="text-sm">ช่วยเราเข้าใจวิธีที่ผู้ใช้โต้ตอบกับเว็บไซต์</p>
                            </div>
                            <div className="border-l-4 border-gray-400 pl-4">
                                <h3 className="font-semibold">คุกกี้การตลาด</h3>
                                <p className="text-sm">ใช้เพื่อแสดงโฆษณาที่เกี่ยวข้องกับคุณ</p>
                            </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed mt-4">
                            คุณสามารถจัดการการตั้งค่าคุกกี้ผ่านเบราว์เซอร์ของคุณ
                            แต่การปิดคุกกี้บางประเภทอาจส่งผลต่อการทำงานของเว็บไซต์
                        </p>
                    </section>

                    {/* Data Retention */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
                            8. การเก็บรักษาข้อมูล
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            เราจะเก็บข้อมูลส่วนบุคคลของคุณเท่าที่จำเป็นเพื่อวัตถุประสงค์ที่ระบุไว้ในนโยบายนี้
                            หรือตามที่กฎหมายกำหนด
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>ข้อมูลบัญชี: เก็บไว้ตลอดระยะเวลาที่บัญชียังใช้งานอยู่</li>
                            <li>ข้อมูลการทำธุรกรรม: เก็บไว้อย่างน้อย 5 ปีตามกฎหมายภาษี</li>
                            <li>ข้อมูลการตลาด: เก็บไว้จนกว่าคุณจะถอนความยินยอม</li>
                            <li>ข้อมูลการใช้งาน: โดยทั่วไปเก็บไว้ 2 ปี</li>
                        </ul>
                    </section>

                    {/* Children's Privacy */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
                            9. ความเป็นส่วนตัวของเด็ก
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            บริการของเราไม่ได้มุ่งเป้าไปที่เด็กอายุต่ำกว่า 18 ปี
                            เราไม่เก็บรวบรวมข้อมูลส่วนบุคคลจากเด็กโดยเจตนา
                            หากคุณเป็นผู้ปกครองและพบว่าบุตรหลานของคุณให้ข้อมูลแก่เรา กรุณาติดต่อเรา
                            เราจะดำเนินการลบข้อมูลดังกล่าวทันที
                        </p>
                    </section>

                    {/* International Transfers */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
                            10. การโอนข้อมูลข้ามประเทศ
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            ข้อมูลของคุณอาจถูกโอนและเก็บรักษาในเซิร์ฟเวอร์ที่ตั้งอยู่นอกประเทศไทย
                            เราจะดำเนินการให้แน่ใจว่าข้อมูลของคุณได้รับการปกป้องอย่างเหมาะสมตามมาตรฐานสากล
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            การโอนข้อมูลจะเกิดขึ้นเฉพาะเมื่อมีมาตรการรักษาความปลอดภัยที่เหมาะสม
                            เช่น สัญญาการโอนข้อมูลมาตรฐาน หรือการรับรอง Privacy Shield
                        </p>
                    </section>

                    {/* Policy Changes */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
                            11. การเปลี่ยนแปลงนโยบาย
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            เราอาจปรับปรุงนโยบายความเป็นส่วนตัวนี้เป็นครั้งคราว
                            การเปลี่ยนแปลงที่สำคัญจะถูกแจ้งให้คุณทราบผ่านอีเมลหรือประกาศบนเว็บไซต์
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            เราแนะนำให้คุณตรวจสอบนโยบายนี้เป็นประจำเพื่อรับทราบข้อมูลล่าสุด
                            การใช้บริการต่อไปหลังจากมีการเปลี่ยนแปลงถือว่าคุณยอมรับนโยบายที่แก้ไขแล้ว
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
                            12. ติดต่อเรา
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            หากคุณมีคำถาม ข้อกังวล หรือต้องการใช้สิทธิของคุณเกี่ยวกับข้อมูลส่วนบุคคล กรุณาติดต่อเราผ่าน:
                        </p>
                        <div className="bg-gray-50 p-6 border border-gray-200">
                            <h3 className="font-semibold text-lg mb-4 text-gray-900">เจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (DPO)</h3>
                            <ul className="space-y-3 text-gray-700">
                                <li className="flex items-start">
                                    <span className="font-semibold min-w-[120px]">อีเมล:</span>
                                    <a href="mailto:privacy@ThaiCareCenter.com" className="text-gray-900 hover:text-gray-700 underline font-medium">
                                        privacy@ThaiCareCenter.com
                                    </a>
                                </li>
                                <li className="flex items-start">
                                    <span className="font-semibold min-w-[120px]">โทรศัพท์:</span>
                                    <a href="tel:+66123456789" className="text-gray-900 hover:text-gray-700 underline font-medium">
                                        02-XXX-XXXX
                                    </a>
                                </li>
                                <li className="flex items-start">
                                    <span className="font-semibold min-w-[120px]">ที่อยู่:</span>
                                    <span>ThaiCareCenter<br />กรุงเทพมหานคร 10XXX<br />ประเทศไทย</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="font-semibold min-w-[120px]">เวลาทำการ:</span>
                                    <span>จันทร์-ศุกร์ 9:00-18:00 น.</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* PDPA Compliance */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
                            13. การปฏิบัติตาม PDPA
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            ThaiCareCenter ปฏิบัติตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)
                            และกฎหมายที่เกี่ยวข้องทั้งหมด
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            หากคุณเชื่อว่าสิทธิของคุณถูกละเมิด คุณสามารถยื่นเรื่องร้องเรียนต่อสำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล (PDPC)
                            ได้ที่{' '}
                            <a href="https://www.pdpc.or.th" target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:text-gray-700 underline">
                                www.pdpc.or.th
                            </a>
                        </p>
                    </section>

                    {/* Footer Note */}
                    <div className="mt-12 pt-8 border-t border-gray-300">
                        <p className="text-sm text-gray-500 text-center">
                            เอกสารนี้อัปเดตล่าสุดเมื่อวันที่ 24 พฤศจิกายน 2568
                        </p>
                        <p className="text-sm text-gray-500 text-center mt-2">
                            © 2025 ThaiCareCenter. สงวนลิขสิทธิ์.
                        </p>
                        <p className="text-xs text-gray-400 text-center mt-4">
                            นโยบายนี้จัดทำขึ้นเพื่อให้สอดคล้องกับพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
