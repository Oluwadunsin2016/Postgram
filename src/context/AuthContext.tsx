import { getCurrentUser } from '@/lib/appwrite/api'
import { useGetCurrentUser } from '@/lib/react-query/queries'
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
}

const AuthContext=createContext<IcontextType>(INITIAL_STATE)


const AuthProvider = ({children}:{children:React.ReactNode}) => {
const [user, setUser] = useState<IUser>(INITIAL_USER)
const [isLoading, setIsLoading] = useState(false)
const [isAuthenticated, setIsAuthenticated] = useState(false)
const {pathname}=useLocation()
// const {data:currentAccount}=useGetCurrentUser()
const {data:currentAccount}=useGetCurrentUser()
console.log(currentAccount);


const navigate =useNavigate()


const checkAuthUser=async()=>{
try {
    // const currentAccount=await getCurrentUser()

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
const token=localStorage.getItem('postgramToken')

if (token==='[]'||token===null ||token===undefined) {
    navigate('/sign-in')
}else if (token && pathname=='/sign-in'||pathname=='/sign-up') {
    navigate('/')
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