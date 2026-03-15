'use client'

import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold text-accent mb-2">
            NARRATEAML
          </h1>
          <p className="text-text-secondary text-sm">
            STR narratives drafted in 60 seconds.
          </p>
        </div>
        <SignIn
          appearance={{
            variables: {
              colorBackground: '#111827',
              colorText: '#F8FAFC',
              colorTextSecondary: '#94A3B8',
              colorInputBackground: '#0F172A',
              colorInputText: '#F8FAFC',
              colorPrimary: '#C9A84C',
              borderRadius: '0.375rem',
            },
            elements: {
              card: 'bg-surface border border-border shadow-surface-lg',
              headerTitle: 'font-display text-text-primary',
              formButtonPrimary: 'btn-primary w-full',
              footerActionLink: 'text-accent hover:text-accent-light',
              dividerLine: 'bg-border',
              dividerText: 'text-text-muted',
            },
          }}
        />
      </div>
    </div>
  )
}
