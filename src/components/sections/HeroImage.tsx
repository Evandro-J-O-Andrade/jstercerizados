import { useState, useEffect } from 'react';
import { SafeImage } from '@/components/ui/SafeImage';
import { cn } from '@/utils';

interface HeroImageProps {
  src?: string;
  alt: string;
  className?: string;
  aspect?: '4/3' | '16/9' | '3/2';
}

export function HeroImage({
  src,
  alt,
  className,
  aspect = '4/3',
}: HeroImageProps) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [src]);

  const aspectRatio = {
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-[16/9]',
    '3/2': 'aspect-[3/2]',
  }[aspect];

  if (!src || imageError) {
    return (
      <div
        className={cn(
          'bg-surface-alt relative overflow-hidden rounded-3xl motion-safe:shadow-xl',
          aspectRatio,
          className,
        )}
      >
        <svg
          viewBox="0 0 720 520"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          role="img"
        >
          <rect
            width="720"
            height="520"
            rx="28"
            fill="hsl(var(--surface-alt))"
          />

          <defs>
            <linearGradient
              id="js-hero-gradient"
              x1="0"
              y1="0"
              x2="720"
              y2="520"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="hsl(var(--surface-alt) / 0.8)" />
              <stop offset="100%" stopColor="hsl(var(--surface) / 0.6)" />
            </linearGradient>

            <filter id="js-hero-shadow" x="-20" y="-20" width="40" height="40">
              <feDropShadow
                dx="0"
                dy="8"
                stdDeviation="16"
                floodColor="hsl(var(--primary) / 0.15)"
              />
            </filter>
          </defs>

          <rect
            x="1"
            y="1"
            width="718"
            height="518"
            rx="27"
            fill="url(#js-hero-gradient)"
          />

          <g transform="translate(160, 60)" filter="url(#js-hero-shadow)">
            <circle
              cx="150"
              cy="130"
              r="90"
              fill="hsl(var(--surface) / 0.8)"
              stroke="hsl(var(--border))"
              strokeWidth="2"
            />
            <path
              d="M80 260 C80 194 134 140 200 140 C266 140 320 194 320 260"
              stroke="hsl(var(--border))"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M120 200 C120 178 138 160 160 160 C182 160 200 178 200 200"
              stroke="hsl(var(--border))"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>

          <g transform="translate(430, 120)" filter="url(#js-hero-shadow)">
            <rect
              x="0"
              y="0"
              width="130"
              height="130"
              rx="20"
              fill="hsl(var(--surface) / 0.9)"
              stroke="hsl(var(--border))"
              strokeWidth="2"
            />
            <rect
              x="15"
              y="30"
              width="100"
              height="8"
              rx="4"
              fill="hsl(var(--muted-foreground))"
            />
            <rect
              x="15"
              y="50"
              width="100"
              height="8"
              rx="4"
              fill="hsl(var(--muted-foreground))"
              opacity="0.6"
            />
            <rect
              x="15"
              y="70"
              width="70"
              height="8"
              rx="4"
              fill="hsl(var(--muted-foreground))"
              opacity="0.4"
            />
            <circle cx="105" cy="100" r="12" fill="hsl(var(--primary))" />
            <path
              d="M99 100 L103 104 L111 96"
              stroke="hsl(var(--primary-foreground))"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          <g transform="translate(250, 340)" filter="url(#js-hero-shadow)">
            <rect
              x="0"
              y="0"
              width="220"
              height="60"
              rx="16"
              fill="hsl(var(--surface) / 0.9)"
              stroke="hsl(var(--border))"
              strokeWidth="2"
            />
            <rect
              x="25"
              y="18"
              width="170"
              height="6"
              rx="3"
              fill="hsl(var(--muted-foreground))"
            />
            <rect
              x="25"
              y="32"
              width="120"
              height="6"
              rx="3"
              fill="hsl(var(--muted-foreground))"
              opacity="0.6"
            />
            <rect
              x="25"
              y="46"
              width="90"
              height="6"
              rx="3"
              fill="hsl(var(--muted-foreground))"
              opacity="0.4"
            />
          </g>
        </svg>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl motion-safe:shadow-xl motion-reduce:shadow-sm',
        aspectRatio,
        className,
      )}
    >
      <SafeImage
        src={src}
        alt={alt}
        fallbackSrc={src}
        className="h-full w-full object-cover motion-safe:duration-300"
        loading="eager"
        onError={() => setImageError(true)}
      />
    </div>
  );
}

export type { HeroImageProps };
