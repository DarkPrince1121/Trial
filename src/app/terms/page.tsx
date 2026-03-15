import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-text-primary font-sans">
      <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-4xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="font-display text-base font-bold text-accent">NARRATEAML</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-5 py-16 space-y-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-1.5 text-text-muted hover:text-text-primary text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <h1 className="font-display text-4xl font-bold text-text-primary mb-2">Terms of Service</h1>
          <p className="text-text-muted text-sm">Last updated: March 15, 2026</p>
        </div>

        <div className="space-y-6 text-text-secondary">
          {[
            {
              title: '1. Nature of Service',
              content: 'NarrateAML is an AI-assisted narrative drafting tool. It is NOT a regulatory filing tool. All outputs are AI-assisted drafts that require human review, editing, and professional judgment before use. NarrateAML does not guarantee regulatory compliance, legal sufficiency, or FINTRAC acceptance of any generated content.',
            },
            {
              title: '2. No Legal Advice',
              content: 'Nothing in NarrateAML\'s outputs constitutes legal advice. You are solely responsible for ensuring that any submitted reports comply with applicable regulatory requirements. Consult qualified legal and compliance professionals for advice specific to your situation.',
            },
            {
              title: '3. User Responsibilities',
              content: 'You are responsible for: reviewing all AI-generated narrative drafts before submission; ensuring factual accuracy of all information submitted; compliance with FINTRAC, your institution\'s AML policies, and all applicable laws; maintaining the confidentiality of your account credentials; not uploading files containing malware or inappropriate content.',
            },
            {
              title: '4. Statement File Processing',
              content: 'Statement files processed through the upload feature are parsed entirely in your browser. You represent that you have lawful authority to process the financial data contained in any uploaded files. You agree not to upload files containing data you are not authorized to process.',
            },
            {
              title: '5. Subscription and Billing',
              content: 'Free plan: 3 narrative drafts per month. Pro/Team subscriptions are billed monthly or annually. You may cancel at any time; access continues until the end of the billing period. Refunds are generally not provided for partial subscription periods. Payments processed by Stripe.',
            },
            {
              title: '6. Acceptable Use',
              content: 'You may not: use NarrateAML for any unlawful purpose; attempt to reverse-engineer or circumvent security measures; use automated tools to access the service in bulk; share your account with unauthorized users (except Team plan seats); submit false or misleading information.',
            },
            {
              title: '7. Limitation of Liability',
              content: 'NarrateAML is provided "as is." We are not liable for: any regulatory or legal consequences arising from your use of generated narratives; inaccuracies in AI-generated content; any indirect, incidental, or consequential damages. Our total liability to you shall not exceed the fees paid in the 3 months preceding the claim.',
            },
            {
              title: '8. Changes to Terms',
              content: 'We may update these terms. Material changes will be communicated via email or in-app notice. Continued use after notice constitutes acceptance.',
            },
            {
              title: '9. Contact',
              content: 'For terms questions, contact legal@narrateaml.com.',
            },
          ].map(({ title, content }) => (
            <div key={title} className="space-y-2">
              <h2 className="font-display font-bold text-text-primary text-lg">{title}</h2>
              <p className="text-sm leading-relaxed">{content}</p>
            </div>
          ))}
        </div>

        <div className="ai-warning-banner">
          <span>⚠</span>
          <span className="text-xs">
            AI-Assisted Draft — Review for accuracy, completeness, and regulatory suitability before submission.
            NarrateAML does not provide legal advice and is not a FINTRAC filing tool.
          </span>
        </div>
      </div>
    </div>
  )
}
