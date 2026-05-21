import { useEffect } from "react"
import { Link, useNavigate } from 'react-router-dom'
import { useUserContext } from '@/context/AuthContext'
import { Bell, ChevronDown, KeyRound, LogOut, User } from 'lucide-react'
import BrandLogo from './BrandLogo'
import { useGetNotificationUnreadCount } from '@/lib/react-query/queries'
import { getSocket } from '@/lib/socket'
import { useQueryClient } from '@tanstack/react-query'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const Topbar = () => {
const navigate=useNavigate()
const {user,checkAuthUser} =useUserContext()
const queryClient = useQueryClient()
const { data: unreadCount = 0 } = useGetNotificationUnreadCount()

useEffect(() => {
  const socket = getSocket()
  if (!socket) return

  const handleNotification = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] })
    queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })
  }

  socket.on('notification:new', handleNotification)
  return () => {
    socket.off('notification:new', handleNotification)
  }
}, [queryClient])

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
    <section className='topbar'>
    <div className='flex items-center justify-between gap-3 px-4 py-3'>
    <Link to='/' className='min-w-0 flex-1'>
    <BrandLogo className="scale-90 origin-left" />
    </Link>

    <Link
      to="/notifications"
      aria-label="Open notifications"
      className="relative grid h-11 w-11 flex-none place-items-center rounded-full border border-white/10 bg-white/[0.06] text-white transition hover:bg-white/[0.1]"
    >
      <Bell size={19} />
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-red px-1.5 text-[11px] font-bold text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>

    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open account menu"
        className="group inline-flex flex-none items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-1.5 py-1.5 text-white outline-none transition hover:bg-white/[0.1]"
      >
        <span className="h-9 w-9 overflow-hidden rounded-full bg-dark-4 ring-2 ring-white/10">
          <img
            src={user?.imageUrl || "/assets/images/default_user_image.png"}
            alt={user?.name || "Profile"}
            className="h-full w-full object-cover object-top"
          />
        </span>
        <ChevronDown size={16} className="mr-1 text-white/55 transition group-data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 rounded-2xl border border-white/10 bg-[#11131a] p-2 text-white shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
        <div className="mb-2 flex items-center gap-3 border-b border-white/10 px-3 py-3">
          <img
            src={user?.imageUrl || "/assets/images/default_user_image.png"}
            alt={user?.name || "Profile"}
            className="h-11 w-11 rounded-full object-cover object-top ring-2 ring-white/10"
          />
          <div className="min-w-0">
            <p className="small-semibold line-clamp-1">{user?.name}</p>
            <p className="tiny-medium line-clamp-1 text-white/45">{user?.email}</p>
          </div>
        </div>
        <Link to={`/profile/${user._id}`}>
          <DropdownMenuItem className="cursor-pointer gap-3 rounded-xl p-3">
            <User size={18} />
            <span>Profile</span>
          </DropdownMenuItem>
        </Link>
        <Link to="/change-password">
          <DropdownMenuItem className="cursor-pointer gap-3 rounded-xl p-3">
            <KeyRound size={18} />
            <span>Security</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem className="cursor-pointer gap-3 rounded-xl p-3 text-red" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </div>
    </section>
  )
}

export default Topbar
