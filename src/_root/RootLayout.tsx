import Bottombar from '@/components/ui/shared/Bottombar'
import LeftSidebar from '@/components/ui/shared/LeftSidebar'
import RightSidebar from '@/components/ui/shared/RightSidebar'
import Topbar from '@/components/ui/shared/Topbar'
import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'

const RootLayout = () => {
const {pathname}=useLocation()
console.log(pathname)
const show = pathname=='/'|| pathname=='/create-post'||  pathname.includes('/update-post')||  pathname.includes('/update-profile')
  return (
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
  )
}

export default RootLayout