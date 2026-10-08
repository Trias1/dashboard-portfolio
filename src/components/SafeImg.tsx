'use client';
import { useState, type ImgHTMLAttributes, type SyntheticEvent } from 'react';

/** <img> that removes itself when the image fails to load (e.g. a user pasted a share link, not an image URL). */
export default function SafeImg({ onError, src, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const [failedSrc, setFailedSrc] = useState<unknown>(null);
  if (!src || failedSrc === src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- plain img on purpose; alt is passed through by callers
    <img
      src={src}
      {...props}
      onError={(e: SyntheticEvent<HTMLImageElement>) => { setFailedSrc(src); onError?.(e); }}
    />
  );
}
