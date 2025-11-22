
'use client';

import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import Header from "../../components/Header";
import Footer from "../../components/Footer";

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
                        backgroundImage: 'url("/images/hero-background.jpg")',
                        backgroundPosition: 'center 40%',
                    }}
                >
                    <div className="absolute inset-0 bg-blue-900/60"></div>
                    <div className="relative z-10 container mx-auto px-4 text-center text-white">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">ติดต่อเรา</h1>
                        <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                            มีข้อสงสัยหรือต้องการคำปรึกษา? ทีมงานของเราพร้อมดูแลและให้คำแนะนำท่านตลอดเวลา
                        </p>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-16">
                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Contact Info */}
                        <div className="lg:col-span-1 space-y-8">
                            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">ข้อมูลการติดต่อ</h3>

                                <div className="space-y-6">
                                    <div className="flex items-start">
                                        <div className="bg-blue-50 p-3 rounded-lg mr-4">
                                            <MapPin className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">ที่อยู่</p>
                                            <p className="text-gray-600 mt-1">
                                                123 อาคารยูดีทาวเวอร์ ชั้น 15 <br />
                                                ถนนสุขุมวิท แขวงคลองเตย <br />
                                                เขตคลองเตย กรุงเทพฯ 10110
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div className="bg-blue-50 p-3 rounded-lg mr-4">
                                            <Phone className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">เบอร์โทรศัพท์</p>
                                            <p className="text-gray-600">095-805-7052</p>
                                            {/* <p className="text-gray-600">089-999-9999 (สายด่วน)</p> */}
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div className="bg-blue-50 p-3 rounded-lg mr-4">
                                            <Mail className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">อีเมล</p>
                                            <p className="text-gray-600 mt-1">Pannatat7002@gmail.com</p>
                                            {/* <p className="text-gray-600">support@yoodeehomecare.com</p> */}
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div className="bg-blue-50 p-3 rounded-lg mr-4">
                                            <Clock className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">เวลาทำการ</p>
                                            <p className="text-gray-600 mt-1">จันทร์ - ศุกร์: 09:00 - 18:00 น.</p>
                                            <p className="text-gray-600">เสาร์ - อาทิตย์: 10:00 - 17:00 น.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-2">
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

                    {/* Map Section */}
                    <div className="mt-12">
                        <div className="bg-gray-200 rounded-2xl h-96 w-full overflow-hidden shadow-lg relative">
                            {/* Placeholder for Google Maps */}
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                <div className="text-center">
                                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-500 font-medium">Google Maps Placeholder</p>
                                    <p className="text-sm text-gray-400">13.7563° N, 100.5018° E</p>
                                </div>
                            </div>
                            {/* If you have a real map component or iframe, insert it here */}
                            {/* <iframe src="..." className="w-full h-full border-0" allowFullScreen loading="lazy"></iframe> */}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
