'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
    src: string | null | undefined;
    fallback?: string;
}

export default function OptimizedImage({
    src,
    alt,
    width,
    height,
    className,
    priority = false,
    fallback = '/placeholder-image.png',
    ...props
}: OptimizedImageProps) {
    const [imgSrc, setImgSrc] = useState(src || fallback);

    // Determine if we should use lazy loading (Next.js default is lazy, but we can be explicit)
    const loadingStrategy = priority ? 'eager' : 'lazy';

    return (
        <Image
            src={imgSrc}
            alt={alt || 'Imagen de Pyper'}
            width={width}
            height={height}
            className={className}
            priority={priority}
            loading={priority ? undefined : 'lazy'}
            onError={() => {
                if (imgSrc !== fallback) {
                    setImgSrc(fallback);
                }
            }}
            // Optimization: WebP is handled automatically by Next.js Image component
            {...props}
        />
    );
}
