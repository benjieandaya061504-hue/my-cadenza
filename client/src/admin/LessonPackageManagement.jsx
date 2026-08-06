import { useState } from 'react'
import C from './theme.js'
import LessonPackageFees from './LessonPackageFees.jsx'
import SavedPackagesSummary from './SavedPackagesSummary.jsx'

export default function LessonPackageManagement({ isMobile, isTablet }) {
  const [section, setSection] = useState('fees') // 'fees' | 'saved'

  const tabStyle = (active) => ({
    padding: '10px 20px', borderRadius: 10, border: 'none',
    fontSize: '0.82rem', fontWeight: 600, fontFamily: C.font,
    cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
    background: active ? `linear-gradient(135deg, ${C.royal}, ${C.purple})` : '#fff',
    color: active ? '#fff' : C.text2,
    border: active ? 'none' : `1.5px solid ${C.border2}`,
  })

  return (
    <div style={{ fontFamily: C.font }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <button style={tabStyle(section === 'fees')} onClick={() => setSection('fees')}>
          Package Fees
        </button>
        <button style={tabStyle(section === 'saved')} onClick={() => setSection('saved')}>
          Saved Packages
        </button>
      </div>

      {section === 'fees' ? <LessonPackageFees /> : <SavedPackagesSummary />}
    </div>
  )
}