import { useUserContext } from '@/context/AuthContext'
import UserCard from './UserCard'
import Loader from './Loader'
import { useGetAllUsers } from '@/lib/react-query/queries'

const TopCreators = () => {
const {user} =useUserContext()

const {data:users,isLoading: isUserLoading,}=useGetAllUsers()



  return (
    <div className='flex flex-col gap-5 px-5'>
     <div>
      <p className="small-semibold uppercase tracking-[0.24em] text-white/[0.35]">Discover</p>
      <h3 className="h3-bold">Creators to watch</h3>
     </div>
    <div>
    {isUserLoading ? <Loader/>: <div className='flex flex-col gap-3'>
     {users?.slice(0, 6).map((creator:any)=>(
      user._id!==creator._id &&
 <UserCard key={creator._id} user={creator} />  
     ))}
     </div>}
    </div>
    </div>
  )
}

export default TopCreators
