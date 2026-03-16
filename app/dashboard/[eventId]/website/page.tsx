'use client'
// app/dashboard/[eventId]/website/page.tsx
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import dynamic from 'next/dynamic'

const TemplateElegant = dynamic(() => import('@/components/templates/TemplateElegant'), { ssr: false })
const TemplateRustic  = dynamic(() => import('@/components/templates/TemplateRustic'),  { ssr: false })
const TemplateModern  = dynamic(() => import('@/components/templates/TemplateModern'),  { ssr: false })

const TEMPLATES = [
  { id: 'elegant', name: 'Elegant',  description: 'Luxury serif, gold accents',   color: '#C9A84C', bg: '#FAF7F2' },
  { id: 'rustic',  name: 'Rustic',   description: 'Warm, botanical, countryside', color: '#8B5E3C', bg: '#F5EFE3' },
  { id: 'modern',  name: 'Modern',   description: 'Bold, editorial, graphic',     color: '#FF3B00', bg: '#0A0A0A' },
]

const TEMPLATE_COMPONENTS: Record<string, React.ComponentType<any>> = {
  elegant: TemplateElegant,
  rustic:  TemplateRustic,
  modern:  TemplateModern,
}

const INNER_WIDTH = 1280

export default function WebsitePage() {
  const params = useParams()
  const eventId = params.eventId as string
  const supabase = createClient()

  const [event, setEvent]           = useState<any>(null)
  const [template, setTemplate]     = useState('elegant')
  const [config, setConfig]         = useState<any>({})
  const [saving, setSaving]         = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [scale, setScale]           = useState(0.5)

  const containerRef = useRef<HTMLDivElement>(null)

  // Measure container and set scale whenever layout changes
  useEffect(() => {
    function measure() {
      if (!containerRef.current) return
      const w = containerRef.current.getBoundingClientRect().width
      if (w > 0) setScale(w / INNER_WIDTH)
    }
    measure()
    const t = setTimeout(measure, 50)
    const t2 = setTimeout(measure, 300)
    window.addEventListener('resize', measure)
    return () => {
      clearTimeout(t)
      clearTimeout(t2)
      window.removeEventListener('resize', measure)
    }
  }, [event])

  useEffect(() => {
    if (!eventId) return
    supabase.from('events').select('*').eq('id', eventId).single()
      .then(({ data }) => {
        if (data) {
          setEvent(data)
          setTemplate(data.template || 'elegant')
          setConfig(data.template_config || {})
        }
      })
  }, [eventId])

  async function save() {
    setSaving(true)
    const { error } = await supabase
      .from('events').update({ template, template_config: config }).eq('id', eventId)
    if (error) toast.error(error.message)
    else { toast.success('Changes saved'); setEvent((e: any) => ({ ...e, template, template_config: config })) }
    setSaving(false)
  }

  async function togglePublish() {
    setPublishing(true)
    const newState = !event.is_published
    const { error } = await supabase
      .from('events').update({ is_published: newState, template, template_config: config }).eq('id', eventId)
    if (error) toast.error(error.message)
    else {
      setEvent({ ...event, is_published: newState, template, template_config: config })
      toast.success(newState ? 'Event is now live! 🎉' : 'Event unpublished')
    }
    setPublishing(false)
  }

  if (!event) return (
    <div className="min-h-screen grid-bg flex items-center justify-center" style={{ background: 'var(--navy)' }}>
      <div style={{ width: '24px', height: '24px', border: '2px solid var(--border)', borderTopColor: 'var(--teal)', borderRadius: '99px' }} className="animate-spin" />
    </div>
  )

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const publicUrl = `${appUrl}/event/${event.slug}`
  const previewEvent = { ...event, template, template_config: config }
  const PreviewComponent = TEMPLATE_COMPONENTS[template] ?? TemplateElegant

  return (
    <div className="min-h-screen grid-bg" style={{ background: 'var(--navy)', fontFamily: 'var(--font-body)' }}>

      {/* Navbar */}
      <nav style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(11,22,40,0.9)', backdropFilter: 'blur(20px)' }} className="px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Link href={`/dashboard/${eventId}`} style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
            className="hover:opacity-70 transition-opacity">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            {event.name}
          </Link>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          <span style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '14px' }}>Edit template</span>
          <div className="ml-auto flex items-center gap-2">
            {event.is_published && (
              <a href={publicUrl} target="_blank" rel="noopener noreferrer"
                style={{ border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', padding: '7px 14px', borderRadius: '99px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                View live
              </a>
            )}
            <button onClick={save} disabled={saving}
              style={{ border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', padding: '7px 16px', borderRadius: '99px', fontSize: '13px', cursor: 'pointer', opacity: saving ? 0.6 : 1, fontFamily: 'var(--font-body)' }}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={togglePublish} disabled={publishing} style={{
              background: event.is_published ? 'rgba(239,68,68,0.15)' : 'linear-gradient(135deg, var(--teal), var(--green))',
              color: event.is_published ? '#f87171' : '#0B1628',
              border: event.is_published ? '1px solid rgba(239,68,68,0.3)' : 'none',
              padding: '7px 16px', borderRadius: '99px', fontSize: '13px', cursor: 'pointer',
              fontWeight: '600', opacity: publishing ? 0.6 : 1, fontFamily: 'var(--font-body)',
            }}>
              {publishing ? '...' : event.is_published ? 'Unpublish' : 'Publish'}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', alignItems: 'start' }}>

        {/* Left controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div className="glass" style={{ borderRadius: '16px', padding: '20px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', color: 'var(--text-primary)', fontSize: '14px', marginBottom: '14px' }}>Template</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {TEMPLATES.map(t => (
                <button key={t.id} onClick={() => setTemplate(t.id)} style={{
                  width: '100%', textAlign: 'left', padding: '12px 14px', borderRadius: '10px',
                  border: template === t.id ? `1.5px solid ${t.color}` : '1.5px solid transparent',
                  background: template === t.id ? `${t.color}18` : 'rgba(255,255,255,0.03)',
                  cursor: 'pointer', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: '10px',
                  fontFamily: 'var(--font-body)',
                }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: t.bg, border: `1px solid ${t.color}40`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: t.color, opacity: 0.8 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '13px', marginBottom: '1px' }}>{t.name}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{t.description}</p>
                  </div>
                  {template === t.id && (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={t.color} strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="glass" style={{ borderRadius: '16px', padding: '20px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', color: 'var(--text-primary)', fontSize: '14px', marginBottom: '14px' }}>Customize</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { key: 'headline',    label: 'Headline',  placeholder: event.name },
                { key: 'coupleNames', label: 'Names',     placeholder: 'Ana & João' },
                { key: 'subtitle',    label: 'Subtitle',  placeholder: "We'd love for you to join us" },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: '5px' }}>
                    {field.label}
                  </label>
                  <input
                    value={config[field.key] || ''}
                    onChange={e => setConfig({ ...config, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    className="input-dark"
                    style={{ borderRadius: '8px', padding: '8px 12px', fontSize: '13px' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {event.is_published && (
            <div style={{ background: 'rgba(6,214,160,0.08)', border: '1px solid rgba(6,214,160,0.2)', borderRadius: '12px', padding: '14px' }}>
              <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--green)', marginBottom: '6px', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>Live at</p>
              <a href={publicUrl} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: '12px', color: 'var(--teal)', wordBreak: 'break-all' as const, textDecoration: 'none' }}
                className="hover:opacity-70 transition-opacity">
                {publicUrl}
              </a>
            </div>
          )}
        </div>

        {/* Right: live preview */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', color: 'var(--text-primary)', fontSize: '14px' }}>Preview</h2>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '99px', padding: '3px 10px' }}>
              Live — updates as you type
            </span>
          </div>

          <div style={{ border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', background: 'var(--surface)' }}>
            {/* Fake browser bar */}
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ display: 'flex', gap: '5px' }}>
                {['#ff5f57', '#ffbd2e', '#28c840'].map(c => (
                  <div key={c} style={{ width: '10px', height: '10px', borderRadius: '99px', background: c, opacity: 0.7 }} />
                ))}
              </div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' as const }}>
                {publicUrl}
              </div>
            </div>

            {/* Preview viewport */}
            <div ref={containerRef} style={{ height: '580px', overflow: 'hidden', position: 'relative', background: '#fff' }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: `${INNER_WIDTH}px`,
                transformOrigin: 'top left',
                transform: `scale(${scale})`,
                pointerEvents: 'none',
              }}>
                <PreviewComponent event={previewEvent} />
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}
