export default function TeamHistoryPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-[30px] border border-slate-800 bg-slate-900/80 p-8">
        <div className="text-[0.62rem] uppercase tracking-[0.28em] text-violet-300">Team history</div>
        <h1 className="mt-2 text-3xl font-black">Auction history</h1>
        <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-950/60 p-4">Previous bids and purchase records will update here after room activity.</div>
      </div>
    </main>
  );
}
