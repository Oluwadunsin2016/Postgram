import Bottombar from '@/components/ui/shared/Bottombar'
import LeftSidebar from '@/components/ui/shared/LeftSidebar'
import RightSidebar from '@/components/ui/shared/RightSidebar'
import Topbar from '@/components/ui/shared/Topbar'
import { useUserContext } from '@/context/AuthContext'
import { Spinner } from '@nextui-org/react'
import { Outlet, useLocation } from 'react-router-dom'
import NetworkErrorPage from './pages/NetworkErrorPage'

const RootLayout = () => {
const {pathname}=useLocation()
const {isLoading,internetError}=useUserContext()
const show = pathname=='/'|| pathname=='/create-post'||  pathname.includes('/update-post')||  pathname.includes('/update-profile')
const isImmersive = pathname === '/status'
if (isLoading) return <div className='w-full min-h-screen flex flex-col items-center justify-center gap-2'><Spinner size='lg' className='text-indigo-600' /> <span>Please wait...</span> </div>
if (internetError) return <NetworkErrorPage/>
  return (
    <div className={`app-shell ${isImmersive ? 'md:!grid-cols-1 xl:!grid-cols-1' : show ? '' : 'xl:grid-cols-[17rem_minmax(0,1fr)]'}`}>
    {!isImmersive && <Topbar/>}
    {!isImmersive && <LeftSidebar/>}
    <section className='app-main'>
    <Outlet/>
    </section>
    {show && !isImmersive && <RightSidebar/>}
    {!isImmersive && <Bottombar/>}
    </div>
  )
}

export default RootLayout
