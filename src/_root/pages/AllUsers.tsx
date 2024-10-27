import Loader from '@/components/ui/shared/Loader';
import UserCard from '@/components/ui/shared/UserCard';
import { useGetUsers } from '@/lib/react-query/queriesAndMutation';
import React from 'react'

const AllUsers = () => {
const {
  data: creators,
  isLoading: isUserLoading,
  isError: isErrorCreators,
} = useGetUsers(10);


  return (
     <div className="common-container">
      <div className="max-w-5xl flex-start gap-2 justify-start w-full">
          <img
            src="/assets/icons/people.svg"
            width={40}
            height={40}
            alt="users"
            className='invert-white'
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">All Users</h2>
        </div>
     {/* <div className='flex gap-1 items-center'>
     <img src="/assets/icons/people.svg" height={50} width={50} alt="" />
   <h2 className="h3-bold md:h2-bold w-full">All Users</h2>
     </div> */}
     <div>
    {isUserLoading ? <Loader/>: <div className='grid grid-cols-2 w-full md:grid-cols-3 gap-6 my-4'>
     {creators?.documents.map(creator=>(
 <UserCard key={creator.$id} user={creator} />  
     ))}
     </div>}
    </div>
    </div>
  )
}

export default AllUsers