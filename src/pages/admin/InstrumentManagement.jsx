import { useMemo, useState } from 'react'

const C = {
  bg: '#0e0f13',
  bg2: '#13141a',
  bg3: '#1a1c24',
  bg4: '#1f2130',
  border: 'rgba(255,255,255,0.07)',
  border2: 'rgba(255,255,255,0.12)',
  text: '#f0eff4',
  text2: '#9b99a8',
  text3: '#5a5870',
  accent: '#7c6af7',
  accentL: '#a99cf9',
  accentD: '#5548d9',
  teal: '#2dd4bf',
  coral: '#f87171',
  gold: '#fbbf24',
  green: '#34d399',
  pink: '#f472b6',
  font: "'Outfit', sans-serif",
  display: "'Syne', sans-serif",
  mono: "'Space Mono', monospace",
}

const INSTRUMENT_TYPES = ['Guitar', 'Piano', 'Violin', 'Drums', 'Voice', 'Ukulele', 'Bass', 'Saxophone', 'Cello', 'Other']
const RENTAL_DURATIONS = ['Per hour', 'Per day', 'Per week', 'Per month']
const PACKAGE_CATEGORIES = ['Lesson package add-on', 'Studio session bundle', 'Long-term rental']

const initialInstruments = () => [
  { id: 'i1', name: 'Yamaha F310', brand: 'Yamaha', type: 'Guitar', serial: 'YF310-001', description: 'Acoustic guitar for beginner lessons', baseRate: 250, quantityTotal: 6, quantityAvailable: 5 },
  { id: 'i2', name: 'Casio CT-X800', brand: 'Casio', type: 'Piano', serial: 'CTX800-014', description: '61-key keyboard used in group lessons', baseRate: 320, quantityTotal: 4, quantityAvailable: 3 },
  { id: 'i3', name: 'Yamaha Stage Custom', brand: 'Yamaha', type: 'Drums', serial: '', description: 'Studio drum kit for bands and sessions', baseRate: 600, quantityTotal: 2, quantityAvailable: 1 },
]

const initialPricingRules = () => [
  { id: 'pr1', basis: 'type', instrumentType: 'Guitar', rentalDuration: 'Per day', packageCategory: '', rate: 450 },
  { id: 'pr2', basis: 'duration', instrumentType: '', rentalDuration: 'Per week', packageCategory: 'Long-term rental', rate: 2200 },
  { id: 'pr3', basis: 'package', instrumentType: 'Piano', rentalDuration: 'Per hour', packageCategory: 'Studio session bundle', rate: 380 },
]

let nextInstrumentId = 4
let nextPricingRuleId = 4

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
  @keyframes imFadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .im-row { transition: background 0.15s ease; }
  .im-row:hover { background: rgba(255,255,255,0.03) !important; }
  .im-pill { transition: all 0.18s ease; }
  .im-pill:hover { background: rgba(124,106,247,0.18) !important; color: #a99cf9 !important; }
`

function inputStyle(focused) {
  return {
    width: '100%',
    background: C.bg4,
    border: `1px solid ${focused ? 'rgba(124,106,247,0.45)' : C.border}`,
    borderRadius: '10px',
    padding: '10px 12px',
    color: C.text,
    fontFamily: C.font,
    fontSize: '13px',
    outline: 'none',
    boxShadow: focused ? '0 0 0 3px rgba(124,106,247,0.12)' : 'none',
  }
}

function fieldLabel(text) {
  return (
    <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px', fontFamily: C.font }}>
      {text}
    </label>
  )
}

function InstrumentFormModal({ mode, initial, onClose, onSave }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [brand, setBrand] = useState(initial?.brand ?? '')
  const [type, setType] = useState(initial?.type ?? INSTRUMENT_TYPES[0])
  const [serial, setSerial] = useState(initial?.serial ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [baseRate, setBaseRate] = useState(initial?.baseRate ?? 0)
  const [quantityTotal, setQuantityTotal] = useState(initial?.quantityTotal ?? 1)
  const [quantityAvailable, setQuantityAvailable] = useState(initial?.quantityAvailable ?? 1)
  const [focus, setFocus] = useState(null)

  const submit = e => {
    e.preventDefault()
    if (!name.trim()) return
    if (!brand.trim()) return
    const total = Math.max(0, Number(quantityTotal) || 0)
    const availableRaw = Math.max(0, Number(quantityAvailable) || 0)
    const available = Math.min(availableRaw, total)
    const payload = {
      id: initial?.id ?? `i${nextInstrumentId++}`,
      name: name.trim(),
      brand: brand.trim(),
      type,
      serial: serial.trim(),
      description: description.trim(),
      baseRate: Math.max(0, Number(baseRate) || 0),
      quantityTotal: total,
      quantityAvailable: available,
    }
    onSave(payload)
    onClose()
  }

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', animation: 'imFadeUp 0.25s ease both' }}
    >
      <div
        role="dialog"
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', background: C.bg3, border: `1px solid ${C.border2}`, borderRadius: '16px', padding: '22px', boxShadow: '0 24px 48px rgba(0,0,0,0.45)' }}
      >
        <div style={{ fontFamily: C.display, fontSize: '18px', fontWeight: 700, color: C.text, marginBottom: '6px' }}>
          {mode === 'add' ? 'Create instrument record' : 'Update instrument record'}
        </div>
        <p style={{ fontSize: '12px', color: C.text3, marginBottom: '16px', lineHeight: 1.5 }}>
          Record instrument details, base rental rate, and current quantity so that lessons, studio sessions, and rentals stay in sync.
        </p>
        <form onSubmit={submit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '12px' }}>
              <div>
                {fieldLabel('Instrument name')}
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  style={inputStyle(focus === 'n')}
                  onFocus={() => setFocus('n')}
                  onBlur={() => setFocus(null)}
                />
              </div>
              <div>
                {fieldLabel('Brand')}
                <input
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  required
                  style={inputStyle(focus === 'b')}
                  onFocus={() => setFocus('b')}
                  onBlur={() => setFocus(null)}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                {fieldLabel('Category / type')}
                <select
                  value={type}
                  onChange={e => setType(e.target.value)}
                  style={{ ...inputStyle(focus === 't'), cursor: 'pointer' }}
                  onFocus={() => setFocus('t')}
                  onBlur={() => setFocus(null)}
                >
                  {INSTRUMENT_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                {fieldLabel('Serial number (optional)')}
                <input
                  value={serial}
                  onChange={e => setSerial(e.target.value)}
                  style={inputStyle(focus === 's')}
                  onFocus={() => setFocus('s')}
                  onBlur={() => setFocus(null)}
                />
              </div>
            </div>
            <div>
              {fieldLabel('Description')}
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                style={{ ...inputStyle(focus === 'd'), resize: 'vertical', minHeight: '72px' }}
                onFocus={() => setFocus('d')}
                onBlur={() => setFocus(null)}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                {fieldLabel('Base rental rate (₱)')}
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={baseRate}
                  onChange={e => setBaseRate(e.target.value)}
                  style={inputStyle(focus === 'r')}
                  onFocus={() => setFocus('r')}
                  onBlur={() => setFocus(null)}
                />
              </div>
              <div>
                {fieldLabel('Total quantity')}
                <input
                  type="number"
                  min={0}
                  value={quantityTotal}
                  onChange={e => setQuantityTotal(e.target.value)}
                  style={inputStyle(focus === 'qt')}
                  onFocus={() => setFocus('qt')}
                  onBlur={() => setFocus(null)}
                />
              </div>
              <div>
                {fieldLabel('Available now')}
                <input
                  type="number"
                  min={0}
                  value={quantityAvailable}
                  onChange={e => setQuantityAvailable(e.target.value)}
                  style={inputStyle(focus === 'qa')}
                  onFocus={() => setFocus('qa')}
                  onBlur={() => setFocus(null)}
                />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              className="im-pill"
              style={{ padding: '9px 16px', borderRadius: '10px', border: `1px solid ${C.border}`, background: 'transparent', color: C.text2, cursor: 'pointer', fontFamily: C.font, fontSize: '13px', fontWeight: 500 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ padding: '9px 18px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${C.accent}, ${C.accentD})`, color: '#fff', cursor: 'pointer', fontFamily: C.font, fontSize: '13px', fontWeight: 600 }}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function PricingRuleModal({ mode, initial, onClose, onSave }) {
  const [basis, setBasis] = useState(initial?.basis ?? 'type')
  const [instrumentType, setInstrumentType] = useState(initial?.instrumentType ?? '')
  const [rentalDuration, setRentalDuration] = useState(initial?.rentalDuration ?? RENTAL_DURATIONS[0])
  const [packageCategory, setPackageCategory] = useState(initial?.packageCategory ?? '')
  const [rate, setRate] = useState(initial?.rate ?? 0)
  const [focus, setFocus] = useState(null)

  const submit = e => {
    e.preventDefault()
    if (!rate && rate !== 0) return
    const payload = {
      id: initial?.id ?? `pr${nextPricingRuleId++}`,
      basis,
      instrumentType: basis === 'type' || basis === 'package' ? (instrumentType || INSTRUMENT_TYPES[0]) : '',
      rentalDuration: rentalDuration || RENTAL_DURATIONS[0],
      packageCategory: basis === 'package' || basis === 'duration' ? (packageCategory || PACKAGE_CATEGORIES[0]) : '',
      rate: Math.max(0, Number(rate) || 0),
    }
    onSave(payload)
    onClose()
  }

  const showInstrumentType = basis === 'type' || basis === 'package'
  const showPackageCategory = basis === 'package' || basis === 'duration'

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', animation: 'imFadeUp 0.25s ease both' }}
    >
      <div
        role="dialog"
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: '460px', background: C.bg3, border: `1px solid ${C.border2}`, borderRadius: '16px', padding: '22px', boxShadow: '0 24px 48px rgba(0,0,0,0.45)' }}
      >
        <div style={{ fontFamily: C.display, fontSize: '18px', fontWeight: 700, color: C.text, marginBottom: '6px' }}>
          {mode === 'add' ? 'Define instrument pricing' : 'Update instrument pricing'}
        </div>
        <p style={{ fontSize: '12px', color: C.text3, marginBottom: '16px', lineHeight: 1.5 }}>
          Pricing can be based on instrument type, rental duration, or package category. These rules stack on top of the base rental rate.
        </p>
        <form onSubmit={submit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              {fieldLabel('Pricing basis')}
              <select
                value={basis}
                onChange={e => setBasis(e.target.value)}
                style={{ ...inputStyle(focus === 'bs'), cursor: 'pointer' }}
                onFocus={() => setFocus('bs')}
                onBlur={() => setFocus(null)}
              >
                <option value="type">Instrument type</option>
                <option value="duration">Rental duration</option>
                <option value="package">Package category</option>
              </select>
            </div>
            {showInstrumentType && (
              <div>
                {fieldLabel('Instrument type')}
                <select
                  value={instrumentType || INSTRUMENT_TYPES[0]}
                  onChange={e => setInstrumentType(e.target.value)}
                  style={{ ...inputStyle(focus === 'it'), cursor: 'pointer' }}
                  onFocus={() => setFocus('it')}
                  onBlur={() => setFocus(null)}
                >
                  {INSTRUMENT_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              {fieldLabel('Rental duration')}
              <select
                value={rentalDuration}
                onChange={e => setRentalDuration(e.target.value)}
                style={{ ...inputStyle(focus === 'rd'), cursor: 'pointer' }}
                onFocus={() => setFocus('rd')}
                onBlur={() => setFocus(null)}
              >
                {RENTAL_DURATIONS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            {showPackageCategory && (
              <div>
                {fieldLabel('Package category')}
                <select
                  value={packageCategory || PACKAGE_CATEGORIES[0]}
                  onChange={e => setPackageCategory(e.target.value)}
                  style={{ ...inputStyle(focus === 'pc'), cursor: 'pointer' }}
                  onFocus={() => setFocus('pc')}
                  onBlur={() => setFocus(null)}
                >
                  {PACKAGE_CATEGORIES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              {fieldLabel('Rate (₱)')}
              <input
                type="number"
                min={0}
                step={1}
                value={rate}
                onChange={e => setRate(e.target.value)}
                style={inputStyle(focus === 'rt')}
                onFocus={() => setFocus('rt')}
                onBlur={() => setFocus(null)}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              className="im-pill"
              style={{ padding: '9px 16px', borderRadius: '10px', border: `1px solid ${C.border}`, background: 'transparent', color: C.text2, cursor: 'pointer', fontFamily: C.font, fontSize: '13px', fontWeight: 500 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ padding: '9px 18px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${C.accent}, ${C.accentD})`, color: '#fff', cursor: 'pointer', fontFamily: C.font, fontSize: '13px', fontWeight: 600 }}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function InstrumentManagement({ isMobile = false, isTablet = false }) {
  const [tab, setTab] = useState('inventory')
  const [instruments, setInstruments] = useState(initialInstruments)
  const [pricingRules, setPricingRules] = useState(initialPricingRules)

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const [instrumentModal, setInstrumentModal] = useState(null)
  const [pricingModal, setPricingModal] = useState(null)
  const [deleteInstrumentId, setDeleteInstrumentId] = useState(null)
  const [deletePricingId, setDeletePricingId] = useState(null)

  const fmt = n => `₱${Number(n).toLocaleString()}`

  const filteredInstruments = useMemo(() => {
    const q = search.trim().toLowerCase()
    return instruments.filter(i => {
      if (typeFilter !== 'all' && i.type !== typeFilter) return false
      if (!q) return true
      return (
        i.name.toLowerCase().includes(q) ||
        i.brand.toLowerCase().includes(q) ||
        i.type.toLowerCase().includes(q) ||
        i.serial.toLowerCase().includes(q)
      )
    })
  }, [instruments, search, typeFilter])

  const typeOptions = useMemo(() => {
    const s = new Set()
    instruments.forEach(i => s.add(i.type))
    return ['all', ...Array.from(s).sort()]
  }, [instruments])

  const stats = useMemo(() => {
    const totalRecords = instruments.length
    const totalQty = instruments.reduce((sum, i) => sum + i.quantityTotal, 0)
    const available = instruments.reduce((sum, i) => sum + i.quantityAvailable, 0)
    const inUse = totalQty - available
    return { totalRecords, totalQty, available, inUse }
  }, [instruments])

  const addInstrument = row => setInstruments(prev => [...prev, row])
  const updateInstrument = row => setInstruments(prev => prev.map(i => (i.id === row.id ? row : i)))
  const removeInstrument = id => setInstruments(prev => prev.filter(i => i.id !== id))

  const adjustQuantity = (id, delta) => {
    setInstruments(prev =>
      prev.map(i => {
        if (i.id !== id) return i
        const nextTotal = Math.max(0, i.quantityTotal + delta)
        const nextAvailable = Math.max(0, Math.min(nextTotal, i.quantityAvailable + delta))
        return { ...i, quantityTotal: nextTotal, quantityAvailable: nextAvailable }
      }),
    )
  }

  const addPricingRule = row => setPricingRules(prev => [...prev, row])
  const updatePricingRule = row => setPricingRules(prev => prev.map(r => (r.id === row.id ? row : r)))
  const removePricingRule = id => setPricingRules(prev => prev.filter(r => r.id !== id))

  const selectBase = {
    background: C.bg4,
    border: `1px solid ${C.border}`,
    borderRadius: '10px',
    padding: '8px 10px',
    color: C.text,
    fontFamily: C.font,
    fontSize: '13px',
    cursor: 'pointer',
    outline: 'none',
  }

  const tabBtn = (id, label) => {
    const on = tab === id
    return (
      <button
        type="button"
        onClick={() => setTab(id)}
        style={{
          padding: '8px 16px',
          borderRadius: '10px',
          border: on ? `1px solid rgba(124,106,247,0.4)` : `1px solid ${C.border}`,
          background: on ? 'rgba(124,106,247,0.14)' : 'transparent',
          color: on ? C.accentL : C.text2,
          cursor: 'pointer',
          fontFamily: C.font,
          fontSize: '13px',
          fontWeight: on ? 600 : 500,
        }}
      >
        {label}
      </button>
    )
  }

  return (
    <>
      <style>{css}</style>
      <div style={{ animation: 'imFadeUp 0.4s ease both', fontFamily: C.font }}>
        <div style={{ marginBottom: '18px' }}>
          <h1 style={{ fontFamily: C.display, fontSize: isMobile ? '22px' : '26px', fontWeight: 800, color: C.text, letterSpacing: '-0.02em' }}>
            Instrument management
          </h1>
          <p style={{ marginTop: '4px', fontSize: '13px', color: C.text3 }}>
            Record instruments, manage rental-ready quantities, and keep pricing rules organized for lessons, studios, and rentals.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          {tabBtn('inventory', 'Instrument records')}
          {tabBtn('pricing', 'Pricing rules')}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
          {[
            { label: 'Instrument records', value: stats.totalRecords },
            { label: 'Total quantity', value: stats.totalQty },
            { label: 'Available', value: stats.available },
            { label: 'In use', value: stats.inUse },
          ].map((s, i) => (
            <div
              key={s.label}
              style={{
                background: C.bg3,
                border: `1px solid ${C.border}`,
                borderRadius: '12px',
                padding: '12px 14px',
                animation: `imFadeUp 0.35s ease ${i * 0.04}s both`,
              }}
            >
              <div style={{ fontSize: '9px', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em' }}>{s.label}</div>
              <div style={{ fontFamily: C.display, fontSize: '22px', fontWeight: 700, color: C.text, marginTop: '2px' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {tab === 'inventory' && (
          <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: isMobile ? '14px' : '18px 20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: isMobile ? 'stretch' : 'center', marginBottom: '14px' }}>
              <div style={{ flex: isMobile ? '1 1 100%' : '1 1 240px', minWidth: 0, position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: C.text3, fontSize: '14px' }}>⌕</span>
                <input
                  type="search"
                  placeholder="Search by name, brand, type, or serial…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    width: '100%',
                    background: C.bg4,
                    border: `1px solid ${C.border}`,
                    borderRadius: '10px',
                    padding: '9px 12px 9px 34px',
                    color: C.text,
                    fontFamily: C.font,
                    fontSize: '13px',
                    outline: 'none',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'rgba(124,106,247,0.45)'
                    e.target.style.boxShadow = '0 0 0 3px rgba(124,106,247,0.1)'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = C.border
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600 }}>Type</span>
                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  style={{ ...selectBase, minWidth: '140px' }}
                >
                  {typeOptions.map(t => (
                    <option key={t} value={t}>
                      {t === 'all' ? 'All types' : t}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => setInstrumentModal({ type: 'add' })}
                style={{
                  marginLeft: isMobile ? 0 : 'auto',
                  width: isMobile ? '100%' : 'auto',
                  padding: '9px 18px',
                  borderRadius: '10px',
                  border: 'none',
                  background: `linear-gradient(135deg, ${C.accent}, ${C.accentD})`,
                  color: '#fff',
                  cursor: 'pointer',
                  fontFamily: C.font,
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                + New instrument
              </button>
            </div>

            <div style={{ fontSize: '11px', color: C.text3, marginBottom: '10px' }}>
              Showing <strong style={{ color: C.text2 }}>{filteredInstruments.length}</strong> of {instruments.length} records
            </div>

            <div style={{ overflowX: 'auto', borderRadius: '12px', border: `1px solid ${C.border}` }}>
              <table style={{ width: '100%', minWidth: isTablet ? '760px' : '880px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: C.bg4 }}>
                    {['Instrument', 'Brand / Type', 'Serial', 'Qty', 'Base rate', ''].map(h => (
                      <th
                        key={h || 'act'}
                        style={{
                          textAlign: h === '' ? 'right' : 'left',
                          padding: '10px 12px',
                          fontSize: '10px',
                          fontWeight: 600,
                          color: C.text3,
                          textTransform: 'uppercase',
                          letterSpacing: '.1em',
                          borderBottom: `1px solid ${C.border}`,
                        }}
                      >
                        {h || ' '}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredInstruments.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '36px 16px', textAlign: 'center', color: C.text3, fontSize: '13px' }}>
                        No instrument records match your filters. Try clearing search or create a new instrument.
                      </td>
                    </tr>
                  ) : (
                    filteredInstruments.map((i, idx) => {
                      const inUse = Math.max(0, i.quantityTotal - i.quantityAvailable)
                      return (
                        <tr key={i.id} className="im-row" style={{ borderBottom: idx < filteredInstruments.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                          <td style={{ padding: '12px', verticalAlign: 'top' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: C.text }}>{i.name}</div>
                            <div style={{ fontSize: '11px', color: C.text3, fontFamily: C.mono, marginTop: '3px' }}>{i.id}</div>
                            {i.description && (
                              <div style={{ fontSize: '11px', color: C.text2, marginTop: '6px', maxWidth: '340px', lineHeight: 1.4 }}>
                                {i.description}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '12px', fontSize: '12px', color: C.text2, verticalAlign: 'middle' }}>
                            <div>{i.brand}</div>
                            <div style={{ marginTop: '4px', fontSize: '11px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                              {i.type}
                            </div>
                          </td>
                          <td style={{ padding: '12px', fontSize: '12px', color: i.serial ? C.text2 : C.text3, verticalAlign: 'middle', fontFamily: C.mono }}>
                            {i.serial || '—'}
                          </td>
                          <td style={{ padding: '12px', fontSize: '12px', color: C.text2, verticalAlign: 'middle' }}>
                            <div style={{ fontFamily: C.mono }}>
                              Total: {i.quantityTotal}
                            </div>
                            <div style={{ fontFamily: C.mono, color: C.green }}>
                              Available: {i.quantityAvailable}
                            </div>
                            <div style={{ fontFamily: C.mono, color: inUse > 0 ? C.gold : C.text3 }}>
                              In use: {inUse}
                            </div>
                            <div style={{ marginTop: '6px', display: 'flex', gap: '6px' }}>
                              <button
                                type="button"
                                className="im-pill"
                                onClick={() => adjustQuantity(i.id, 1)}
                                style={{
                                  padding: '3px 7px',
                                  borderRadius: '8px',
                                  border: `1px solid ${C.border}`,
                                  background: C.bg4,
                                  color: C.text2,
                                  cursor: 'pointer',
                                  fontSize: '11px',
                                  fontFamily: C.mono,
                                }}
                              >
                                +1
                              </button>
                              <button
                                type="button"
                                className="im-pill"
                                onClick={() => adjustQuantity(i.id, -1)}
                                disabled={i.quantityTotal === 0}
                                style={{
                                  padding: '3px 7px',
                                  borderRadius: '8px',
                                  border: `1px solid ${C.border}`,
                                  background: i.quantityTotal === 0 ? C.bg4 : 'rgba(248,113,113,0.08)',
                                  color: i.quantityTotal === 0 ? C.text3 : C.coral,
                                  cursor: i.quantityTotal === 0 ? 'not-allowed' : 'pointer',
                                  fontSize: '11px',
                                  fontFamily: C.mono,
                                }}
                              >
                                -1
                              </button>
                            </div>
                          </td>
                          <td style={{ padding: '12px', fontFamily: C.mono, fontSize: '13px', color: C.text, verticalAlign: 'middle' }}>
                            {fmt(i.baseRate)}
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                            <button
                              type="button"
                              className="im-pill"
                              onClick={() => setInstrumentModal({ type: 'edit', row: i })}
                              style={{ marginRight: '6px', padding: '6px 11px', borderRadius: '8px', border: `1px solid ${C.border}`, background: C.bg4, color: C.text2, cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteInstrumentId(i.id)}
                              style={{ padding: '6px 11px', borderRadius: '8px', border: `1px solid rgba(248,113,113,0.35)`, background: 'rgba(248,113,113,0.08)', color: C.coral, cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'pricing' && (
          <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: isMobile ? '14px' : '18px 20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: isMobile ? 'stretch' : 'center', marginBottom: '14px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: C.display, fontSize: '15px', fontWeight: 700, color: C.text }}>
                  Instrument pricing rules
                </div>
                <div style={{ fontSize: '12px', color: C.text3, marginTop: '2px' }}>
                  Define overrides based on instrument type, rental duration, or package category.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPricingModal({ type: 'add' })}
                style={{
                  marginLeft: isMobile ? 0 : 'auto',
                  padding: '9px 18px',
                  borderRadius: '10px',
                  border: 'none',
                  background: `linear-gradient(135deg, ${C.accent}, ${C.accentD})`,
                  color: '#fff',
                  cursor: 'pointer',
                  fontFamily: C.font,
                  fontSize: '13px',
                  fontWeight: 600,
                  width: isMobile ? '100%' : 'auto',
                }}
              >
                + Pricing rule
              </button>
            </div>

            <div style={{ fontSize: '11px', color: C.text3, marginBottom: '10px' }}>
              {pricingRules.length} pricing rules
            </div>

            <div style={{ overflowX: 'auto', borderRadius: '12px', border: `1px solid ${C.border}` }}>
              <table style={{ width: '100%', minWidth: isTablet ? '640px' : '760px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: C.bg4 }}>
                    {['Basis', 'Instrument type', 'Rental duration', 'Package category', 'Rate', ''].map(h => (
                      <th
                        key={h || 'pr'}
                        style={{
                          textAlign: h === '' ? 'right' : 'left',
                          padding: '10px 12px',
                          fontSize: '10px',
                          fontWeight: 600,
                          color: C.text3,
                          textTransform: 'uppercase',
                          letterSpacing: '.1em',
                          borderBottom: `1px solid ${C.border}`,
                        }}
                      >
                        {h || ' '}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pricingRules.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '36px 16px', textAlign: 'center', color: C.text3, fontSize: '13px' }}>
                        No pricing rules defined yet. Add rules to reflect different durations or package categories.
                      </td>
                    </tr>
                  ) : (
                    pricingRules.map((r, i) => (
                      <tr key={r.id} className="im-row" style={{ borderBottom: i < pricingRules.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                        <td style={{ padding: '11px 12px', fontSize: '12px', color: C.text2 }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '3px 9px',
                              borderRadius: '20px',
                              background:
                                r.basis === 'type'
                                  ? 'rgba(124,106,247,0.15)'
                                  : r.basis === 'duration'
                                  ? 'rgba(45,212,191,0.12)'
                                  : 'rgba(251,191,36,0.12)',
                              color:
                                r.basis === 'type' ? C.accentL : r.basis === 'duration' ? C.teal : C.gold,
                            }}
                          >
                            {r.basis === 'type' ? 'Type' : r.basis === 'duration' ? 'Duration' : 'Package'}
                          </span>
                        </td>
                        <td style={{ padding: '11px 12px', fontSize: '12px', color: C.text2 }}>
                          {r.instrumentType || '—'}
                        </td>
                        <td style={{ padding: '11px 12px', fontSize: '12px', color: C.text2 }}>
                          {r.rentalDuration}
                        </td>
                        <td style={{ padding: '11px 12px', fontSize: '12px', color: C.text2 }}>
                          {r.packageCategory || '—'}
                        </td>
                        <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '13px', color: C.text }}>
                          {fmt(r.rate)}
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <button
                            type="button"
                            className="im-pill"
                            onClick={() => setPricingModal({ type: 'edit', row: r })}
                            style={{ marginRight: '6px', padding: '6px 11px', borderRadius: '8px', border: `1px solid ${C.border}`, background: C.bg4, color: C.text2, cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletePricingId(r.id)}
                            style={{ padding: '6px 11px', borderRadius: '8px', border: `1px solid rgba(248,113,113,0.35)`, background: 'rgba(248,113,113,0.08)', color: C.coral, cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {instrumentModal?.type === 'add' && (
        <InstrumentFormModal mode="add" onClose={() => setInstrumentModal(null)} onSave={addInstrument} />
      )}
      {instrumentModal?.type === 'edit' && instrumentModal.row && (
        <InstrumentFormModal
          mode="edit"
          initial={instrumentModal.row}
          onClose={() => setInstrumentModal(null)}
          onSave={updateInstrument}
        />
      )}

      {pricingModal?.type === 'add' && (
        <PricingRuleModal mode="add" onClose={() => setPricingModal(null)} onSave={addPricingRule} />
      )}
      {pricingModal?.type === 'edit' && pricingModal.row && (
        <PricingRuleModal
          mode="edit"
          initial={pricingModal.row}
          onClose={() => setPricingModal(null)}
          onSave={updatePricingRule}
        />
      )}

      {deleteInstrumentId && (
        <div
          role="presentation"
          onClick={() => setDeleteInstrumentId(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: C.bg3, border: `1px solid ${C.border2}`, borderRadius: '16px', padding: '22px', maxWidth: '380px' }}
            role="dialog"
          >
            <div style={{ fontFamily: C.display, fontSize: '17px', fontWeight: 700, color: C.text, marginBottom: '8px' }}>
              Remove instrument record?
            </div>
            <p style={{ fontSize: '13px', color: C.text2, lineHeight: 1.5, marginBottom: '18px' }}>
              This will delete the instrument from the system. Make sure there are no active lessons, studio sessions, or rentals depending on this record.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="im-pill"
                onClick={() => setDeleteInstrumentId(null)}
                style={{ padding: '8px 14px', borderRadius: '10px', border: `1px solid ${C.border}`, background: 'transparent', color: C.text2, cursor: 'pointer', fontFamily: C.font, fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  removeInstrument(deleteInstrumentId)
                  setDeleteInstrumentId(null)
                }}
                style={{ padding: '8px 14px', borderRadius: '10px', border: 'none', background: C.coral, color: '#fff', cursor: 'pointer', fontFamily: C.font, fontSize: '13px', fontWeight: 600 }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {deletePricingId && (
        <div
          role="presentation"
          onClick={() => setDeletePricingId(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: C.bg3, border: `1px solid ${C.border2}`, borderRadius: '16px', padding: '22px', maxWidth: '360px' }}
            role="dialog"
          >
            <div style={{ fontFamily: C.display, fontSize: '17px', fontWeight: 700, color: C.text, marginBottom: '8px' }}>
              Remove pricing rule?
            </div>
            <p style={{ fontSize: '13px', color: C.text2, lineHeight: 1.5, marginBottom: '18px' }}>
              This will delete the selected pricing rule. Base rates and other rules will still apply.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="im-pill"
                onClick={() => setDeletePricingId(null)}
                style={{ padding: '8px 14px', borderRadius: '10px', border: `1px solid ${C.border}`, background: 'transparent', color: C.text2, cursor: 'pointer', fontFamily: C.font, fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  removePricingRule(deletePricingId)
                  setDeletePricingId(null)
                }}
                style={{ padding: '8px 14px', borderRadius: '10px', border: 'none', background: C.coral, color: '#fff', cursor: 'pointer', fontFamily: C.font, fontSize: '13px', fontWeight: 600 }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default InstrumentManagement

