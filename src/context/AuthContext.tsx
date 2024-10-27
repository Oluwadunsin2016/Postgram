import { getCurrentUser } from '@/lib/appwrite/api'
import { useGetCurrentUser } from '@/lib/react-query/queriesAndMutation'
import { IcontextType, IUser } from '@/types'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'


export const INITIAL_USER={
id:'',
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
}

const AuthContext=createContext<IcontextType>(INITIAL_STATE)


const AuthProvider = ({children}:{children:React.ReactNode}) => {
const [user, setUser] = useState<IUser>(INITIAL_USER)
const [isLoading, setIsLoading] = useState(false)
const [isAuthenticated, setIsAuthenticated] = useState(false)

const {data:currentAccount}=useGetCurrentUser()

const navigate =useNavigate()


const checkAuthUser=async()=>{
try {
    // const currentAccount=await getCurrentUser()

    if(currentAccount){
    setUser({
    id: currentAccount.$id,
    name: currentAccount.name,
    username: currentAccount.username,
    email: currentAccount.email,
    imageUrl: currentAccount.imageUrl,
    bio: currentAccount.bio,
    imageId: currentAccount.imageId,
    })

    setIsAuthenticated(true)
    return true
    }

    return false
} catch (error) {
    console.log(error)
    return false
} finally{
setIsLoading(false)
}
}

useEffect(() => {
const cookieFallback=localStorage.getItem('cookieFallback')

if (cookieFallback==='[]'||cookieFallback===null ||cookieFallback===undefined) {
    navigate('/sign-in')
}

checkAuthUser()
}, [])

useEffect(() => {
checkAuthUser()
}, [currentAccount])



const value= {
user,
isLoading,
isAuthenticated,
setUser,
setIsAuthenticated,
checkAuthUser
}
  return (
    <AuthContext.Provider value={value} >
    {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider

export const useUserContext=()=>useContext(AuthContext)