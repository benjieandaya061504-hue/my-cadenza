import { Outlet } from 'react-router-dom'
import { PublicSiteProvider, usePublicSite } from './PublicSiteContext'
import PublicNav from '../../components/PublicNav'
import PublicModals from '../../components/PublicModals'
import '../../styles/publicSiteTheme.css'
import './publicSiteLight.css'
import './publicSiteModules.css'

function PublicShell() {
  const { toast } = usePublicSite()

  return (
    <div id="pub-site-light">
      <PublicNav />
      <Outlet />
      <PublicModals />
      <div className={`pub-toast${toast.show ? ' show' : ''}`} role="status">
        {toast.message}
      </div>
    </div>
  )
}

export default function PublicSiteLayout() {
  return (
    <PublicSiteProvider>
      <PublicShell />
    </PublicSiteProvider>
  )
}
