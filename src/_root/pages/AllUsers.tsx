import UserCard from '@/components/ui/shared/UserCard';
import { useUserContext } from '@/context/AuthContext';
import { useGetAllUsers } from '@/lib/react-query/queries';
import { Search, Users } from 'lucide-react';
import { useMemo, useState } from "react"
import { Skeleton } from '@nextui-org/react';

const UserGridSkeleton = () => (
  <div className="mt-7 grid w-full grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="overflow-hidden rounded-3xl border border-dark-4 bg-dark-2/80">
        <Skeleton className="h-24 w-full bg-dark-4" />
        <div className="-mt-10 flex flex-col gap-4 p-4">
          <Skeleton className="h-20 w-20 rounded-full bg-dark-4" />
          <Skeleton className="h-5 w-3/5 rounded-lg bg-dark-4" />
          <Skeleton className="h-4 w-2/5 rounded-lg bg-dark-4" />
          <Skeleton className="h-20 w-full rounded-2xl bg-dark-4" />
        </div>
      </div>
    ))}
  </div>
);

const AllUsers = () => {
// const {
//   data: creators,
//   // isLoading: isUserLoading,
//   isError: isErrorCreators,
// } = useGetUsers(10);
const { user } = useUserContext();
const [searchTerm, setSearchTerm] = useState("");

const {data:users,isLoading: isUserLoading,}=useGetAllUsers()
const filteredUsers = useMemo(() => {
  const normalizedSearch = searchTerm.trim().toLowerCase();
  return (users || [])
    .filter((creator:any) => user._id !== creator._id)
    .filter((creator:any) => {
      if (!normalizedSearch) return true;
      return (
        creator.name?.toLowerCase().includes(normalizedSearch) ||
        creator.username?.toLowerCase().includes(normalizedSearch) ||
        creator.bio?.toLowerCase().includes(normalizedSearch) ||
        creator.location?.toLowerCase().includes(normalizedSearch)
      );
    });
}, [searchTerm, user._id, users]);



  return (
     <div className="common-container">
      <section className="content-panel w-full max-w-6xl rounded-3xl p-5 md:p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-500/15 text-primary-500">
              <Users size={25} />
            </span>
            <div>
              <p className="small-semibold uppercase tracking-[0.24em] text-white/[0.38]">Community</p>
              <h1 className="h2-bold">Find people</h1>
              <p className="mt-1 max-w-xl text-light-3 small-regular">Discover creators, follow friends, and open a conversation from one place.</p>
            </div>
          </div>
          <div className="flex h-12 w-full items-center gap-3 rounded-2xl border border-dark-4 bg-dark-3 px-4 md:max-w-sm">
            <Search size={18} className="text-light-4" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search name, username, bio"
              className="h-full flex-1 bg-transparent text-light-1 outline-none placeholder:text-light-4 small-regular"
            />
          </div>
        </div>

        {isUserLoading ? (
          <UserGridSkeleton />
        ) : filteredUsers.length > 0 ? (
          <div className='mt-7 grid w-full grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3'>
            {filteredUsers.map((creator:any)=>(
              <UserCard key={creator._id} user={creator} />
            ))}
          </div>
        ) : (
          <div className="grid min-h-56 place-items-center text-center">
            <div>
              <p className="base-semibold text-light-1">No users found</p>
              <p className="mt-1 text-light-3 small-regular">Try another name, username, or location.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default AllUsers
