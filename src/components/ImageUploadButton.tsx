'use client';

import React, { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { fetchWithAuth } from '@/src/lib/auth-client';

/**
 * ฟังก์ชันย่อขนาดและบีบอัดรูปภาพบน Browser ผ่าน HTML5 Canvas
 * แปลงเป็น WebP พร้อมควบคุมขนาดและความละเอียด ไม่ต้องพึ่ง Library เสริม
 */
async function compressAndResizeImage(
    file: File,
    maxWidth: number = 1400,
    maxHeight: number = 1400,
    quality: number = 0.82
): Promise<File> {
    // ข้ามไฟล์ SVG และ GIF เพื่อรักษา Vector และ Animation ไว้
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
        return file;
    }

    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;

            img.onload = () => {
                let { width, height } = img;

                // คำนวณขนาดใหม่โดยคงอัตราส่วน (Aspect Ratio) ไว้
                if (width > maxWidth || height > maxHeight) {
                    if (width > height) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    } else {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return resolve(file); // Fallback ใช้ไฟล์เดิมถ้า browser ไม่รองรับ 2D context
                }

                // เปิดการเกลี่ยพิกเซลให้นุ่มนวล คมชัด
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);

                // บีบอัดและแปลงเป็น WebP
                const targetType = 'image/webp';
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            return resolve(file);
                        }

                        // เปลี่ยนนามสกุลไฟล์เป็น .webp
                        const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                        const newFileName = `${originalName}.webp`;

                        const resizedFile = new File([blob], newFileName, {
                            type: targetType,
                            lastModified: Date.now(),
                        });

                        // ถ้าไฟล์ที่ย่อแล้วมีขนาดใหญ่กว่าเดิม (เกิดขึ้นได้น้อยมาก) ให้ใช้ไฟล์เดิม
                        if (resizedFile.size >= file.size && file.type === 'image/webp') {
                            resolve(file);
                        } else {
                            resolve(resizedFile);
                        }
                    },
                    targetType,
                    quality
                );
            };

            img.onerror = () => resolve(file);
        };

        reader.onerror = () => resolve(file);
    });
}

interface ImageUploadButtonProps {
    onUploadSuccess: (url: string) => void;
    folder?: string;
    label?: string;
    className?: string;
    disabled?: boolean;
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    autoResize?: boolean;
}

export default function ImageUploadButton({
    onUploadSuccess,
    folder = 'uploads',
    label = 'อัปโหลดรูปภาพ',
    className = '',
    disabled = false,
    maxWidth = 1400,
    maxHeight = 1400,
    quality = 0.82,
    autoResize = true
}: ImageUploadButtonProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [statusText, setStatusText] = useState('กำลังอัปโหลด...');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset file input value so same file can be selected again if needed
        e.target.value = '';

        // Validate client side
        if (!file.type.startsWith('image/')) {
            alert('กรุณาเลือกไฟล์ที่เป็นรูปภาพเท่านั้น (JPG, PNG, WEBP, GIF, SVG)');
            return;
        }

        if (file.size > 15 * 1024 * 1024) {
            alert('ไฟล์รูปภาพต้องมีขนาดไม่เกิน 15MB');
            return;
        }

        try {
            setIsUploading(true);

            // 1. Resize & Compress บนเบราว์เซอร์อัตโนมัติ
            let fileToUpload = file;
            if (autoResize) {
                setStatusText('กำลังปรับขนาดภาพ...');
                fileToUpload = await compressAndResizeImage(file, maxWidth, maxHeight, quality);
            }

            // 2. อัปโหลดไฟล์ที่ถูกย่อขนาดแล้ว
            setStatusText('กำลังอัปโหลด...');
            const formData = new FormData();
            formData.append('file', fileToUpload);
            formData.append('folder', folder);

            const res = await fetchWithAuth('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
            }

            onUploadSuccess(data.url);
        } catch (error: any) {
            console.error('Upload error:', error);
            alert(error.message || 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
        } finally {
            setIsUploading(false);
            setStatusText('กำลังอัปโหลด...');
        }
    };

    return (
        <div className="inline-block">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml"
                className="hidden"
                onChange={handleFileChange}
                disabled={disabled || isUploading}
            />
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer shadow-xs disabled:opacity-60 disabled:cursor-not-allowed ${
                    className || 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                }`}
            >
                {isUploading ? (
                    <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                        <span>{statusText}</span>
                    </>
                ) : (
                    <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>{label}</span>
                    </>
                )}
            </button>
        </div>
    );
}

