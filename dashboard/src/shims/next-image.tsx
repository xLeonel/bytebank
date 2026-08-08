import type { ImgHTMLAttributes } from 'react';

/**
 * Shim de `next/image` -> <img> puro. Descarta props exclusivas do Next
 * (priority, fill, placeholder, quality, sizes, loader) e mantém o resto.
 */
type NextImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  src: string | { src: string };
  priority?: boolean;
  fill?: boolean;
  placeholder?: string;
  quality?: number;
  loader?: unknown;
  unoptimized?: boolean;
};

export default function NextImage({
  src,
  priority: _priority,
  fill,
  placeholder: _placeholder,
  quality: _quality,
  loader: _loader,
  unoptimized: _unoptimized,
  style,
  alt = '',
  ...rest
}: NextImageProps) {
  const resolvedSrc = typeof src === 'string' ? src : src?.src;
  const fillStyle = fill
    ? { position: 'absolute' as const, inset: 0, width: '100%', height: '100%', ...style }
    : style;
  return <img src={resolvedSrc} alt={alt} style={fillStyle} {...rest} />;
}
