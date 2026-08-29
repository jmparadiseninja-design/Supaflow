import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-zinc-100">
      <header className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center border-b border-zinc-900">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center font-bold text-black">S</div>
          <span className="text-xl font-bold">Supa<span className="text-blue-500">Flow</span> AI</span>
        </div>
        <Link href="/dashboard" className="bg-white text-black px-4 py-2 rounded-md text-sm font-semibold">Launch AI App</Link>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
      
                  <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1 text-xs text-zinc-400">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span> Built for Supabase • Works with any Postgres
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mt-6">
          One control plane for<br />
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">all your backend jobs.</span>
        </h1>
        <p className="mt-6 text-lg text-zinc-400 max-w-2xl mx-auto">
          Type "When Stripe fails, retry then Slack me" - AI generates the canvas, queue, and vault wiring. No Redis. Just Postgres.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/dashboard" className="bg-white text-black px-6 py-3 rounded-md font-semibold">Launch AI App</Link>
        </div>
      </section>

      <footer className="border-t border-zinc-900 py-8 text-center text-xs text-zinc-600">
        getsupaflow.com - FIXED v1.1 - Built while at work, with 4 hrs sleep 💖
      </footer>
    </main>
  );
}
