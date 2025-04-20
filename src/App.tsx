import { Route, Routes } from 'react-router-dom'
import './globals.css'
import SignInForm from './_auth/forms/SignInForm'
import SignUpForm from './_auth/forms/SignUpForm'
import { AllUsers, CreatePost, Explore, Home, PostDetails, Profile, Saved, UpdatePost, UpdateProfile } from './_root/pages'
import AuthLayout from './_auth/AuthLayout'
import RootLayout from './_root/RootLayout'
import { Toaster } from "@/components/ui/toaster";
import Chats from './_root/pages/Chats'
import NotFoundPage from './_root/pages/NotFoundPage'


const App = () => {
  return (
    <main className='md:flex md:h-screen'>
   <Routes>
   {/* public routes */}
   <Route element={<AuthLayout/>}>
<Route path='/sign-in' element={<SignInForm/>} />
<Route path='/sign-up' element={<SignUpForm/>} />
   </Route>
   {/* private routes */}
   <Route element={<RootLayout/>} >
   <Route index element={<Home/>} />
   <Route path='/explore' element={<Explore/>} />
   <Route path='/saved' element={<Saved/>} />
   <Route path='/all-users' element={<AllUsers/>} />
   <Route path='/create-post' element={<CreatePost/>} />
   <Route path='/update-post/:id' element={<UpdatePost/>} />
   <Route path='/posts/:id' element={<PostDetails/>} />
   <Route path='/profile/:id/*' element={<Profile/>} />
   <Route path='/message/:id?' element={<Chats/>} />
   <Route path='/update-profile/:id' element={<UpdateProfile/>} />
   </Route>
   <Route path='*' element={<NotFoundPage/>} />
   </Routes>
    <Toaster />
    </main>
  )
}

export default App