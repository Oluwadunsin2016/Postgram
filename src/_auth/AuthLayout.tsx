import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'


const AuthLayout = () => {
const isAuthenticated=false
  return (
    <>
    {isAuthenticated?<Navigate to='/'/>:<>
    <section className='flex flex-1 justify-center items-center flex-col py-10'>
    <Outlet/>
    </section>

       <div className="relative h-screen w-1/2 hidden xl:block">
  <img src="/assets/images/nature.jpg" alt="logo" className="h-full w-full object-cover" />
  <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent"></div>
</div>
    </>
    
    }
    </>
  )
}

export default AuthLayout