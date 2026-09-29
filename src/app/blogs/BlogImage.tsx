'use client';

import React, { useState } from 'react';
import Image from 'next/image';

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect fill='%23f3f4f6' width='600' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";

interface BlogImageProps {
    src?: string;
    alt: string;
    className?: string;
    fallbackSrc?: string;
    sizes?: string;
}

export default function BlogImage({
    src,
    alt,
    className = '',
    fallbackSrc = FALLBACK_IMAGE,
    sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px'
}: BlogImageProps) {
    const [prevSrc, setPrevSrc] = useState(src);
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    if (src !== prevSrc) {
        setPrevSrc(src);
        setHasError(false);
        setIsLoading(true);
    }

    const effectiveSrc = hasError || !src ? fallbackSrc : src;
    const isDataUri = typeof effectiveSrc === 'string' && effectiveSrc.startsWith('data:');

    return (
        <div className="relative w-full h-full bg-gray-100 overflow-hidden">
            {/* Skeleton Pulse ขณะรอภาพ */}
            {isLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse z-10" />
            )}
            <Image
                key={src}
                src={effectiveSrc}
                alt={alt || 'ภาพประกอบบทความ'}
                fill
                sizes={sizes}
                unoptimized={isDataUri}
                className={`object-cover transition-all duration-500 ${className} ${
                    isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                }`}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                    setHasError(true);
                    setIsLoading(false);
                }}
            />
        </div>
    );
}

