import { IMAGES } from '@/config';
import { motion } from 'framer-motion';

import { LoadingSpinner } from './LoadingSpinner';

export function RouteLoadingFallback() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 1.01, filter: 'blur(2px)' }}
      transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
      className="bg-background fixed inset-0 z-[9999] flex min-h-[100dvh] w-screen flex-col items-center justify-center gap-8 overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1], delay: 0.1 }}
        className="flex flex-col items-center gap-4"
      >
        <img
          src={IMAGES.logo.principal}
          alt="J&S Empregos LTDA"
          className="h-12 w-auto"
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1], delay: 0.3 }}
      >
        <LoadingSpinner size="md" />
      </motion.div>
    </motion.div>
  );
}
