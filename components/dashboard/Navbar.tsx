'use client'
// components/dashboard/Navbar.tsx
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

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
    toast.success('Signed out')
    router.push('/login')
  }

  return (
    <nav className="bg-white border-b border-stone-200 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center gap-4">
        {backHref ? (
          <>
            <Link href={backHref} className="text-stone-400 hover:text-stone-700 text-sm transition-colors">
              ← {backLabel ?? 'Back'}
            </Link>
            {title && (
              <>
                <span className="text-stone-300">/</span>
                <span className="text-stone-800 font-semibold text-sm">{title}</span>
              </>
            )}
          </>
        ) : (
          <Link href="/dashboard" className="text-xl font-bold text-stone-900 tracking-tight">
            EventsDock
          </Link>
        )}

        <div className="ml-auto flex items-center gap-4">
          {children}
          {email && (
            <>
              <span className="text-sm text-stone-400 hidden sm:block">{email}</span>
              <Link
                href="/dashboard/settings/billing"
                className="text-sm text-stone-400 hover:text-stone-700 transition-colors"
              >
                Billing
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm text-stone-400 hover:text-stone-700 transition-colors"
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
