import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Maximize } from 'lucide-react';
import { cn } from '@/utils';

interface VideoPlayerProps {
  src: string | null;
  className?: string;
  onEnded?: () => void;
  title?: string;
}

export function VideoPlayer({
  src,
  className,
  onEnded,
  title,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleLoaded = () => setDuration(video.duration || 0);
    const handleTime = () => setCurrentTime(video.currentTime || 0);
    video.addEventListener('loadedmetadata', handleLoaded);
    video.addEventListener('timeupdate', handleTime);
    return () => {
      video.removeEventListener('loadedmetadata', handleLoaded);
      video.removeEventListener('timeupdate', handleTime);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  };

  const formatTime = (seconds: number): string => {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!src) {
    return (
      <div className="bg-muted flex aspect-video items-center justify-center rounded-lg">
        <div className="text-center">
          <Play className="text-muted-foreground mx-auto h-12 w-12" />
          <p className="text-muted-foreground mt-2 text-sm">
            Video nao disponivel
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('group relative', className)}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        className="aspect-video w-full rounded-lg bg-black object-contain"
        playsInline
        controls={false}
        onEnded={onEnded}
        title={title}
      />
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center transition-opacity',
          showControls ? 'opacity-100' : 'opacity-0',
        )}
      >
        <button
          type="button"
          onClick={togglePlay}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-black/80"
          aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
        >
          {isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="ml-1 h-6 w-6" />
          )}
        </button>
      </div>
      <div
        className={cn(
          'absolute right-0 bottom-0 left-0 flex items-center gap-3 bg-gradient-to-t from-black/80 to-transparent p-3 transition-opacity',
          showControls ? 'opacity-100' : 'opacity-0',
        )}
      >
        <span className="text-xs text-white">{formatTime(currentTime)}</span>
        <div className="relative h-1 flex-1 cursor-pointer rounded-full bg-white/30">
          <div
            className="bg-primary absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${duration ? (currentTime / duration) * 100 : 0}%`,
            }}
          />
        </div>
        <span className="text-xs text-white">{formatTime(duration)}</span>
        <button
          type="button"
          onClick={() => {
            const video = videoRef.current;
            if (!video) return;
            video.volume = Math.max(0, video.volume - 0.1);
          }}
          className="text-white"
          aria-label="Diminuir volume"
        >
          <Volume2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => videoRef.current?.requestFullscreen()}
          className="text-white"
          aria-label="Tela cheia"
        >
          <Maximize className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
