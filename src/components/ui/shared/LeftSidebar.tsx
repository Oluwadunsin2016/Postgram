import React, { useEffect } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../button'
import { useUserContext } from '@/context/AuthContext'
import { sidebarLinks } from '@/constants'
import { INavLink } from '@/types'

const LeftSidebar = () => {
const navigate=useNavigate()
const {pathname}=useLocation()
const {user,checkAuthUser} = useUserContext()
console.log(user);


// useEffect(() => {
// if (isSuccess)  navigate(0)
// }, [isSuccess])


  const handleLogout = async () => {
    localStorage.removeItem('postgramToken');
     try {
      await checkAuthUser()
      navigate('/sign-in')
  } catch (error) {
    console.error("Error logging out:", error);
  }
  };

  return (
    <nav className='leftsidebar'>
    <div className='flex flex-col gap-5'>
       <Link to='/' className='flex gap-3 items-center'>
    <img src="/assets/images/Logo-removebg-preview.png" alt="logo" height={60} width={250} />
    </Link>

      <Link to={`/profile/${user?._id}`} className='flex items-center gap-3'>
    <img src={user?.imageUrl || '/assets/images/profile-placeholder.svg'} alt="profile" className='h-14 w-14 rounded-full' />
    <div className='flex flex-col'>
    <p className='body-bold line-clamp-1'>{user.name}</p>
    <p className='small-regular text-light-3'>@{user.username}</p>
    </div>
    </Link>

    <ul className='flex flex-col'>
    {sidebarLinks.map((link:INavLink,i:number)=>{
    const isActive=pathname==link.route
    return(
    <li key={i} className={`leftsidebar-link group ${isActive && 'bg-primary-500'}`}>
    <NavLink to={link.route} className='flex gap-4 items-center p-4' >
    <img src={link.imgURL} alt={link.label} className={`group-hover:invert-white ${isActive && 'invert-white'}`} />
    {link.label}
    </NavLink>
    </li>
    )
    })}
    </ul>
    </div>
    <Button variant="ghost" className='shad-button_ghost'
    onClick={handleLogout}>
    <img src="/assets/icons/logout.svg" alt="logout" />
    <p className='small-medium lg:base-medium'>Logout</p>
    </Button>
    </nav>
  )
}

export default LeftSidebar