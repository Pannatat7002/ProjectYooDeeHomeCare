'use client';

import React, { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { fetchWithAuth } from '@/src/lib/auth-client';

interface ImageUploadButtonProps {
    onUploadSuccess: (url: string) => void;
    folder?: string;
    label?: string;
    className?: string;
    disabled?: boolean;
}

export default function ImageUploadButton({
    onUploadSuccess,
    folder = 'uploads',
    label = 'อัปโหลดรูปภาพ',
    className = '',
    disabled = false
}: ImageUploadButtonProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

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

        if (file.size > 10 * 1024 * 1024) {
            alert('ไฟล์รูปภาพต้องมีขนาดไม่เกิน 10MB');
            return;
        }

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', file);
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
                        <span>กำลังอัปโหลด...</span>
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
