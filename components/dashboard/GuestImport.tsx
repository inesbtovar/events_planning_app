'use client'
// components/dashboard/GuestImport.tsx
import { useState, useRef } from 'react'
import toast from 'react-hot-toast'

type Props = { eventId: string }
type Mode = 'idle' | 'add' | 'sheet' | 'mapping' | 'importing'

type ParsedFile = {
  headers: string[]
  rows: Record<string, string>[]
  fileName: string
  sheetNames: string[]
}

export default function GuestImport({ eventId }: Props) {
  const [mode, setMode]             = useState<Mode>('idle')
  const [saving, setSaving]         = useState(false)
  const fileRef                     = useRef<HTMLInputElement>(null)

  // Raw file kept in memory so we can switch sheets without re-uploading
  const [rawBuffer, setRawBuffer]   = useState<ArrayBuffer | null>(null)
  const [parsed, setParsed]         = useState<ParsedFile | null>(null)
  const [selectedSheet, setSelectedSheet] = useState('')

  // Column mapper state
  const [colName, setColName]       = useState('')
  const [colEmail, setColEmail]     = useState('')
  const [colPhone, setColPhone]     = useState('')
  const [colDietary, setColDietary] = useState('')
  const [colPlusOne, setColPlusOne] = useState('')
  const [importing, setImporting]   = useState(false)

  // Manual add state
  const [name, setName]             = useState('')
  const [email, setEmail]           = useState('')
  const [phone, setPhone]           = useState('')
  const [dietary, setDietary]       = useState('')
  const [plusOne, setPlusOne]       = useState(false)

  function reset() {
    setName(''); setEmail(''); setPhone(''); setDietary(''); setPlusOne(false)
    setParsed(null); setRawBuffer(null); setSelectedSheet('')
    setColName(''); setColEmail(''); setColPhone('')
    setColDietary(''); setColPlusOne('')
    setMode('idle')
    if (fileRef.current) fileRef.current.value = ''
  }

  // Parse a sheet from buffer using ExcelJS
  async function parseSheet(buffer: ArrayBuffer, sheetIndex: number, fileName: string, sheetNames: string[]) {
    const ExcelJS = await import('exceljs')
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)

    const sheet = workbook.worksheets[sheetIndex]
    if (!sheet) {
      toast.error('Could not read that sheet.')
      return
    }

    // Extract headers from first row
    const headers: string[] = []
    sheet.getRow(1).eachCell({ includeEmpty: true }, (cell, colIndex) => {
      headers[colIndex - 1] = cell.value?.toString().trim() ?? ''
    })

    // Extract data rows
    const rows: Record<string, string>[] = []
    sheet.eachRow((row, rowIndex) => {
      if (rowIndex === 1) return
      const obj: Record<string, string> = {}
      row.eachCell({ includeEmpty: true }, (cell, colIndex) => {
        const header = headers[colIndex - 1]
        if (header) {
          const val = cell.value
          if (val === null || val === undefined) {
            obj[header] = ''
          } else if (typeof val === 'object' && 'text' in val) {
            obj[header] = (val as any).text
          } else if (typeof val === 'object' && 'result' in val) {
            obj[header] = String((val as any).result)
          } else {
            obj[header] = String(val)
          }
        }
      })
      if (Object.values(obj).some(v => v !== '')) {
        rows.push(obj)
      }
    })

    if (rows.length === 0) {
      toast.error(`Sheet "${sheetNames[sheetIndex]}" appears to be empty. Please pick another.`)
      return
    }

    // Auto-guess columns
    const norm = (s: string) => s.toLowerCase().replace(/[\s_\-\.]/g, '')
    setColName(headers.find(h => ['name','nome','fullname','nomecompleto','guest','convidado','nomeconvidado'].includes(norm(h))) ?? '')
    setColEmail(headers.find(h => ['email','e-mail','mail','correio'].includes(norm(h))) ?? '')
    setColPhone(headers.find(h => ['phone','tel','telefone','telemovel','mobile','celular','whatsapp'].includes(norm(h))) ?? '')
    setColDietary(headers.find(h => ['dietary','dieta','restricoes','alimentacao','food'].includes(norm(h))) ?? '')
    setColPlusOne(headers.find(h => ['plusone','plus','acompanhante','guest2'].includes(norm(h))) ?? '')

    setParsed({ headers, rows, fileName, sheetNames })
    setSelectedSheet(sheetNames[sheetIndex])
    setMode('mapping')
  }

  // Step 1: read the file, get sheet names, decide what to do
  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const buffer = await file.arrayBuffer()
      setRawBuffer(buffer)

      const ExcelJS = await import('exceljs')
      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.load(buffer)

      const sheetNames = workbook.worksheets.map(ws => ws.name)

      if (sheetNames.length === 0) {
        toast.error('No sheets found in this file.')
        reset()
        return
      }

      if (sheetNames.length === 1) {
        // Only one sheet — go straight to column mapper
        await parseSheet(buffer, 0, file.name, sheetNames)
      } else {
        // Multiple sheets — show picker first
        setParsed({ headers: [], rows: [], fileName: file.name, sheetNames })
        setMode('sheet')
      }
    } catch {
      toast.error('Could not read the file. Make sure it is .xlsx or .xls.')
      reset()
    }
  }

  // Step 2 (only if multiple sheets): user picks a sheet
  async function handleSheetSelect(sheetName: string) {
    if (!rawBuffer || !parsed) return
    const sheetIndex = parsed.sheetNames.indexOf(sheetName)
    await parseSheet(rawBuffer, sheetIndex, parsed.fileName, parsed.sheetNames)
  }

  // Step 3: user confirmed column mappings, send to API
  async function handleImport() {
    if (!parsed || !colName) {
      toast.error('Please select which column contains the guest name.')
      return
    }

    setImporting(true)
    setMode('importing')

    try {
      const guests = parsed.rows
        .map(row => {
          const name = String(row[colName] ?? '').trim()
          if (!name) return null
          const plusRaw = colPlusOne ? String(row[colPlusOne] ?? '').toLowerCase() : ''
          const plusOne = ['yes', 'sim', '1', 'true', 'y', 's'].includes(plusRaw)
          return {
            name,
            email:   colEmail   ? String(row[colEmail]   ?? '').trim() || null : null,
            phone:   colPhone   ? String(row[colPhone]   ?? '').trim() || null : null,
            dietary: colDietary ? String(row[colDietary] ?? '').trim() || null : null,
            plusOne,
          }
        })
        .filter(Boolean)

      if (guests.length === 0) {
        toast.error('No guests found in the selected column. Check your mapping.')
        setMode('mapping')
        setImporting(false)
        return
      }

      const res = await fetch('/api/guests/import-mapped', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, guests }),
      })
      const data = await res.json()
      if (data.error) {
        if (data.upgrade) {
          toast.error(data.error + ' — Upgrade your plan to add more guests.')
        } else {
          throw new Error(data.error)
        }
        setMode('mapping')
        setImporting(false)
        return
      }

      toast.success(`${data.imported} guest${data.imported === 1 ? '' : 's'} imported!`)
      reset()
      window.location.reload()
    } catch (err: any) {
      toast.error(err.message || 'Import failed')
      setMode('mapping')
    } finally {
      setImporting(false)
    }
  }

  // Manual add
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { toast.error('Name is required'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, name, email, phone, dietary, plusOne }),
      })
      const data = await res.json()
      if (data.error) {
        if (data.upgrade) {
          toast.error(data.error + ' — Upgrade your plan to add more guests.')
        } else {
          throw new Error(data.error)
        }
        return
      }
      toast.success(`${name} added!`)
      reset()
      window.location.reload()
    } catch (err: any) {
      toast.error(err.message || 'Failed to add guest')
    } finally {
      setSaving(false)
    }
  }

  // ─── Shared styles ────────────────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    width: '100%', border: '1px solid #EDE8E0', borderRadius: '10px',
    padding: '9px 12px', fontSize: '14px', color: '#2D2016',
    background: '#FDFAF6', outline: 'none', boxSizing: 'border-box',
  }
  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: 'none' as any,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23A08060' stroke-width='2.5' stroke-linecap='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
    paddingRight: '32px', cursor: 'pointer',
  }

  const closeBtn = (onClick: () => void) => (
    <button onClick={onClick} style={{
      background: '#F5F0E8', border: 'none', borderRadius: '99px',
      width: '28px', height: '28px', cursor: 'pointer', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7A6652',
    }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  )

  const Overlay = ({ children }: { children: React.ReactNode }) => (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
    }} onClick={e => { if (e.target === e.currentTarget) reset() }}>
      {children}
    </div>
  )

  // ─── Idle ─────────────────────────────────────────────────────────────────────
  if (mode === 'idle') return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <button onClick={() => setMode('add')} style={{
        background: '#2D2016', color: 'white', border: 'none',
        padding: '8px 16px', borderRadius: '99px', fontSize: '13px',
        fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
      }} className="hover:opacity-80 transition-opacity">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Add guest
      </button>
      <input ref={fileRef} type="file" accept=".xlsx,.xls"
        onChange={handleFile} className="hidden" id="guest-file-input" />
      <label htmlFor="guest-file-input" style={{
        border: '1px solid #EDE8E0', background: 'white', color: '#7A6652',
        padding: '8px 16px', borderRadius: '99px', fontSize: '13px',
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
      }} className="hover:border-stone-400 transition-colors">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        Import Excel
      </label>
    </div>
  )

  // ─── Importing spinner ────────────────────────────────────────────────────────
  if (mode === 'importing') return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#A08060', fontSize: '13px' }}>
      <div style={{ width: '16px', height: '16px', border: '2px solid #EDE8E0', borderTopColor: '#C47A3A', borderRadius: '99px' }}
        className="animate-spin" />
      Importing guests...
    </div>
  )

  // ─── Sheet picker ─────────────────────────────────────────────────────────────
  if (mode === 'sheet' && parsed) return (
    <Overlay>
      <div style={{
        background: 'white', borderRadius: '24px', width: '100%', maxWidth: '400px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.15)', overflow: 'hidden',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: '600', color: '#2D2016', fontSize: '16px' }}>Pick a sheet</h3>
            <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#A08060' }}>
              {parsed.fileName} · {parsed.sheetNames.length} sheets found
            </p>
          </div>
          {closeBtn(reset)}
        </div>
        <div style={{ padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#7A6652' }}>
            Which sheet has your guest list?
          </p>
          {parsed.sheetNames.map(name => (
            <button key={name} onClick={() => handleSheetSelect(name)} style={{
              textAlign: 'left', padding: '12px 16px', borderRadius: '12px',
              border: '1px solid #EDE8E0', background: 'white', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontSize: '14px', color: '#2D2016', fontWeight: '500',
              transition: 'all 0.15s',
            }} className="hover:border-stone-400 hover:bg-stone-50 transition-all">
              <span>{name}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A08060" strokeWidth="2" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          ))}
        </div>
      </div>
    </Overlay>
  )

  // ─── Column mapper ────────────────────────────────────────────────────────────
  if (mode === 'mapping' && parsed) return (
    <Overlay>
      <div style={{
        background: 'white', borderRadius: '24px', width: '100%', maxWidth: '480px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.15)', overflow: 'hidden',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid #F5F0E8',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, background: 'white', zIndex: 1,
        }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: '600', color: '#2D2016', fontSize: '16px' }}>Match your columns</h3>
            <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#A08060' }}>
              {parsed.fileName}
              {selectedSheet ? ` · ${selectedSheet}` : ''}
              {' · '}{parsed.rows.length} rows
              {parsed.sheetNames.length > 1 && (
                <button onClick={() => setMode('sheet')} style={{
                  marginLeft: '8px', background: 'none', border: 'none',
                  color: '#C47A3A', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline',
                }}>
                  change sheet
                </button>
              )}
            </p>
          </div>
          {closeBtn(reset)}
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#7A6652', lineHeight: '1.5' }}>
            We found <strong>{parsed.headers.length} columns</strong>. Tell us which one is which:
          </p>

          {/* Name — required */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: '#2D2016', marginBottom: '5px' }}>
              Guest name
              <span style={{ background: '#FDF0E6', color: '#C47A3A', fontSize: '10px', padding: '1px 7px', borderRadius: '99px' }}>required</span>
            </label>
            <select value={colName} onChange={e => setColName(e.target.value)} style={selectStyle}>
              <option value="">— select column —</option>
              {parsed.headers.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
            {colName && (
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#A08060' }}>
                Preview: {parsed.rows.slice(0,3).map(r => r[colName]).filter(Boolean).join(', ')}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#2D2016', marginBottom: '5px' }}>
              Email <span style={{ fontWeight: '400', color: '#A08060' }}>(optional)</span>
            </label>
            <select value={colEmail} onChange={e => setColEmail(e.target.value)} style={selectStyle}>
              <option value="">— not in my file —</option>
              {parsed.headers.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>

          {/* Phone */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#2D2016', marginBottom: '5px' }}>
              Phone / WhatsApp <span style={{ fontWeight: '400', color: '#A08060' }}>(optional)</span>
            </label>
            <select value={colPhone} onChange={e => setColPhone(e.target.value)} style={selectStyle}>
              <option value="">— not in my file —</option>
              {parsed.headers.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>

          {/* Dietary */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#2D2016', marginBottom: '5px' }}>
              Dietary restrictions <span style={{ fontWeight: '400', color: '#A08060' }}>(optional)</span>
            </label>
            <select value={colDietary} onChange={e => setColDietary(e.target.value)} style={selectStyle}>
              <option value="">— not in my file —</option>
              {parsed.headers.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>

          {/* Plus one */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#2D2016', marginBottom: '5px' }}>
              Plus one <span style={{ fontWeight: '400', color: '#A08060' }}>(optional — yes/no column)</span>
            </label>
            <select value={colPlusOne} onChange={e => setColPlusOne(e.target.value)} style={selectStyle}>
              <option value="">— not in my file —</option>
              {parsed.headers.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
            <button onClick={reset} style={{
              flex: 1, background: '#F5F0E8', color: '#7A6652', border: 'none',
              padding: '11px', borderRadius: '99px', fontSize: '14px', cursor: 'pointer',
            }}>Cancel</button>
            <button onClick={handleImport} disabled={!colName} style={{
              flex: 2, background: colName ? '#2D2016' : '#C8B8A2', color: 'white',
              border: 'none', padding: '11px', borderRadius: '99px',
              fontSize: '14px', fontWeight: '500', cursor: colName ? 'pointer' : 'not-allowed',
            }} className="transition-opacity hover:opacity-80">
              Import {parsed.rows.length} guests
            </button>
          </div>
        </div>
      </div>
    </Overlay>
  )

  // ─── Add guest manually ───────────────────────────────────────────────────────
  if (mode === 'add') return (
    <Overlay>
      <div style={{
        background: 'white', borderRadius: '24px', width: '100%', maxWidth: '440px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.15)', overflow: 'hidden',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontWeight: '600', color: '#2D2016', fontSize: '16px' }}>Add guest</h3>
          {closeBtn(reset)}
        </div>

        <form onSubmit={handleAdd} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#7A6652', marginBottom: '5px' }}>
              Full name <span style={{ color: '#C47A3A' }}>*</span>
            </label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="Maria Silva" required autoFocus style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#C47A3A'}
              onBlur={e => e.target.style.borderColor = '#EDE8E0'} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#7A6652', marginBottom: '5px' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="maria@email.com" style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#C47A3A'}
                onBlur={e => e.target.style.borderColor = '#EDE8E0'} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#7A6652', marginBottom: '5px' }}>Phone</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="912 345 678" style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#C47A3A'}
                onBlur={e => e.target.style.borderColor = '#EDE8E0'} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#7A6652', marginBottom: '5px' }}>Dietary restrictions</label>
            <input value={dietary} onChange={e => setDietary(e.target.value)}
              placeholder="e.g. vegetarian, gluten-free..." style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#C47A3A'}
              onBlur={e => e.target.style.borderColor = '#EDE8E0'} />
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: '#FDFAF6', border: '1px solid #EDE8E0', borderRadius: '10px', padding: '10px 14px',
          }}>
            <div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: '#2D2016' }}>Plus one</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#A08060' }}>Guest may bring a companion</p>
            </div>
            <button type="button" onClick={() => setPlusOne(!plusOne)} style={{
              width: '40px', height: '22px', borderRadius: '99px', border: 'none',
              background: plusOne ? '#2D2016' : '#D0C4B4',
              cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
            }}>
              <div style={{
                position: 'absolute', top: '2px', left: plusOne ? '20px' : '2px',
                width: '18px', height: '18px', background: 'white', borderRadius: '99px',
                transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
            <button type="button" onClick={reset} style={{
              flex: 1, background: '#F5F0E8', color: '#7A6652', border: 'none',
              padding: '11px', borderRadius: '99px', fontSize: '14px', cursor: 'pointer',
            }}>Cancel</button>
            <button type="submit" disabled={saving} style={{
              flex: 2, background: '#2D2016', color: 'white', border: 'none',
              padding: '11px', borderRadius: '99px', fontSize: '14px', fontWeight: '500', cursor: 'pointer',
            }} className="hover:opacity-80 disabled:opacity-50 transition-opacity">
              {saving ? 'Adding...' : 'Add guest'}
            </button>
          </div>
        </form>
      </div>
    </Overlay>
  )

  return null
}
