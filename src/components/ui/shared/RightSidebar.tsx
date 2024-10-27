import React, { useEffect } from 'react'
import TopCreators from './TopCreators'
import { useLocation } from 'react-router-dom'
import TopPosts from './TopPosts'


const RightSidebar = () => {
const {pathname}=useLocation()
console.log(pathname)
const isHome = pathname=='/'
  return (
    <nav className='rightsidebar'>
  {isHome?<TopCreators/>:<TopPosts/>}
    </nav>
  )
}

export default RightSidebar