// components/dashboard/GuestImport.tsx
// FIX #8: Replaced vulnerable xlsx@0.18.5 (CVE-2023-30533) with exceljs
// Run: npm uninstall xlsx && npm install exceljs
'use client'

import { useRef, useState } from 'react'
import * as ExcelJS from 'exceljs'

type RawRow = Record<string, string>

interface Props {
  eventId: string
  onParsed: (headers: string[], rows: RawRow[]) => void
}

export default function GuestImport({ eventId, onParsed }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleFile(file: File) {
    setError(null)
    setLoading(true)

    try {
      const buffer = await file.arrayBuffer()
      const workbook = new ExcelJS.Workbook()

      if (file.name.endsWith('.csv')) {
        // For CSV: parse manually (exceljs CSV reading is limited)
        const text = new TextDecoder().decode(buffer)
        const lines = text.split(/\r?\n/).filter(l => l.trim())
        if (lines.length < 2) { setError('File is empty'); setLoading(false); return }

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
        const rows = lines.slice(1).map(line => {
          const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
          return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? '']))
        })
        onParsed(headers, rows)
      } else {
        // xlsx / xls
        await workbook.xlsx.load(buffer)
        const sheet = workbook.worksheets[0]
        if (!sheet) { setError('No worksheet found'); setLoading(false); return }

        const rows: string[][] = []
        sheet.eachRow(row => {
          rows.push((row.values as any[]).slice(1).map(v => String(v ?? '')))
        })

        if (rows.length < 2) { setError('File is empty'); setLoading(false); return }

        const headers = rows[0]
        const dataRows = rows.slice(1).map(vals =>
          Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? '']))
        )
        onParsed(headers, dataRows)
      }
    } catch (err) {
      console.error('File parse error:', err)
      setError('Failed to parse file. Make sure it is a valid .xlsx or .csv file.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        style={{ display: 'none' }}
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="btn-ghost"
        style={{ fontSize: '14px' }}
      >
        {loading ? 'Parsing...' : 'Import from Excel / CSV'}
      </button>
      {error && (
        <p style={{ color: '#f87171', fontSize: '13px', marginTop: '8px' }}>{error}</p>
      )}
    </div>
  )
}
