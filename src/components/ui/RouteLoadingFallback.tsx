import { motion } from 'framer-motion';

export function RouteLoadingFallback() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center justify-center py-12"
    >
      <div className="flex items-center gap-3">
        <span className="relative flex h-3 w-3">
          <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
          <span className="bg-primary relative inline-flex h-3 w-3 rounded-full" />
        </span>
      </div>
    </motion.div>
  );
}
