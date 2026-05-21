import { useEffect } from "react"
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../button'
import { useUserContext } from '@/context/AuthContext'
import { sidebarLinks } from '@/constants'
import { INavLink } from '@/types'
import { LogOut } from 'lucide-react'
import BrandLogo from './BrandLogo'
import { useGetConversations, useGetNotificationUnreadCount } from '@/lib/react-query/queries'
import { useQueryClient } from '@tanstack/react-query'
import { getSocket } from '@/lib/socket'

const LeftSidebar = () => {
const navigate=useNavigate()
const {pathname}=useLocation()
const {user,checkAuthUser} = useUserContext()
const queryClient = useQueryClient()
const { data: notificationCount = 0 } = useGetNotificationUnreadCount()
const { data: conversations = [] } = useGetConversations()
const messageCount = conversations.reduce((total: number, conversation: any) => total + (conversation?.unreadCount || 0), 0)

useEffect(() => {
  const socket = getSocket()
  if (!socket) return

  const refreshCounts = () => {
    queryClient.invalidateQueries({ queryKey: ['conversations'] })
    queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })
  }

  socket.on('message:new', refreshCounts)
  socket.on('conversation:updated', refreshCounts)
  socket.on('message:read', refreshCounts)
  socket.on('notification:new', refreshCounts)

  return () => {
    socket.off('message:new', refreshCounts)
    socket.off('conversation:updated', refreshCounts)
    socket.off('message:read', refreshCounts)
    socket.off('notification:new', refreshCounts)
  }
}, [queryClient])

const getBadgeCount = (route: string) => {
  if (route === '/message') return messageCount
  if (route === '/notifications') return notificationCount
  return 0
}

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
    <div className='flex flex-col gap-6'>
       <Link to='/' className='flex items-center gap-3 px-2'>
        <BrandLogo />
    </Link>

      <Link to={`/profile/${user?._id}`} className='content-panel flex items-center gap-3 rounded-2xl p-3'>
    <img src={user?.imageUrl || '/assets/images/default_user_image.png'} alt="profile" className='h-12 w-12 rounded-full flex-none object-cover ring-2 ring-white/10' />
    <div className='min-w-0 flex flex-col'>
    <p className='base-semibold line-clamp-1'>{user.name}</p>
    <p className='small-regular text-white/[0.45]'>@{user.username}</p>
    </div>
    </Link>
    <ul className='flex flex-col gap-1'>
    {sidebarLinks.map((link:INavLink,i:number)=>{
    const isActive=pathname==link.route || (link.route !== '/' && pathname.startsWith(link.route))
    const badgeCount = getBadgeCount(link.route)
    return(
    <li key={i} className={`rounded-xl text-light-3 transition hover:text-white group ${isActive ? 'bg-primary-500 shadow-[0_12px_30px_rgba(135,126,255,0.18)]' : 'hover:bg-dark-4'}`}>
    <NavLink to={link.route} className={`flex gap-4 items-center p-3.5 ${isActive ? 'text-white' : 'text-light-3'}`} >
    <span className="relative flex h-5 w-5 flex-none items-center justify-center">
    <img src={link.imgURL} alt={link.label} className={`h-5 w-5 opacity-80 group-hover:invert-white ${isActive && 'invert-white'}`} />
    {badgeCount > 0 && (
      <span className="absolute -right-2.5 -top-2.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-red px-1 text-[9px] font-bold leading-none text-white ring-2 ring-gray-900">
        {badgeCount > 9 ? '9+' : badgeCount}
      </span>
    )}
    </span>
    {link.label}
    </NavLink>
    </li>
    )
    })}
    </ul>
    </div>
    <Button variant="ghost" className='shad-button_ghost h-12 hover:!bg-red/[0.08] !text-red hover:!text-red'
    onClick={handleLogout}>
    <LogOut size={20} />
    <p className='small-medium lg:base-medium'>Logout</p>
    </Button>
    </nav>
  )
}

export default LeftSidebar
