'use client';

import { useState } from 'react';

interface BlogImageProps {
    src: string;
    alt: string;
    className?: string;
    fallbackSrc?: string;
}

export default function BlogImage({
    src,
    alt,
    className,
    fallbackSrc = 'https://via.placeholder.com/800x600?text=Image+Not+Available'
}: BlogImageProps) {
    const [imgSrc, setImgSrc] = useState(src);

    return (
        <img
            src={imgSrc}
            alt={alt}
            className={className}
            onError={() => setImgSrc(fallbackSrc)}
        />
    );
}
