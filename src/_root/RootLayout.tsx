import Bottombar from '@/components/ui/shared/Bottombar'
import LeftSidebar from '@/components/ui/shared/LeftSidebar'
import RightSidebar from '@/components/ui/shared/RightSidebar'
import Topbar from '@/components/ui/shared/Topbar'
import { useUserContext } from '@/context/AuthContext'
import { Spinner } from '@nextui-org/react'
import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import NetworkErrorPage from './pages/NetworkErrorPage'

const RootLayout = () => {
const {pathname}=useLocation()
const {isAuthenticated,isLoading,internetError}=useUserContext()
const show = pathname=='/'|| pathname=='/create-post'||  pathname.includes('/update-post')||  pathname.includes('/update-profile')
if (isLoading) return <div className='w-full min-h-screen flex flex-col items-center justify-center gap-2'><Spinner size='lg' className='text-indigo-600' /> <span>Please wait...</span> </div>
if (internetError) return <NetworkErrorPage/>
  return (
   <>
   {/* {!isAuthenticated?<Navigate to='/sign-in'/>
    : */}
    <div className='w-full md:flex'>
    <Topbar/>
    <LeftSidebar/>
    {/* <section className={`flex flex-1 min-h-screen ${show?'md:max-w-[50%]':'md:max-w-[80%]'}`}> */}
    <section className='flex flex-1 min-h-screen md:max-w-[80%]'>
    <Outlet/>
    </section>
    {show&&<RightSidebar/>}
    <Bottombar/>
    </div>
   </>
  )
}

export default RootLayout