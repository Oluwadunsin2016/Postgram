import { z } from "zod"
import {useState} from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {signUpValidation} from '../../lib/validators'
import { Link, useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { useUserContext } from "@/context/AuthContext"
import { useCreateUser, useSignInUser } from "@/lib/react-query/queries"
import { Spinner } from "@nextui-org/react"
import { AtSign, Eye, EyeOff, Lock, Mail, User } from "lucide-react"
import BrandLogo from "@/components/ui/shared/BrandLogo"

const SignUpForm = () => {
const [isLocked,setIsLocked]=useState(true)
const [isCreatingAccount, setIsCreatingAccount] = useState(false)
  const { toast } = useToast()
  const navigate =useNavigate()
  const {mutateAsync:createUserAccount}=useCreateUser()
  const {mutateAsync:signInUser}=useSignInUser()
  const {checkAuthUser}=useUserContext()

  const form = useForm<z.infer<typeof signUpValidation>>({
    resolver: zodResolver(signUpValidation),
    defaultValues: { name: "", username: "", email: "", password: "" },
  })

  async function onSubmit(values: z.infer<typeof signUpValidation>) {
  setIsCreatingAccount(true)
  const newUser= await createUserAccount(values,{
  onError:(error:any)=>{
  toast({variant:'destructive',title:error.message,className: "bg-red border-none",})
  setIsCreatingAccount(false)
  }
  })
  if(!newUser) return toast({title:'Sign up failed. Please try again.'})

  const session = await signInUser({email:values.email,password:values.password})
  if(!session) return toast({title:'Sign in failed, Please try again'})
 const isUserLoggedIn= await checkAuthUser()

  if (isUserLoggedIn) {
  setIsCreatingAccount(false)
    form.reset()
    navigate('/')
  }else{
  toast({title:'Sign in failed. Try again'})
  setIsCreatingAccount(false)
  }
  }
  return (
      <Form {...form}>
      <div className="w-full max-w-[30rem]">
      <div className="mb-8 lg:hidden">
        <BrandLogo />
      </div>

      <div className="content-panel rounded-3xl p-6 sm:p-8">
      <div className="mb-7">
        <p className="small-semibold uppercase tracking-[0.24em] text-primary-500">Create account</p>
        <h1 className="mt-2 h2-bold">Build your Postgram identity</h1>
        <p className="mt-3 text-white/[0.58] small-medium md:base-regular">Start posting, sharing statuses, and connecting with people who follow your work.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col gap-4">
        <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl><div className="relative"><User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" /><Input type="text" className={`shad-input !pl-12 ${form.formState.errors.name ? 'border-red' : ''}`} placeholder="Your display name" {...field} /></div></FormControl>
              <FormMessage className={form.formState.errors.name ? 'text-red' : ''} />
            </FormItem>
          )}
        />
        <FormField control={form.control} name="username" render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl><div className="relative"><AtSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" /><Input type="text" className={`shad-input !pl-12 ${form.formState.errors.username ? 'border-red' : ''}`} placeholder="postgram_creator" {...field} /></div></FormControl>
              <FormMessage className={form.formState.errors.username ? 'text-red' : ''} />
            </FormItem>
          )}
        />
        <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl><div className="relative"><Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" /><Input type="email" className={`shad-input !pl-12 ${form.formState.errors.email ? 'border-red' : ''}`} placeholder="you@example.com" {...field} /></div></FormControl>
              <FormMessage className={form.formState.errors.email ? 'text-red' : ''} />
            </FormItem>
          )}
        />
        <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className='relative'>
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
                  <Input type={isLocked?"password":"text"} className={`shad-input !pl-12 !pr-12 ${form.formState.errors.password ? 'border-red' : ''}`} placeholder="At least 8 characters" {...field} />
                  <button type="button" className='absolute right-4 top-1/2 -translate-y-1/2 text-white/[0.45] transition hover:text-white' onClick={()=>setIsLocked((value)=>!value)} aria-label={isLocked ? "Show password" : "Hide password"}>
                    {isLocked?<Eye size={20} />:<EyeOff size={20} />}
                  </button>
                </div>
              </FormControl>
              <FormMessage className={form.formState.errors.password ? 'text-red' : ''} />
            </FormItem>
          )}
        />
        <Button type="submit" className="shad-button_primary mt-3" disabled={isCreatingAccount}>
        {isCreatingAccount ? (<div className="flex flex-center gap-2"><Spinner size='sm' color="white" /> Creating...</div>):"Create Account"}
        </Button>

        <p className="text-small-regular text-white/[0.62] text-center mt-2 ">
        Already have an account?
        <Link to='/sign-in' className="text-primary-500 text-small-semibold ml-1">Log In</Link>
        </p>
      </form>
      </div>
      </div>
    </Form>
  )
}

export default SignUpForm
