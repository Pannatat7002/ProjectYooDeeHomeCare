# วิธีเพิ่ม Package Carousel ในหน้า Detail

## ขั้นตอนการแก้ไข

### 1. เพิ่ม CSS (✅ เสร็จแล้ว)
ไฟล์ `src/app/globals.css` ได้เพิ่ม CSS สำหรับซ่อน scrollbar แล้ว

### 2. แก้ไขส่วน Packages Section

ในไฟล์ `src/app/[name]/page.tsx` บรรทัด 489-523

**แทนที่โค้ดเดิม:**
```tsx
{/* Packages */}
{center.packages && center.packages.length > 0 && (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">แพ็กเกจราคา</h2>
        <div className="space-y-4">
            {center.packages.map((pkg, idx) => (
                // ... existing package card code
            ))}
        </div>
    </section>
)}
```

**ด้วยโค้ดใหม่:**
```tsx
{/* Packages */}
{center.packages && center.packages.length > 0 && (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">แพ็กเกจราคา</h2>
        
        {/* Package Carousel */}
        <div className="relative">
            {/* Navigation Buttons - Show only if more than 1 package */}
            {center.packages.length > 1 && (
                <>
                    <button
                        onClick={() => {
                            const container = document.getElementById('package-container');
                            if (container) {
                                container.scrollBy({ left: -350, behavior: 'smooth' });
                            }
                        }}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white hover:bg-gray-50 text-gray-700 p-2 rounded-full shadow-lg border border-gray-200 transition-all hover:scale-110 hidden md:block"
                        aria-label="Previous package"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => {
                            const container = document.getElementById('package-container');
                            if (container) {
                                container.scrollBy({ left: 350, behavior: 'smooth' });
                            }
                        }}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white hover:bg-gray-50 text-gray-700 p-2 rounded-full shadow-lg border border-gray-200 transition-all hover:scale-110 hidden md:block"
                        aria-label="Next package"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </>
            )}

            {/* Scrollable Container */}
            <div 
                id="package-container"
                className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
            >
                {center.packages.map((pkg, idx) => (
                    <div 
                        key={idx} 
                        className="flex-shrink-0 w-full md:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)] snap-start"
                    >
                        <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-green-300 hover:shadow-md transition-all group h-full">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-semibold text-lg text-gray-800 group-hover:text-green-700 transition-colors">{pkg.name}</h4>
                                    <p className="text-sm text-gray-500">
                                        {pkg.details || `เหมาะสำหรับผู้ที่ต้องการการดูแลระดับ ${idx + 1}`}
                                    </p>
                                </div>
                                <div className="text-right flex-shrink-0 ml-4">
                                    <span className="block text-2xl font-extrabold text-green-600">฿{pkg.price?.toLocaleString() ?? '0'}</span>
                                    <span className="text-xs text-gray-400">ต่อเดือน</span>
                                </div>
                            </div>
                            {pkg.details && pkg.details.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <ul className="grid grid-cols-1 gap-2">
                                        {pkg.details.map((d, i) => (
                                            <li key={i} className="text-sm text-gray-600 flex items-start">
                                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 mt-1 flex-shrink-0"></div> {d}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Scroll Indicator Dots - Show only if more than 1 package on mobile */}
            {center.packages.length > 1 && (
                <div className="flex justify-center gap-2 mt-4 md:hidden">
                    {center.packages.map((_, idx) => (
                        <div 
                            key={idx} 
                            className="w-2 h-2 rounded-full bg-gray-300"
                        ></div>
                    ))}
                </div>
            )}
        </div>
    </section>
)}
```

## คุณสมบัติที่ได้:

✅ **Carousel/Slider** - เลื่อนดูแพ็คเกจได้ด้วยการ swipe บน mobile
✅ **ลูกศรซ้าย-ขวา** - แสดงบน desktop เมื่อมีมากกว่า 1 แพ็คเกจ
✅ **Responsive** - แสดง 1 card บน mobile, 2 cards บน tablet, 3 cards บน desktop
✅ **Smooth Scroll** - เลื่อนแบบ smooth animation
✅ **Snap Scroll** - แพ็คเกจจะ snap เข้าที่เมื่อเลื่อน
✅ **Hidden Scrollbar** - ซ่อน scrollbar แต่ยังเลื่อนได้
✅ **Indicator Dots** - แสดง dots บน mobile เพื่อบอกตำแหน่ง

## การทดสอบ:

1. เปิดหน้า Detail ของศูนย์ที่มีหลายแพ็คเกจ
2. ทดสอบกดลูกศรซ้าย-ขวาบน desktop
3. ทดสอบ swipe บน mobile/tablet
4. ตรวจสอบว่า responsive layout ทำงานถูกต้อง
