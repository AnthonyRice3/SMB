export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-10 px-6 mt-8">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-5">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#FF6B61] flex-shrink-0" />
          <span className="font-semibold text-white text-sm tracking-tight">SAGAH</span>
        </div>

        {/* Links */}
        <div className="flex gap-6 text-sm text-white/30">
          <a href="#learn" className="hover:text-white/70 transition-colors">Features</a>
          <a href="/pricing" className="hover:text-white/70 transition-colors">Pricing</a>
          <a href="/about" className="hover:text-white/70 transition-colors">About</a>
          <a href="#get-started" className="hover:text-white/70 transition-colors">Get started</a>
        </div>

        {/* Copyright */}
        <p className="text-sm text-white/25">
          © {new Date().getFullYear()} SAGAH
        </p>
      </div>
    </footer>
  );
}
