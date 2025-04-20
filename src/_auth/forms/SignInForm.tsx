import React,{useEffect, useState} from 'react'

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {signInValidation} from '../../lib/validators'
import Loader from "@/components/ui/shared/Loader"
import { Link, useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { useUserContext } from "@/context/AuthContext"
import { useSignInUser } from '@/lib/react-query/queries'
import { Spinner } from '@nextui-org/react'
 

const SignInForm = () => {
const [isLocked,setIsLocked]=useState(true)
  const { toast } = useToast()
  const navigate =useNavigate()
  const {mutateAsync:signInAccount,isLoading:isUserLoading}=useSignInUser()

  const {checkAuthUser,}=useUserContext()

  // 1. Define your form.
  const form = useForm<z.infer<typeof signInValidation>>({
    resolver: zodResolver(signInValidation),
    defaultValues: {
      email: "",
      password: "",
    },
  })
  
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof signInValidation>) {

  const session = await signInAccount({email:values.email,password:values.password},{
  onError:(error:any)=>{
  toast({variant:'destructive',title:error.message,className: "bg-red border-none",})
  }
  })
console.log(session);

  if(!session) return toast({title:'Sign in failed, Please try again'})
 const isUserLoggedIn= await checkAuthUser()


  if (isUserLoggedIn) {
    form.reset()
    navigate('/')
  }else{
  toast({variant:'destructive',title:'Sign in failed. Try again'})
  }
  }
  return (
      <Form {...form}>
      <div className="sm:w-420 flex flex-center flex-col ">
      <img src="/assets/images/Logo-removebg-preview.png" alt="logo" height={80} width={280} />

      <h2 className="h3-bold md:h2-bold pt-5">Login to your account</h2>
      <p className="text-light-3 small-medium md:base-regular mt-4">Welcome back, please enter your details</p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full mt-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" className={`shad-input ${form.formState.errors.email ? 'border-red' : ''}`} {...field} />
              </FormControl>
              <FormMessage className={form.formState.errors.email ? 'text-red' : ''} />
            </FormItem>
          )}
        />
        <div className='relative'>
        <FormField
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input  type={isLocked?"password":"text"} className={`shad-input border-red ${
            fieldState.invalid ? "border-red-500" : ""
          }`} {...field} />
              </FormControl>
              <FormMessage className={fieldState.invalid ? "text-red" : ""} />
            </FormItem>
          )}
        />
        <div className='absolute top-11 right-4 cursor-pointer'>
        {isLocked?<img src="/assets/icons/lock.svg" alt="lock" width={22} height={22} onClick={()=>setIsLocked(false)} />:<img src="/assets/icons/unlock.svg" alt="unlock" width={22} height={22} onClick={()=>setIsLocked(true)} />}
        </div>
        </div>
        <Button type="submit" className="shad-button_primary mt-4">
        {isUserLoading ? (<div className="flex flex-center gap-2">
        
          <Spinner size='sm' color="white" /> Loading...
        </div>):"Sign In"}
        </Button>

        <p className="text-small-regular text-light-2 text-center mt-2 ">
        Don't have an account?
        <Link to='/sign-up' className="text-primary-500 text-small-semibold ml-1">Sign Up</Link>
        </p>
      </form>
      </div>
    </Form>
  )
}

export default SignInForm