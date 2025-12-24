export default function TrendingLoading() {
  return (
    <div className="px-6 py-10 space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-white/10 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-40 rounded-xl bg-white/5 border border-white/10"
          />
        ))}
      </div>
    </div>
  );
}
