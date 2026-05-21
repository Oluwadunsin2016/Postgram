import {useState} from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {signInValidation} from '../../lib/validators'
import { Link, useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { useUserContext } from "@/context/AuthContext"
import { useSignInUser } from '@/lib/react-query/queries'
import { Spinner } from '@nextui-org/react'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import BrandLogo from '@/components/ui/shared/BrandLogo'

const SignInForm = () => {
const [isLocked,setIsLocked]=useState(true)
  const { toast } = useToast()
  const navigate =useNavigate()
  const {mutateAsync:signInAccount,isLoading:isUserLoading}=useSignInUser()
  const {checkAuthUser}=useUserContext()

  const form = useForm<z.infer<typeof signInValidation>>({
    resolver: zodResolver(signInValidation),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: z.infer<typeof signInValidation>) {
  const session = await signInAccount({email:values.email,password:values.password},{
  onError:(error:any)=>toast({variant:'destructive',title:error.message,className: "bg-red border-none",})
  })

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
      <div className="w-full max-w-[29rem]">
      <div className="mb-8 lg:hidden">
        <BrandLogo />
      </div>

      <div className="content-panel rounded-3xl p-6 sm:p-8">
        <div className="mb-7">
          <p className="small-semibold uppercase tracking-[0.24em] text-primary-500">Welcome back</p>
          <h1 className="mt-2 h2-bold">Enter your social studio</h1>
          <p className="mt-3 text-white/[0.58] small-medium md:base-regular">Sign in to post, message, follow stories, and keep your Postgram presence moving.</p>
        </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
                  <Input type="email" className={`shad-input !pl-12 ${form.formState.errors.email ? 'border-red' : ''}`} placeholder="you@example.com" {...field} />
                </div>
              </FormControl>
              <FormMessage className={form.formState.errors.email ? 'text-red' : ''} />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Password</FormLabel>
                <Link to="/forgot-password" className="small-semibold text-primary-500 transition hover:text-white">Forgot password?</Link>
              </div>
              <FormControl>
                <div className='relative'>
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
                  <Input  type={isLocked?"password":"text"} className={`shad-input !pl-12 !pr-12 ${fieldState.invalid ? "border-red" : ""}`} placeholder="Enter your password" {...field} />
                  <button type="button" className='absolute right-4 top-1/2 -translate-y-1/2 text-white/[0.45] transition hover:text-white' onClick={()=>setIsLocked((value)=>!value)} aria-label={isLocked ? "Show password" : "Hide password"}>
                    {isLocked?<Eye size={20} />:<EyeOff size={20} />}
                  </button>
                </div>
              </FormControl>
              <FormMessage className={fieldState.invalid ? "text-red" : ""} />
            </FormItem>
          )}
        />
        <Button type="submit" className="shad-button_primary mt-2" disabled={isUserLoading}>
        {isUserLoading ? (<div className="flex flex-center gap-2"><Spinner size='sm' color="white" /> Signing in...</div>):"Sign In"}
        </Button>

        <p className="text-small-regular text-white/[0.62] text-center mt-2 ">
        Don't have an account?
        <Link to='/sign-up' className="text-primary-500 text-small-semibold ml-1">Sign Up</Link>
        </p>
      </form>
      </div>
      </div>
    </Form>
  )
}

export default SignInForm
