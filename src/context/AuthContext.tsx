
import { getUser } from '@/APIs/userApi'
import { IcontextType, IUser } from '@/types/Types'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'


export const INITIAL_USER={
_id:'',
name:'',
username:'',
email:'',
imageUrl:'',
bio:'',
}

const INITIAL_STATE={
user:INITIAL_USER,
isLoading:false,
isAuthenticated:false,
setUser:()=>{},
setIsAuthenticated:()=>{},
checkAuthUser:async()=>false as boolean,
internetError: null as string | null,   
setInternetError: () => {},  
}

const AuthContext=createContext<IcontextType>(INITIAL_STATE)


const AuthProvider = ({children}:{children:React.ReactNode}) => {
const [user, setUser] = useState<IUser>(INITIAL_USER)
const [internetError, setInternetError] = useState<string | null>(null);
const [isLoading, setIsLoading] = useState(true)
const [isAuthenticated, setIsAuthenticated] = useState(false)
const {pathname}=useLocation()


const navigate =useNavigate()
const publicRoutes = useMemo(() => ['/sign-in', '/sign-up', '/forgot-password'], []);
const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/reset-password/');

const getValidToken = () => {
const token=localStorage.getItem('postgramToken')
return token && token !== '[]' && token !== 'null' && token !== 'undefined' ? token : null
}

const checkAuthUser=useCallback(async()=>{
const token = getValidToken()
if (!token) {
  setUser(INITIAL_USER)
  setIsAuthenticated(false)
  setIsLoading(false)
  return false
}

try {
setIsLoading(true)
const currentAccount=await getUser()

    if(currentAccount){
    setUser({
    _id: currentAccount._id,
    name: currentAccount.name,
    username: currentAccount.username,
    email: currentAccount.email,
    imageUrl: currentAccount.imageUrl,
    bio: currentAccount.bio,
    })

    setIsAuthenticated(true)
    setInternetError(null)
    return true
  }else{
    setUser(INITIAL_USER)
      setIsAuthenticated(false)
    }

    return false
} catch (error:any) {
  if (error.message === 'network') {
    setInternetError('network');
  } else if (error.message === 'unauthenticated') {
    localStorage.removeItem('postgramToken')
    setUser(INITIAL_USER)
    setInternetError(null);
    setIsAuthenticated(false);
  } else {
    setUser(INITIAL_USER)
    setIsAuthenticated(false)
  }
    return false
} finally{
setIsLoading(false)
}
}, [])

useEffect(() => {
const handleOffline = () => {
  setInternetError('network')
  setIsLoading(false)
}

const handleOnline = () => {
  setInternetError(null)
  if (getValidToken()) checkAuthUser()
}

const handleNetworkError = () => setInternetError('network')
const handleNetworkRestored = () => {
  if (navigator.onLine) setInternetError(null)
}

window.addEventListener('offline', handleOffline)
window.addEventListener('online', handleOnline)
window.addEventListener('postgram:network-error', handleNetworkError)
window.addEventListener('postgram:network-restored', handleNetworkRestored)

return () => {
  window.removeEventListener('offline', handleOffline)
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('postgram:network-error', handleNetworkError)
  window.removeEventListener('postgram:network-restored', handleNetworkRestored)
}
}, [checkAuthUser])

useEffect(() => {
const token=getValidToken()

if (!navigator.onLine) {
  setInternetError('network')
  setIsLoading(false)
  return
}

if (!token) {
    setUser(INITIAL_USER)
    setIsAuthenticated(false)
    setIsLoading(false)
    if (!isPublicRoute) navigate('/sign-in', { replace: true })
    return
}

checkAuthUser().then((isLoggedIn) => {
  if (isLoggedIn && isPublicRoute) navigate('/', { replace: true })
  if (!isLoggedIn && !isPublicRoute && !getValidToken()) navigate('/sign-in', { replace: true })
})
}, [checkAuthUser, isPublicRoute, navigate, pathname])



const value= {
user,
isLoading,
isAuthenticated,
setUser,
setIsAuthenticated,
checkAuthUser,
setInternetError,
internetError
}
  return (
    <AuthContext.Provider value={value} >
    {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider

export const useUserContext=()=>useContext(AuthContext)
