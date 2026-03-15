import Link from 'next/link'

export default function MarketingNav() {
  return (
    <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
        <Link href="/" className="font-display text-base font-bold text-accent tracking-tight">
          NARRATEAML
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <Link href="/features" className="btn-ghost text-sm py-1.5 px-3">Features</Link>
          <Link href="/pricing" className="btn-ghost text-sm py-1.5 px-3">Pricing</Link>
          <Link href="/security" className="btn-ghost text-sm py-1.5 px-3">Security</Link>
          <Link href="/faq" className="btn-ghost text-sm py-1.5 px-3">FAQ</Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="btn-ghost text-sm py-2">Sign In</Link>
          <Link href="/sign-up" className="btn-primary text-sm py-2">Start Free</Link>
        </div>
      </div>
    </nav>
  )
}
