import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../button'
import { useSignOutAccount } from '@/lib/react-query/queriesAndMutation'
import { useUserContext } from '@/context/AuthContext'

const Topbar = () => {
const {mutate:signOut,isSuccess }=useSignOutAccount()
const navigate=useNavigate()
const {user} =useUserContext()

useEffect(() => {
if (isSuccess)  navigate(0)
}, [isSuccess])

  return (
    <section className='topbar'>
    <div className='flex justify-between items-center px-5 py-2'>
    <Link to='/' className='flex items-center'>
    <img src="/assets/images/Logo-removebg-preview.png" alt="logo" height={325} width={180} />
    </Link>

    <div className="flex gap-4">
    <Button variant="ghost" className='shad-button_ghost'
    onClick={()=>signOut()}>
    <img src="/assets/icons/logout.svg" alt="logout" />
    </Button>
    <Link to={`/profile/${user.id}`} className='flex items-center gap-3'>
    <img src={user.imageUrl || '/assets/icons/profile-placeholder.svg'} alt="profile" className='h-8 w-8 rounded-full' />
    </Link>
    </div>
    </div>
    </section>
  )
}

export default Topbar