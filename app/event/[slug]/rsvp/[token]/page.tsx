'use client'
// app/event/[slug]/rsvp/[token]/page.tsx
// Guest-facing RSVP page — no login needed
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

type Guest = {
  name: string
  rsvp_status: string
  plus_one: boolean
  events: {
    name: string
    date: string
    location: string
    template: string
    template_config: any
  }
}

export default function RSVPPage() {
  // useParams() is fine in client components — no async needed
  const params = useParams()
  const token = params.token as string

  const [guest, setGuest] = useState<Guest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [status, setStatus] = useState<'confirmed' | 'declined'>('confirmed')
  const [plusOneName, setPlusOneName] = useState('')
  const [dietary, setDietary] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!token) return
    fetch(`/api/rsvp/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error)
        else {
          setGuest(data.guest)
          if (data.guest.rsvp_status !== 'pending') {
            setSubmitted(true)
            setStatus(data.guest.rsvp_status)
          }
        }
      })
      .catch(() => setError('Failed to load invitation'))
      .finally(() => setLoading(false))
  }, [token])

  async function handleSubmit() {
    setSubmitting(true)
    const res = await fetch(`/api/rsvp/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, plusOneName, dietary }),
    })
    const data = await res.json()
    if (data.success) setSubmitted(true)
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-stone-400 text-sm">Loading your invitation...</p>
        </div>
      </div>
    )
  }

  if (error || !guest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 px-6">
        <div className="text-center">
          <p className="text-4xl mb-4">🔗</p>
          <h1 className="text-xl font-semibold text-stone-800">Invalid link</h1>
          <p className="text-stone-500 mt-2 text-sm">{error || 'This invitation link is not valid.'}</p>
        </div>
      </div>
    )
  }

  const event = guest.events
  const eventDate = event?.date
    ? new Date(event.date).toLocaleDateString('en-GB', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : null

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 px-6">
        <div className="text-center max-w-md">
          <p className="text-5xl mb-4">{status === 'confirmed' ? '🎉' : '💌'}</p>
          <h1 className="text-2xl font-bold text-stone-900 mb-2">
            {status === 'confirmed' ? 'See you there!' : "We'll miss you!"}
          </h1>
          <p className="text-stone-500 text-sm leading-relaxed">
            {status === 'confirmed'
              ? `Your attendance at ${event?.name} is confirmed. We can't wait to celebrate with you!`
              : 'Your response has been recorded. Thank you for letting us know.'}
          </p>
          {eventDate && (
            <p className="mt-4 text-sm text-stone-400">📅 {eventDate}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">

          {/* Event header */}
          <div className="bg-stone-900 px-8 py-10 text-center">
            <p className="text-stone-400 text-xs uppercase tracking-widest mb-3">You're invited to</p>
            <h1 className="text-3xl font-bold text-white">{event?.name}</h1>
            {eventDate && (
              <p className="text-stone-300 mt-3 text-sm">{eventDate}</p>
            )}
            {event?.location && (
              <p className="text-stone-400 text-sm mt-1">📍 {event.location}</p>
            )}
          </div>

          {/* RSVP form */}
          <div className="px-8 py-8">
            <p className="text-stone-600 mb-6 text-center text-sm">
              Hi <strong className="text-stone-900">{guest.name}</strong>, will you be joining us?
            </p>

            {/* Confirm / Decline toggle */}
            <div className="flex rounded-xl border border-stone-200 overflow-hidden mb-6">
              <button
                onClick={() => setStatus('confirmed')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  status === 'confirmed'
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-stone-500 hover:bg-stone-50'
                }`}
              >
                ✓ I'll be there
              </button>
              <button
                onClick={() => setStatus('declined')}
                className={`flex-1 py-3 text-sm font-medium transition-colors border-l border-stone-200 ${
                  status === 'declined'
                    ? 'bg-red-400 text-white'
                    : 'bg-white text-stone-500 hover:bg-stone-50'
                }`}
              >
                ✗ Can't make it
              </button>
            </div>

            {/* Extra fields when confirmed */}
            {status === 'confirmed' && (
              <div className="space-y-4 mb-6">
                {guest.plus_one && (
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">
                      Guest name <span className="text-stone-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={plusOneName}
                      onChange={e => setPlusOneName(e.target.value)}
                      placeholder="Your guest's name"
                      className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-stone-400"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    Dietary restrictions <span className="text-stone-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={dietary}
                    onChange={e => setDietary(e.target.value)}
                    placeholder="e.g. vegetarian, gluten-free..."
                    className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-stone-400"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-stone-900 text-white py-3 rounded-xl font-medium hover:bg-stone-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Sending...' : 'Confirm my response'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-stone-400 mt-6">
          Powered by EventsDock
        </p>
      </div>
    </div>
  )
}
