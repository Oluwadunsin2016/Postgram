import React, { useEffect } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../button'
import { useGetUsers, useSignOutAccount } from '@/lib/react-query/queriesAndMutation'
import { useUserContext } from '@/context/AuthContext'
import { sidebarLinks } from '@/constants'
import { INavLink } from '@/types'
import UserCard from './UserCard'
import Loader from './Loader'

const TopCreators = () => {
const {
  data: creators,
  isLoading: isUserLoading,
  isError: isErrorCreators,
} = useGetUsers();
const navigate=useNavigate()
const {pathname}=useLocation()
const {user} =useUserContext()



  return (
    <div className='flex flex-col gap-8'>
     <h3 className="body-bold md:h3-bold">Top Creators</h3>
    <div>
    {isUserLoading ? <Loader/>: <div className='grid grid-cols-2 gap-2'>
     {creators?.documents.map(creator=>(
 <UserCard key={creator.$id} user={creator} />  
     ))}
     </div>}
    </div>
    </div>
  )
}

export default TopCreators