"use client";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="text-center">
        <h1 className="font-serif text-3xl mb-4">Something went wrong</h1>
        <p className="text-stone-600 mb-8">An unexpected error occurred. Please try again.</p>
        <button onClick={reset} className="bg-stone-900 text-white px-8 py-3 text-sm tracking-widest uppercase hover:bg-stone-700 transition-colors">
          Try Again
        </button>
      </div>
    </div>
  );
}
