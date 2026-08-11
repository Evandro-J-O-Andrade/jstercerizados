import {
  type ImgHTMLAttributes,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { cn } from '@/utils';
import { IMAGE_FALLBACKS } from '@/config/imageFallbacks';

interface SafeImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallback?: ReactNode;
  fallbackSrc?: string;
  fallbackType?: keyof typeof IMAGE_FALLBACKS;
  skeleton?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

const GLOBAL_FALLBACK = IMAGE_FALLBACKS.global;

const DEFAULT_FALLBACK = (
  <div className="bg-surface-alt flex h-full w-full items-center justify-center">
    <svg
      className="text-muted-foreground h-12 w-12 opacity-40"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
      />
    </svg>
  </div>
);

export function SafeImage({
  src,
  alt = '',
  className,
  fallback,
  fallbackSrc,
  fallbackType,
  skeleton = true,
  loading = 'lazy',
  objectFit = 'cover',
  ...props
}: SafeImageProps) {
  const categoryFallback =
    fallbackType && IMAGE_FALLBACKS[fallbackType]
      ? IMAGE_FALLBACKS[fallbackType]
      : undefined;

  const finalFallbackSrc = fallbackSrc ?? categoryFallback ?? GLOBAL_FALLBACK;

  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const didLoadRef = useRef(false);

  useEffect(() => {
    setCurrentSrc(src);
    setIsLoading(true);
    setHasError(false);
    didLoadRef.current = false;
  }, [src]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const img = new Image();
    img.src = src;

    let mounted = true;

    const handleLoad = () => {
      if (!mounted) return;
      setIsLoading(false);
      didLoadRef.current = true;
    };

    const handleError = () => {
      if (!mounted) return;
      setIsLoading(false);
      setHasError(true);
      didLoadRef.current = true;
    };

    img.onload = handleLoad;
    img.onerror = handleError;

    if (img.complete) {
      handleLoad();
    }

    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  useEffect(() => {
    if (import.meta.env.DEV && !src && finalFallbackSrc) {
      console.warn(
        `[IMAGE MISSING] Imagem real não encontrada para o fallback "${finalFallbackSrc}". ` +
          `Defina uma imagem real em vez de confiar no fallback.`,
      );
    }
  }, [src, finalFallbackSrc]);

  const handleError = () => {
    if (import.meta.env.DEV && currentSrc !== finalFallbackSrc) {
      console.warn(
        `[IMAGE MISSING] Imagem real não encontrada: ${currentSrc}\n` +
          `Fallback utilizado: ${finalFallbackSrc}`,
      );
    }

    if (currentSrc !== finalFallbackSrc) {
      setCurrentSrc(finalFallbackSrc);
      setIsLoading(true);
      return;
    }

    if (finalFallbackSrc !== GLOBAL_FALLBACK) {
      if (import.meta.env.DEV) {
        console.warn(
          `[IMAGE MISSING] Fallback da categoria também falhou: ${finalFallbackSrc}\n` +
            `Usando fallback global: ${GLOBAL_FALLBACK}`,
        );
      }
      setCurrentSrc(GLOBAL_FALLBACK);
      setIsLoading(true);
      return;
    }

    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {isLoading && skeleton && (
        <div className="bg-surface-alt absolute inset-0 animate-pulse" />
      )}
      {hasError ? (
        (fallback ?? DEFAULT_FALLBACK)
      ) : (
        <img
          src={currentSrc}
          alt={alt}
          loading={loading}
          onLoad={() => setIsLoading(false)}
          onError={handleError}
          className={cn(
            'h-full w-full transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100',
          )}
          style={{ objectFit }}
          {...props}
        />
      )}
    </div>
  );
}
