import React, { useEffect } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../button'
import { useGetUsers, useSignOutAccount } from '@/lib/react-query/queriesAndMutation'
import { useUserContext } from '@/context/AuthContext'
import { sidebarLinks } from '@/constants'
import { INavLink } from '@/types'
import UserCard from './UserCard'
import Loader from './Loader'
import { useGetAllUsers } from '@/lib/react-query/queries'

const TopCreators = () => {
// const {
//   data: creators,
//   isLoading: isUserLoading,
//   isError: isErrorCreators,
// } = useGetUsers();
const navigate=useNavigate()
const {pathname}=useLocation()
const {user} =useUserContext()

const {data:users,isLoading: isUserLoading,}=useGetAllUsers()



  return (
    <div className='flex flex-col gap-8 overflow-scroll custom-scrollbar px-10'>
     <h3 className="body-bold md:h3-bold">Top Creators</h3>
    <div>
    {isUserLoading ? <Loader/>: <div className='flex flex-col gap-2'>
     {users?.map((creator:any)=>(
      user._id!==creator._id &&
 <UserCard key={creator._id} user={creator} />  
     ))}
     </div>}
    </div>
    </div>
  )
}

export default TopCreators