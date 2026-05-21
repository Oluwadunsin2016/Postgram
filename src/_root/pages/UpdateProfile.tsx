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
import { useNavigate, useParams } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import Loader from "@/components/ui/shared/Loader"
import { profileValidation } from "@/lib/validators"
import { Textarea } from "@/components/ui/textarea"
import { useGetUserProfile, useUpdateUser } from "@/lib/react-query/queries"
import { useEffect } from "react"
import { Spinner } from "@nextui-org/react"
 

const UpdateProfile = () => {
  const { toast } = useToast()
  const navigate =useNavigate()
  const {mutateAsync:updateUser, isLoading:updatingUser}=useUpdateUser()

 const {id}=useParams()
  
  const {
  data:user,
  isLoading: isUserLoading,
} = useGetUserProfile(id||'');

  

  // 1. Define your form.
  const form = useForm<z.infer<typeof profileValidation>>({
    resolver: zodResolver(profileValidation),
    defaultValues: {
      name: user?.name,
      username: user?.username,
      email: user?.email,
      bio: user?.bio?? "",
    },
  })

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
        bio: user.bio || "",
      });
    }
  }, [form, user]);
 
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof profileValidation>) {
  
  const updatedUser= await updateUser(values) 

  if (updatedUser) {
    form.reset()
    navigate('/')
  }else{
  toast({title:'Failed to update. Try again'})
  }
  }

  if (isUserLoading) return <Loader />;

  return (
      <Form {...form}>
      <div className="common-container">
         <div className="max-w-5xl flex-start gap-2 justify-start w-full ">
          <img
            src="/assets/icons/edit.svg"
            width={36}
            height={36}
            alt="add"
            className="invert-white"
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">Edit Profile</h2>
        </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full max-w-5xl flex-col gap-5 mt-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input type="text" className="shad-input" {...field} />
              </FormControl>
              <FormMessage />
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
                <Input type="text" className="shad-input" {...field} />
              </FormControl>
              <FormMessage />
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
                <Input type="email" className="shad-input" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Biography</FormLabel>
              <FormControl>
                <Textarea cols={4} className="shad-textarea" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
     <div className="flex justify-end">
        <Button type="submit" disabled={!form.formState.isValid || updatingUser} className="shad-button_primary white-space-nowrap">
        {updatingUser ? (<div className="flex flex-center gap-2">
        <Spinner size="sm" color="white" /> Loading...
        </div>):"Update Profile"}
        </Button>
     </div>
      </form>
      </div>
    </Form>
  )
}

export default UpdateProfile
