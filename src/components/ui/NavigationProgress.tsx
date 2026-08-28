import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const MIN_VISIBILITY_MS = 120;

export function NavigationProgress() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    const timeout = setTimeout(() => {
      if (!isCancelled) {
        setMounted(true);
        setVisible(true);
      }
    }, MIN_VISIBILITY_MS);

    return () => {
      isCancelled = true;
      clearTimeout(timeout);
    };
  }, [location.pathname, location.search]);

  if (!mounted) {
    return null;
  }

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="navigation-progress"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="pointer-events-none fixed inset-x-0 top-0 z-[80] flex justify-center"
        >
          <div className="border-border/60 bg-background/80 mt-3 flex items-center gap-2 rounded-full border px-3 py-1.5 shadow-sm backdrop-blur">
            <span className="text-primary relative flex h-2.5 w-2.5">
              <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
              <span className="bg-primary relative inline-flex h-2.5 w-2.5 rounded-full" />
            </span>
            <span className="text-foreground text-xs font-medium">
              Navegando...
            </span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
