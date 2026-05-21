
import { useEffect } from 'react'
import { bottombarLinks } from '@/constants'
import { Link, useLocation } from 'react-router-dom'
import { useGetConversations } from '@/lib/react-query/queries'
import { useQueryClient } from '@tanstack/react-query'
import { getSocket } from '@/lib/socket'

const Bottombar = () => {
const {pathname}=useLocation()
const queryClient = useQueryClient()
const { data: conversations = [] } = useGetConversations()
const messageCount = conversations.reduce((total: number, conversation: any) => total + (conversation?.unreadCount || 0), 0)

useEffect(() => {
  const socket = getSocket()
  if (!socket) return

  const refreshMessages = () => {
    queryClient.invalidateQueries({ queryKey: ['conversations'] })
  }

  socket.on('message:new', refreshMessages)
  socket.on('conversation:updated', refreshMessages)
  socket.on('message:read', refreshMessages)

  return () => {
    socket.off('message:new', refreshMessages)
    socket.off('conversation:updated', refreshMessages)
    socket.off('message:read', refreshMessages)
  }
}, [queryClient])

  return (
    <section className='bottom-bar'>
    {bottombarLinks.map((link,i:number)=>{
    const isActive=pathname==link.route || (link.route !== '/' && pathname.startsWith(link.route))
    const badgeCount = link.route === '/message' ? messageCount : 0
    return(
    <Link to={link.route} key={i} className={`${isActive ? 'bg-primary-500 text-white' : 'text-white/[0.45]'} flex-center min-w-0 flex-col gap-1 rounded-xl p-2 transition`} >
    <span className="relative">
    <img src={link.imgURL} alt={link.label} width={17} height={17} className={`${isActive ? 'invert-white' : 'opacity-55'}`} />
    {badgeCount > 0 && (
      <span className="absolute -right-2.5 -top-2.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-red px-1 text-[9px] font-bold leading-none text-white ring-2 ring-dark-2">
        {badgeCount > 9 ? '9+' : badgeCount}
      </span>
    )}
    </span>
    <p className='tiny-medium truncate'>{link.label}</p>
    </Link>
    )
    })}
    </section>
  )
}

export default Bottombar
