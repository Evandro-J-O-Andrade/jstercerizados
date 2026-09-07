export function PageLoader() {
  return (
    <div className="flex min-h-[60dvh] items-center justify-center">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-2 border-gray-800/60" />
        <div className="border-t-primary border-r-primary absolute inset-0 animate-spin rounded-full border-2 border-transparent shadow-[0_0_15px_rgba(212,160,23,0.35)]" />
      </div>
    </div>
  );
}
