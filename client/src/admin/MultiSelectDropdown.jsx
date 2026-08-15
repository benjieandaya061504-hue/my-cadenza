import { useState, useEffect, useRef } from 'react'
import C from './theme.js'

export default function MultiSelectDropdown({
  label,
  options,
  selectedValues,
  onChange,
  getOptionLabel,
  getOptionValue,
  placeholder,
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Click outside to close
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const count = selectedValues.length
  const summary = count > 0
    ? `${count} ${label.toLowerCase()} selected`
    : `Select ${label.toLowerCase()} ▾`

  const allSelected = options.length > 0 && selectedValues.length === options.length

  const handleSelectAll = () => {
    onChange(options.map(o => getOptionValue(o)))
  }

  const handleClearAll = () => {
    onChange([])
  }

  const handleToggle = (val) => {
    onChange(prev =>
      prev.includes(val)
        ? prev.filter(v => v !== val)
        : [...prev, val]
    )
  }

  return (
    <div ref={ref} style={{ position: 'relative', minWidth: 200 }}>
      <label style={{
        display: 'block', fontSize: '0.75rem', fontWeight: 600,
        color: C.text2, marginBottom: 5,
      }}>
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', padding: '8px 12px', borderRadius: 10,
          border: `1.5px solid ${C.border2}`, fontSize: '0.8rem',
          fontFamily: C.font, outline: 'none', background: '#fff',
          cursor: 'pointer', textAlign: 'left', color: count > 0 ? C.navy : C.text3,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <span>{summary}</span>
        <span style={{ fontSize: '0.7rem', color: C.text3, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
          marginTop: 4, background: '#fff', borderRadius: 10,
          border: `1px solid ${C.border}`, boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
          maxHeight: 240, overflow: 'hidden', display: 'flex', flexDirection: 'column',
        }}>
          {/* Select All / Clear All */}
          <div style={{
            display: 'flex', gap: 8, padding: '8px 12px',
            borderBottom: `1px solid ${C.border}`,
          }}>
            <button
              type="button"
              onClick={handleSelectAll}
              disabled={allSelected}
              style={{
                background: 'none', border: 'none', fontSize: '0.72rem',
                color: allSelected ? C.text3 : C.royal, cursor: allSelected ? 'default' : 'pointer',
                fontFamily: C.font, fontWeight: 600, padding: 0,
              }}
            >
              Select All
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              disabled={count === 0}
              style={{
                background: 'none', border: 'none', fontSize: '0.72rem',
                color: count === 0 ? C.text3 : C.coral, cursor: count === 0 ? 'default' : 'pointer',
                fontFamily: C.font, fontWeight: 600, padding: 0,
              }}
            >
              Clear All
            </button>
          </div>

          {/* Checkbox list */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {options.map(opt => {
              const val = getOptionValue(opt)
              const checked = selectedValues.includes(val)
              return (
                <label
                  key={val}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 12px', cursor: 'pointer',
                    fontSize: '0.8rem', color: C.text2,
                    background: checked ? 'rgba(37,99,235,0.06)' : 'transparent',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggle(val)}
                    style={{ accentColor: C.royal }}
                  />
                  {getOptionLabel(opt)}
                </label>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}