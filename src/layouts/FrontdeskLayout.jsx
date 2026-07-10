import { Outlet } from 'react-router-dom'

function FrontDeskLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0e0f13' }}>
      {children ?? <Outlet />}
    </div>
  )
}

export default FrontDeskLayout
