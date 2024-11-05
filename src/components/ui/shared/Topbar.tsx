import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../button'
// import { useSignOutAccount } from '@/lib/react-query/queriesAndMutation'
import { useUserContext } from '@/context/AuthContext'

const Topbar = () => {
const navigate=useNavigate()
const {user} =useUserContext()

// useEffect(() => {
// if (isSuccess)  navigate(0)
// }, [isSuccess])

 const handleLogout = async () => {
     try {
    // await axiosInstance.post('/auth/logout');
    console.log('seen');
    
    localStorage.removeItem('postgramToken');
    navigate('/sign-in');
  } catch (error) {
    console.error("Error logging out:", error);
  }
  };

  return (
    <section className='topbar'>
    <div className='flex justify-between items-center px-5 py-2'>
    <Link to='/' className='flex items-center'>
    <img src="/assets/images/Logo-removebg-preview.png" alt="logo" height={325} width={180} />
    </Link>

    <div className="flex gap-4">
    <Button variant="ghost" className='shad-button_ghost'
    onClick={handleLogout}>
    <img src="/assets/icons/logout.svg" alt="logout" />
    </Button>
    <Link to={`/profile/${user._id}`} className='flex items-center gap-3'>
    <img src={user?.imageUrl || '/assets/icons/profile-placeholder.svg'} alt="profile" className='h-8 w-8 rounded-full flex-none' />
    </Link>
    </div>
    </div>
    </section>
  )
}

export default Topbar