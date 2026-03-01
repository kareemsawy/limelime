export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="text-center">
        <h1 className="font-serif text-3xl mb-4">Authentication Error</h1>
        <p className="text-stone-600 mb-8">Something went wrong during sign in.</p>
        <a href="/auth/login" className="bg-stone-900 text-white px-8 py-3 text-sm tracking-widest uppercase">
          Try Again
        </a>
      </div>
    </div>
  );
}
