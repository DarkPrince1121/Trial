import Link from 'next/link'

export default function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-surface mt-24">
      <div className="max-w-6xl mx-auto px-5 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="font-display text-base font-bold text-accent mb-3">NARRATEAML</div>
            <p className="text-text-muted text-sm leading-relaxed mb-4">
              AI-assisted STR narrative drafting for Canadian AML professionals.
            </p>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary text-sm transition-colors"
            >
              LinkedIn
            </a>
          </div>

          {/* Product */}
          <div>
            <div className="text-xs font-mono font-medium text-text-muted uppercase tracking-widest mb-4">Product</div>
            <ul className="space-y-2.5">
              {[
                { label: 'Generate', href: '/sign-up' },
                { label: 'Features', href: '/features' },
                { label: 'Pricing', href: '/pricing' },
                { label: 'Security', href: '/security' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-text-muted hover:text-text-primary text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <div className="text-xs font-mono font-medium text-text-muted uppercase tracking-widest mb-4">Company</div>
            <ul className="space-y-2.5">
              {[
                { label: 'FAQ', href: '/faq' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-text-muted hover:text-text-primary text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <div className="text-xs font-mono font-medium text-text-muted uppercase tracking-widest mb-4">Contact</div>
            <ul className="space-y-2.5 text-sm text-text-muted">
              <li><a href="mailto:support@narrateaml.com" className="hover:text-text-primary transition-colors">support@narrateaml.com</a></li>
              <li><a href="mailto:security@narrateaml.com" className="hover:text-text-primary transition-colors">security@narrateaml.com</a></li>
              <li><a href="mailto:privacy@narrateaml.com" className="hover:text-text-primary transition-colors">privacy@narrateaml.com</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-text-muted text-xs">
            &copy; {new Date().getFullYear()} NarrateAML. All rights reserved. Proprietary software — not licensed for redistribution.
          </p>
          <p className="text-text-muted text-xs max-w-md text-right">
            AI-Assisted Draft — All outputs require human review by a qualified AML professional before submission to any regulatory authority.
            Not a FINTRAC filing tool.
          </p>
        </div>
      </div>
    </footer>
  )
}
