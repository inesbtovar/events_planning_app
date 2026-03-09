'use client'
// components/dashboard/Navbar.tsx
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Props = {
  email?: string
  backHref?: string
  backLabel?: string
  title?: string
  children?: React.ReactNode
}

export default function Navbar({ email, backHref, backLabel, title, children }: Props) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav style={{
      borderBottom: '1px solid var(--border-subtle)',
      backdropFilter: 'blur(20px)',
      background: 'rgba(11,22,40,0.9)',
      position: 'sticky', top: 0, zIndex: 50,
    }} className="px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center gap-4">
        {backHref ? (
          <>
            <Link href={backHref} style={{ color: 'var(--text-secondary)', fontSize: '13px', textDecoration: 'none', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: '6px' }} className="hover:text-white transition-colors">
              ← {backLabel ?? 'Back'}
            </Link>
            {title && (
              <>
                <span style={{ color: 'var(--border)' }}>/</span>
                <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '14px' }}>{title}</span>
              </>
            )}
          </>
        ) : (
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{ background: 'linear-gradient(135deg, var(--teal), var(--green))', borderRadius: '8px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0B1628" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '16px', color: 'var(--text-primary)' }}>EventsDock</span>
          </Link>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
          {children}
          {email && (
            <>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'var(--font-body)' }} className="hidden sm:block">{email}</span>
              <Link href="/dashboard/billing" style={{ color: 'var(--text-secondary)', fontSize: '13px', textDecoration: 'none', fontFamily: 'var(--font-body)' }} className="hover:text-white transition-colors">
                Billing
              </Link>
              <button
                onClick={handleSignOut}
                style={{ color: 'var(--text-secondary)', fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                className="hover:text-white transition-colors"
              >
                Sign out
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
