import { motion } from 'framer-motion';

export function RouteLoadingFallback() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center justify-center"
    >
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-2 border-gray-800/60" />
        <div className="border-t-primary border-r-primary absolute inset-0 animate-spin rounded-full border-2 border-transparent shadow-[0_0_15px_rgba(212,160,23,0.35)]" />
      </div>
    </motion.div>
  );
}
