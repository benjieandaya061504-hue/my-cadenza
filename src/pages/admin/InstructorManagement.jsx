import { useMemo, useState, useEffect, useCallback } from 'react'
import { instructorsAPI } from '../../services/api'

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

function InstructorFormModal({ mode, initial, onClose, onSave }) {
  const [firstName, setFirstName] = useState(initial?.first_name ?? '')
  const [lastName, setLastName] = useState(initial?.last_name ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [contactNumber, setContactNumber] = useState(initial?.contact_number ?? '')
  const [address, setAddress] = useState(initial?.address ?? '')
  const [specialization, setSpecialization] = useState(initial?.specialization ?? '')
  const [bio, setBio] = useState(initial?.bio ?? '')
  const [focus, setFocus] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async e => {
    e.preventDefault()
    setError(null)

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !contactNumber.trim()) {
      setError('First name, last name, email, and contact number are required')
      return
    }

    setSubmitting(true)
    try {
      await onSave({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        contact_number: contactNumber.trim(),
        address: address.trim() || null,
        specialization: specialization.trim() || null,
        bio: bio.trim() || null,
      })
      onClose()
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Failed to save instructor')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px', animation: 'imFadeUp 0.25s ease both',
      }}
    >
      <div
        role="dialog"
        aria-labelledby="im-instructor-title"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto',
          background: C.bg3, border: `1px solid ${C.border2}`,
          borderRadius: '16px', padding: '22px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.45)',
        }}
      >
        <div id="im-instructor-title" style={{ fontFamily: C.display, fontSize: '18px', fontWeight: 700, color: C.text, marginBottom: '6px' }}>
          {mode === 'add' ? 'Add instructor' : 'Update instructor'}
        </div>
        <p style={{ fontSize: '12px', color: C.text3, marginBottom: '18px', lineHeight: 1.45 }}>
          Fill in the instructor's details. This information will be used when assigning them to lesson packages.
        </p>
        {error && (
          <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', color: C.coral, fontSize: '13px', marginBottom: '14px' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                {fieldLabel('First name')}
                <input value={firstName} onChange={e => setFirstName(e.target.value)} required style={inputStyle(focus === 'fn')} onFocus={() => setFocus('fn')} onBlur={() => setFocus(null)} />
              </div>
              <div>
                {fieldLabel('Last name')}
                <input value={lastName} onChange={e => setLastName(e.target.value)} required style={inputStyle(focus === 'ln')} onFocus={() => setFocus('ln')} onBlur={() => setFocus(null)} />
              </div>
            </div>
            <div>
              {fieldLabel('Email')}
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle(focus === 'e')} onFocus={() => setFocus('e')} onBlur={() => setFocus(null)} />
            </div>
            <div>
              {fieldLabel('Contact number')}
              <input value={contactNumber} onChange={e => setContactNumber(e.target.value)} required placeholder="+63 9XX XXX XXXX" style={inputStyle(focus === 'c')} onFocus={() => setFocus('c')} onBlur={() => setFocus(null)} />
            </div>
            <div>
              {fieldLabel('Address')}
              <input value={address} onChange={e => setAddress(e.target.value)} placeholder="e.g. 123 Rizal St., Manila" style={inputStyle(focus === 'a')} onFocus={() => setFocus('a')} onBlur={() => setFocus(null)} />
            </div>
            <div>
              {fieldLabel('Specialization')}
              <input value={specialization} onChange={e => setSpecialization(e.target.value)} placeholder="e.g. Guitar, Piano, Voice" style={inputStyle(focus === 's')} onFocus={() => setFocus('s')} onBlur={() => setFocus(null)} />
            </div>
            <div>
              {fieldLabel('Bio (optional)')}
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Brief background about the instructor" style={{ ...inputStyle(focus === 'b'), resize: 'vertical', minHeight: '72px' }} onFocus={() => setFocus('b')} onBlur={() => setFocus(null)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="im-pill" disabled={submitting} style={{ padding: '9px 16px', borderRadius: '10px', border: `1px solid ${C.border}`, background: 'transparent', color: C.text2, cursor: 'pointer', fontFamily: C.font, fontSize: '13px', fontWeight: 500 }}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} style={{ padding: '9px 18px', borderRadius: '10px', border: 'none', background: submitting ? C.text3 : `linear-gradient(135deg, ${C.accent}, ${C.accentD})`, color: '#fff', cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: C.font, fontSize: '13px', fontWeight: 600 }}>
              {submitting ? 'Saving…' : (mode === 'add' ? 'Add instructor' : 'Save changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function InstructorManagement({ isMobile = false, isTablet = false }) {
  const [instructors, setInstructors] = useState([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [deleteError, setDeleteError] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchInstructors = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const res = await instructorsAPI.getAll()
      setInstructors(res.data)
    } catch (err) {
      console.error('Failed to fetch instructors:', err)
      setFetchError('Could not load instructors. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInstructors()
  }, [fetchInstructors])

  const filteredInstructors = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return instructors
    return instructors.filter(inst =>
      inst.first_name?.toLowerCase().includes(q) ||
      inst.last_name?.toLowerCase().includes(q) ||
      inst.email?.toLowerCase().includes(q) ||
      inst.specialization?.toLowerCase().includes(q) ||
      `${inst.first_name} ${inst.last_name}`.toLowerCase().includes(q)
    )
  }, [instructors, search])

  const addInstructor = async formData => {
    await instructorsAPI.create(formData)
    await fetchInstructors()
  }

  const updateInstructor = async formData => {
    try {
      await instructorsAPI.update(modal.instructor.id, formData)
      await fetchInstructors()
    } catch (err) {
      console.error('Failed to update instructor:', err)
      throw err
    }
  }

  const removeInstructor = async id => {
    setDeleting(true)
    setDeleteError(null)
    try {
      await instructorsAPI.delete(id)
      setInstructors(prev => prev.filter(inst => inst.id !== id))
      setDeleteId(null)
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to delete instructor'
      setDeleteError(msg)
    } finally {
      setDeleting(false)
    }
  }

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

  return (
    <>
      <style>{css}</style>
      <div style={{ animation: 'imFadeUp 0.4s ease both', fontFamily: C.font }}>
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontFamily: C.display, fontSize: isMobile ? '22px' : '26px', fontWeight: 800, color: C.text, letterSpacing: '-0.02em' }}>
            Instructor management
          </h1>
          <p style={{ fontSize: '13px', color: C.text3, marginTop: '4px' }}>
            Add, edit, and manage instructors. Instructors can be assigned to lesson packages.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
          {[
            { label: 'Total instructors', value: instructors.length, hint: 'All registered instructors' },
            { label: 'Active', value: instructors.filter(i => i.status !== 'inactive').length, hint: 'Currently active' },
            { label: 'With specialization', value: instructors.filter(i => i.specialization).length, hint: 'Have a defined specialty' },
          ].map((s, i) => (
            <div
              key={s.label}
              style={{
                background: C.bg3,
                border: `1px solid ${C.border}`,
                borderRadius: '14px',
                padding: '16px 18px',
                animation: `imFadeUp 0.35s ease ${i * 0.05}s both`,
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em' }}>{s.label}</div>
              <div style={{ fontFamily: C.display, fontSize: '26px', fontWeight: 700, color: C.text, marginTop: '4px' }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: C.text2, marginTop: '4px' }}>{s.hint}</div>
            </div>
          ))}
        </div>

        <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: isMobile ? '14px' : '18px 20px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: isMobile ? 'stretch' : 'center', marginBottom: '14px' }}>
            <div style={{ flex: isMobile ? '1 1 100%' : '1 1 200px', minWidth: 0, position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: C.text3, fontSize: '14px' }}>⌕</span>
              <input
                type="search"
                placeholder="Search instructors by name, email, or specialization…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search instructors"
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
                onFocus={e => { e.target.style.borderColor = 'rgba(124,106,247,0.45)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,106,247,0.1)' }}
                onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none' }}
              />
            </div>
            <button
              type="button"
              onClick={() => setModal({ type: 'add' })}
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
              + Add instructor
            </button>
          </div>
          <div style={{ fontSize: '11px', color: C.text3, marginBottom: '12px' }}>
            Showing <strong style={{ color: C.text2 }}>{filteredInstructors.length}</strong> of {instructors.length} instructors
          </div>

          {loading ? (
            <div style={{ padding: '48px 16px', textAlign: 'center', color: C.text3, fontSize: '13px' }}>
              Loading instructors…
            </div>
          ) : fetchError ? (
            <div style={{ padding: '48px 16px', textAlign: 'center' }}>
              <div style={{ color: C.coral, fontSize: '13px', marginBottom: '12px' }}>{fetchError}</div>
              <button type="button" onClick={fetchInstructors} style={{ padding: '8px 14px', borderRadius: '10px', border: `1px solid ${C.border}`, background: C.bg4, color: C.text2, cursor: 'pointer', fontFamily: C.font, fontSize: '13px' }}>
                Retry
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', borderRadius: '12px', border: `1px solid ${C.border}` }}>
              <table style={{ width: '100%', minWidth: isTablet ? '720px' : '800px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: C.bg4 }}>
                    {['Name', 'Email', 'Contact', 'Specialization', 'Status', 'Actions'].map(h => (
                      <th
                        key={h}
                        style={{
                          textAlign: h === 'Actions' ? 'right' : 'left',
                          padding: '10px 12px',
                          fontSize: '10px',
                          fontWeight: 600,
                          color: C.text3,
                          textTransform: 'uppercase',
                          letterSpacing: '.1em',
                          borderBottom: `1px solid ${C.border}`,
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredInstructors.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '36px 16px', textAlign: 'center', color: C.text3, fontSize: '13px' }}>
                        {search ? 'No instructors match your search.' : 'No instructors yet. Add your first instructor.'}
                      </td>
                    </tr>
                  ) : (
                    filteredInstructors.map((inst, i) => (
                      <tr key={inst.id} className="im-row" style={{ borderBottom: i < filteredInstructors.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                        <td style={{ padding: '12px', verticalAlign: 'middle' }}>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: C.text }}>{inst.first_name} {inst.last_name}</div>
                          {inst.bio && <div style={{ fontSize: '11px', color: C.text3, marginTop: '2px', maxWidth: '240px', lineHeight: 1.3 }}>{inst.bio}</div>}
                        </td>
                        <td style={{ padding: '12px', fontSize: '12px', color: C.text2, verticalAlign: 'middle' }}>{inst.email}</td>
                        <td style={{ padding: '12px', fontSize: '12px', color: C.text2, fontFamily: C.mono, verticalAlign: 'middle' }}>{inst.contact_number || '—'}</td>
                        <td style={{ padding: '12px', verticalAlign: 'middle' }}>
                          {inst.specialization ? (
                            <span style={{ fontSize: '12px', color: C.accentL, fontWeight: 500 }}>{inst.specialization}</span>
                          ) : (
                            <span style={{ fontSize: '11px', color: C.text3, fontStyle: 'italic' }}>None</span>
                          )}
                        </td>
                        <td style={{ padding: '12px', verticalAlign: 'middle' }}>
                          <span style={{
                            fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px',
                            background: inst.status === 'active' ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)',
                            color: inst.status === 'active' ? C.green : C.coral,
                          }}>
                            {inst.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                          <button
                            type="button"
                            className="im-pill"
                            onClick={() => setModal({ type: 'edit', instructor: inst })}
                            style={{ marginRight: '6px', padding: '6px 11px', borderRadius: '8px', border: `1px solid ${C.border}`, background: C.bg4, color: C.text2, cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteId(inst.id)}
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
          )}
        </div>
      </div>

      {modal?.type === 'add' && <InstructorFormModal mode="add" onClose={() => setModal(null)} onSave={addInstructor} />}
      {modal?.type === 'edit' && <InstructorFormModal mode="edit" initial={modal.instructor} onClose={() => setModal(null)} onSave={updateInstructor} />}

      {deleteId && (
        <div
          role="presentation"
          onClick={() => setDeleteId(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div onClick={ev => ev.stopPropagation()} style={{ background: C.bg3, border: `1px solid ${C.border2}`, borderRadius: '16px', padding: '22px', maxWidth: '400px' }} role="dialog" aria-labelledby="im-del-title">
            <div id="im-del-title" style={{ fontFamily: C.display, fontSize: '17px', fontWeight: 700, color: C.text, marginBottom: '8px' }}>Remove instructor?</div>
            <p style={{ fontSize: '13px', color: C.text2, lineHeight: 1.5, marginBottom: '18px' }}>
              This will remove the instructor from the system. Instructors assigned to packages will need to be reassigned.
            </p>
            {deleteError && (
              <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', color: C.coral, fontSize: '13px', marginBottom: '14px' }}>
                {deleteError}
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" className="im-pill" onClick={() => { setDeleteId(null); setDeleteError(null) }} disabled={deleting} style={{ padding: '8px 14px', borderRadius: '10px', border: `1px solid ${C.border}`, background: 'transparent', color: C.text2, cursor: 'pointer', fontFamily: C.font, fontSize: '13px' }}>
                Cancel
              </button>
              <button type="button" onClick={() => removeInstructor(deleteId)} disabled={deleting} style={{ padding: '8px 14px', borderRadius: '10px', border: 'none', background: deleting ? C.text3 : C.coral, color: '#fff', cursor: deleting ? 'not-allowed' : 'pointer', fontFamily: C.font, fontSize: '13px', fontWeight: 600 }}>
                {deleting ? 'Removing…' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}