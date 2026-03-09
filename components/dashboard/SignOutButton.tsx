'use client'
// components/dashboard/SignOutButton.tsx
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      style={{
        color: 'var(--text-secondary)', fontSize: '13px',
        background: 'none', border: 'none', cursor: 'pointer',
        fontFamily: 'var(--font-body)', transition: 'color 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.color = 'white')}
      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
    >
      Sign out
    </button>
  )
}
