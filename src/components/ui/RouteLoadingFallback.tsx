import { useState, useEffect } from 'react';
import { IMAGES } from '@/config';
import { motion } from 'framer-motion';

import { LoadingSpinner } from './LoadingSpinner';

const PROLONGED_LOADING_DELAY = 2000;

export function RouteLoadingFallback() {
  const [showExtended, setShowExtended] = useState(false);

  useEffect(() => {
    const timer = setTimeout(
      () => setShowExtended(true),
      PROLONGED_LOADING_DELAY,
    );
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.01 }}
      transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
      className="flex flex-col items-center justify-center gap-6 py-12"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <LoadingSpinner size="md" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={showExtended ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
        className="flex flex-col items-center gap-2 text-center"
      >
        <img
          src={IMAGES.logo.principal}
          alt="J&S Empregos LTDA"
          className="h-10 w-auto opacity-90"
        />
        <p className="text-muted-foreground text-sm font-medium">
          Carregando seu conteúdo...
        </p>
      </motion.div>
    </motion.div>
  );
}
