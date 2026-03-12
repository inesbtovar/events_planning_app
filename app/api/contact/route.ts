// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getIP } from '@/lib/rate-limit'

function sanitize(value: unknown, maxLength: number): string {
  if (!value || typeof value !== 'string') return ''
  return value.replace(/<[^>]*>/g, '').replace(/[<>"'`]/g, '').trim().slice(0, maxLength)
}

function isValidEmail(email: string): boolean {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
}

export async function POST(request: NextRequest) {
  // Rate limit: 100 requests per hour per IP (as requested)
  const ip = getIP(request)
  const { allowed, resetAt } = rateLimit(ip, 'contact', { limit: 100, windowMs: 60 * 60 * 1000 })

  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)) },
      }
    )
  }

  let body: any
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const name = sanitize(body.name, 100)
  const email = sanitize(body.email, 254)
  const subject = sanitize(body.subject, 200)
  const message = sanitize(body.message, 2000)

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Name, email and message are required' }, { status: 400 })
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  // Log server-side (visible in Vercel logs)
  console.log(`[contact] from=${email} subject="${subject}"`)

  // When you add Resend, send email here:
  // await resend.emails.send({ from: 'noreply@eventsdock.com', to: 'eventsdock2026@gmail.com', subject, html: `...` })

  return NextResponse.json({ ok: true })
}