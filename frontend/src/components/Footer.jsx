function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900 py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
        <div className="flex items-center gap-2 font-semibold text-slate-400">
          <span>📈</span>
          <span>ShopezTrade</span>
        </div>
        <p>Virtual stock trading platform — all balances and trades are simulated.</p>
        <p>© {new Date().getFullYear()} ShopezTrade</p>
      </div>
    </footer>
  )
}

export default Footer