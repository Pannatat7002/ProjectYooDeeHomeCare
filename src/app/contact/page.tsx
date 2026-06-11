
'use client';

import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { gtagReportConversion } from '../../lib/gtag';


export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                alert('ขอบคุณสำหรับข้อความ เราจะติดต่อกลับโดยเร็วที่สุด');
                setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
                // Track Conversion
                gtagReportConversion();
            } else {
                alert('เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองใหม่อีกครั้ง');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('เกิดข้อผิดพลาดในการส่งข้อความ');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <>
            <div className="min-h-screen bg-gray-50">
                {/* Hero Section */}
                <div
                    className="relative h-[450px] flex items-center justify-center bg-cover bg-center"
                    style={{
                        backgroundImage: 'url("/images/bg-home.jpg")',
                        backgroundPosition: 'center 40%',
                    }}
                >
                    <div className="absolute inset-0 bg-black/50"></div>
                    <div className="relative z-10 container mx-auto px-4 text-center text-white">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">ติดต่อเรา</h1>
                        <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                            มีข้อสงสัยหรือต้องการคำปรึกษา? ทีมงานของเราพร้อมดูแลและให้คำแนะนำท่านตลอดเวลา
                        </p>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Contact Info Sidebar - spans 5 columns on lg */}
                        <div className="lg:col-span-5 space-y-6">
                            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex flex-col h-full justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-6">ข้อมูลการติดต่อ</h3>
                                    <p className="text-gray-600 mb-8">
                                        ท่านสามารถติดต่อสอบถามข้อมูลเพิ่มเติม ขอรับคำปรึกษาการเลือกศูนย์ดูแล หรือแจ้งปัญหาการใช้งานผ่านช่องทางต่างๆ ของเราได้ตลอดเวลา
                                    </p>
                                    
                                    <div className="space-y-6">
                                        <div className="flex items-start">
                                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl mr-4">
                                                <Phone className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-sm">เบอร์โทรศัพท์</h4>
                                                <p className="text-gray-600 text-base mt-0.5">095-805-7052</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl mr-4">
                                                <Mail className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-sm">อีเมล</h4>
                                                <p className="text-gray-600 text-base mt-0.5">thaicarecenter01@gmail.com</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl mr-4">
                                                <Clock className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-sm">เวลาทำการ</h4>
                                                <p className="text-gray-600 text-base mt-0.5">จันทร์ - ศุกร์ 09:00 - 18:00 น.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-8 border-t border-gray-100">
                                    <a
                                        href="https://line.me/R/ti/p/%40256zihiv"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full flex items-center justify-center px-4 py-3 bg-[#06C755] text-white text-base font-bold rounded-xl hover:bg-[#05b04b] transition-all duration-300 shadow-lg shadow-green-100 hover:shadow-xl active:scale-[0.98]"
                                    >
                                        <img
                                            src="/images/LINE_APP_iOS.png"
                                            alt="LINE Icon"
                                            className="w-8 h-8 mr-3 object-contain rounded-md flex-shrink-0"
                                        />
                                        ติดต่อผ่าน LINE
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form - spans 7 columns on lg */}
                        <div className="lg:col-span-7">
                            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">ส่งข้อความถึงเรา</h3>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">ชื่อ-นามสกุล</label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                placeholder="กรุณากรอกชื่อของคุณ"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">เบอร์โทรศัพท์</label>
                                            <input
                                                type="tel"
                                                id="phone"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                placeholder="กรุณากรอกเบอร์โทรศัพท์"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">อีเมล</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="name@example.com"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">หัวข้อเรื่อง</label>
                                        <select
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        >
                                            <option value="">กรุณาเลือกหัวข้อ</option>
                                            <option value="inquiry">สอบถามข้อมูลทั่วไป</option>
                                            <option value="consultation">ขอคำปรึกษาการหาศูนย์ดูแล</option>
                                            <option value="partnership">สนใจร่วมเป็นพาร์ทเนอร์</option>
                                            <option value="announcement">ลงประกาศศูนย์ดูแล</option>
                                            <option value="other">อื่นๆ</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">ข้อความ</label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            rows={5}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="รายละเอียดที่ต้องการสอบถาม..."
                                            required
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center shadow-lg shadow-blue-200"
                                    >
                                        <Send className="w-5 h-5 mr-2" />
                                        ส่งข้อความ
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>


                </div>
            </div>
        </>
    );
}
