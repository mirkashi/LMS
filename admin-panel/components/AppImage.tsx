'use client';

import { useMemo, useState } from 'react';
import { getAssetUrl } from '@/lib/assets';

type Props = {
  path?: string | null;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  loading?: 'eager' | 'lazy';
};

const DEFAULT_FALLBACK_DATA_URI =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <rect width="400" height="400" fill="#f3f4f6"/>
      <path d="M115 260l55-70 55 70 40-50 60 75H115z" fill="#d1d5db"/>
      <circle cx="160" cy="155" r="18" fill="#d1d5db"/>
      <text x="200" y="330" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#9ca3af">No image</text>
    </svg>`
  );

export default function AppImage({ path, alt, className, fallbackSrc, loading = 'lazy' }: Props) {
  const [errored, setErrored] = useState(false);

  const src = useMemo(() => {
    if (errored) return fallbackSrc || DEFAULT_FALLBACK_DATA_URI;
    return getAssetUrl(path) || fallbackSrc || DEFAULT_FALLBACK_DATA_URI;
  }, [path, errored, fallbackSrc]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={loading}
      onError={() => setErrored(true)}
      className={className}
    />
  );
}
