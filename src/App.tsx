import { Route, Routes } from 'react-router-dom'
import './globals.css'
import SignInForm from './_auth/forms/SignInForm'
import SignUpForm from './_auth/forms/SignUpForm'
import ForgotPasswordForm from './_auth/forms/ForgotPasswordForm'
import ResetPasswordForm from './_auth/forms/ResetPasswordForm'
import { AllUsers, ChangePassword, CreatePost, Explore, Home, PostDetails, Profile, StatusViewer, UpdatePost, UpdateProfile } from './_root/pages'
import AuthLayout from './_auth/AuthLayout'
import RootLayout from './_root/RootLayout'
import { Toaster } from "@/components/ui/toaster";
import Chats from './_root/pages/Chats'
import NotFoundPage from './_root/pages/NotFoundPage'
import Notifications from './_root/pages/Notifications'


const App = () => {
  return (
    <main className='h-screen overflow-hidden'>
   <Routes>
   {/* public routes */}
   <Route element={<AuthLayout/>}>
<Route path='/sign-in' element={<SignInForm/>} />
<Route path='/sign-up' element={<SignUpForm/>} />
<Route path='/forgot-password' element={<ForgotPasswordForm/>} />
<Route path='/reset-password/:token' element={<ResetPasswordForm/>} />
   </Route>
   {/* private routes */}
   <Route element={<RootLayout/>} >
   <Route index element={<Home/>} />
   <Route path='/explore' element={<Explore/>} />
   <Route path='/all-users' element={<AllUsers/>} />
   <Route path='/create-post' element={<CreatePost/>} />
   <Route path='/update-post/:id' element={<UpdatePost/>} />
   <Route path='/posts/:id' element={<PostDetails/>} />
   <Route path='/status' element={<StatusViewer/>} />
   <Route path='/profile/:id/*' element={<Profile/>} />
   <Route path='/message/:id?' element={<Chats/>} />
   <Route path='/notifications' element={<Notifications/>} />
   <Route path='/update-profile/:id' element={<UpdateProfile/>} />
   <Route path='/change-password' element={<ChangePassword/>} />
   </Route>
   <Route path='*' element={<NotFoundPage/>} />
   </Routes>
    <Toaster />
    </main>
  )
}

export default App
