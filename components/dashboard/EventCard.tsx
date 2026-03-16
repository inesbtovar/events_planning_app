// components/dashboard/EventCard.tsx
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import type { Event } from '@/lib/types'

type Props = {
  event: Event & { guests?: { count: number }[] }
}

export default function EventCard({ event }: Props) {
  const guestCount = event.guests?.[0]?.count ?? 0

  return (
    <Link
      href={`/dashboard/${event.id}`}
      className="bg-white rounded-xl border border-stone-200 p-6 hover:border-stone-400 hover:shadow-sm transition-all block"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-stone-900 truncate">{event.name}</h3>
          {event.date && (
            <p className="text-stone-500 text-sm mt-1">
              📅 {formatDate(event.date, 'en-GB', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </p>
          )}
          {event.location && (
            <p className="text-stone-400 text-sm truncate">📍 {event.location}</p>
          )}
        </div>
        <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${
          event.is_published
            ? 'bg-green-100 text-green-700'
            : 'bg-stone-100 text-stone-500'
        }`}>
          {event.is_published ? 'Live' : 'Draft'}
        </span>
      </div>

      <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between text-sm text-stone-400">
        <span>{guestCount} {guestCount === 1 ? 'guest' : 'guests'}</span>
        <span className="capitalize text-xs">
          {event.template} template
        </span>
      </div>
    </Link>
  )
}
