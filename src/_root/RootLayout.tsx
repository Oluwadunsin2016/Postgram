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
    <section className='flex flex-1 h-full'>
    <Outlet/>
    </section>
    {show&&<RightSidebar/>}
    <Bottombar/>
    </div>
  )
}

export default RootLayout