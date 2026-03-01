export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-widest text-stone-400">Loading</p>
      </div>
    </div>
  );
}
