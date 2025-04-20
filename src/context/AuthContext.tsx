
import { getUser } from '@/APIs/userApi'
import { IcontextType, IUser } from '@/types/Types'
import React, { createContext, useContext, useEffect, useState } from 'react'
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


const checkAuthUser=async()=>{
try {
const currentAccount=await getUser()
console.log(currentAccount);

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
    return true
  }else{
    setUser(INITIAL_USER)
      setIsAuthenticated(false)
    }

    return false
} catch (error:any) {
  console.log('❌ checkAuthUser error:', error?.message);
  if (error.message === 'network') {
    setInternetError('network'); // 🌐 trigger no-internet page
  } else if (error.message === 'unauthenticated') {
    setInternetError(null); // 🔐 redirect to login
    setIsAuthenticated(false);
  }
    return false
} finally{
setIsLoading(false)
}
}

useEffect(() => {
const token=localStorage.getItem('postgramToken')
console.log(token);


if (token==='[]'||token===null ||token===undefined) {
    navigate('/sign-in')
}else if (token && pathname=='/sign-in'||pathname=='/sign-up') {
    navigate('/')
}

checkAuthUser()
}, [])



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