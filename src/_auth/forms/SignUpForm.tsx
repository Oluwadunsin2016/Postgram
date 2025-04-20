import { z } from "zod"
import {useState} from 'react'
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
import {signUpValidation} from '../../lib/validators'
import Loader from "@/components/ui/shared/Loader"
import { Link, useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { useUserContext } from "@/context/AuthContext"
import { useCreateUser, useSignInUser } from "@/lib/react-query/queries"
import { Spinner } from "@nextui-org/react"
 

const SignUpForm = () => {
const [isLocked,setIsLocked]=useState(true)
const [isCreatingAccount, setIsCreatingAccount] = useState(false)
  const { toast } = useToast()
  const navigate =useNavigate()
  // const {mutateAsync:createUserAccount, isPending:isCreatingAccount}=useCreateUserAccount()
  const {mutateAsync:createUserAccount,}=useCreateUser()
  const {mutateAsync:signInUser}=useSignInUser()

  const {checkAuthUser}=useUserContext()

  // 1. Define your form.
  const form = useForm<z.infer<typeof signUpValidation>>({
    resolver: zodResolver(signUpValidation),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
    },
  })
 
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof signUpValidation>) {
  setIsCreatingAccount(true)
  const newUser= await createUserAccount(values,{
  onError:(error:any)=>{
  toast({variant:'destructive',title:error.message,className: "bg-red border-none",})
  setIsCreatingAccount(false)
  }
  }) 
console.log(newUser);

  // console.log(newUser)
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
      <div className="sm:w-420 flex flex-center flex-col">
      <img src="/assets/images/Logo-removebg-preview.png" alt="logo" height={80} width={280} />

      <h2 className="h3-bold md:h2-bold ">Create a new account</h2>
      <p className="text-light-3 small-medium md:base-regular mt-4">To use Snapgram,please enter your details</p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 md:gap-2 w-full mt-4 md:mt-0">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input type="text" className={`shad-input ${form.formState.errors.name ? 'border-red' : ''}`} {...field} />
              </FormControl>
              <FormMessage className={form.formState.errors.name ? 'text-red' : ''} />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User Name</FormLabel>
              <FormControl>
                <Input type="text" className={`shad-input ${form.formState.errors.username ? 'border-red' : ''}`} {...field} />
              </FormControl>
              <FormMessage className={form.formState.errors.username ? 'text-red' : ''} />
            </FormItem>
          )}
        />
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
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type={isLocked?"password":"text"} className={`shad-input ${form.formState.errors.password ? 'border-red' : ''}`} {...field} />
              </FormControl>
              <FormMessage className={form.formState.errors.password ? 'text-red' : ''} />
            </FormItem>
          )}
        />
        <div className='absolute top-11 right-4 cursor-pointer'>
        {isLocked?<img src="/assets/icons/lock.svg" alt="lock" width={22} height={22} onClick={()=>setIsLocked(false)} />:<img src="/assets/icons/unlock.svg" alt="unlock" width={22} height={22} onClick={()=>setIsLocked(true)} />}
        </div>
        </div>
        <Button type="submit" className="shad-button_primary mt-4">
        {isCreatingAccount ? (<div className="flex flex-center gap-2">
        
          <Spinner size='sm' color="white" /> Loading...
        </div>):"Sign Up"}
        </Button>

        <p className="text-small-regular text-light-2 text-center mt-2 ">
        Already have an account?
        <Link to='/sign-in' className="text-primary-500 text-small-semibold ml-1">Log In</Link>
        </p>
      </form>
      </div>
    </Form>
  )
}

export default SignUpForm