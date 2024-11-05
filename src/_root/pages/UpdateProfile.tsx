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
import { Link, useNavigate, useParams } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { useCreateUserAccount, useGetUserPosts, useSignInAccount } from "@/lib/react-query/queriesAndMutation"
import { useUserContext } from "@/context/AuthContext"
import Loader from "@/components/ui/shared/Loader"
import { profileValidation } from "@/lib/validators"
import { Textarea } from "@/components/ui/textarea"
import { IUser } from "@/types"
import { useChangeProfilePhoto, useGetUserProfile, useUpdateUser } from "@/lib/react-query/queries"
 

const UpdateProfile = () => {
  const { toast } = useToast()
  const navigate =useNavigate()
  const {mutateAsync:updateUser, isLoading:updatingUser}=useUpdateUser()
  const {mutateAsync:changeProfilePhoto, isLoading:isPhotoUploading}=useChangeProfilePhoto()

 const {id}=useParams()
  console.log(id);
  
  const {
  data:user,
  isLoading: isUserLoading,
} = useGetUserProfile(id||'');

  

  // 1. Define your form.
  const form = useForm<z.infer<typeof profileValidation>>({
    resolver: zodResolver(profileValidation),
    defaultValues: {
      imageUrl: user?.imageUrl,
      name: user?.name,
      username: user?.username,
      email: user?.email,
      bio: user?.bio?? "",
    },
  })
  // console.log(user);
 
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof profileValidation>) {

  console.log(values);
  
  const updatedUser= await updateUser(values) 

console.log(updatedUser);

  if (updatedUser) {
    form.reset()
    navigate('/')
  }else{
  toast({title:'Failed to update. Try again'})
  }
  }

  const selectPhoto=async(e:any)=>{
  console.log(e.target.files[0])
  const result=await changeProfilePhoto({file:e.target.files[0],userId:user?._id||''})
  console.log(result);
    if (result) {
    navigate(`/profile/${id}`)
  }else{
  toast({title:'Failed to update. Try again', variant:'destructive', className:'bg-red border-none'})
  }
  
  }
  return (
      <Form {...form}>
      <div className="flex flex-col flex-1 items-center gap-10 overflow-scroll py-10 px-5 md:px-8 lg:p-14 custom-scrollbar">
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

           <div className="w-full flex gap-2 items-center">
           <div className="relative group w-[6rem] h-[6rem] rounded-full overflow-hidden">
           
      <img
        src={user?.imageUrl || "/assets/icons/profile-placeholder.svg"}
        alt="creator"
        className="w-full h-full object-cover"
      />
      {isPhotoUploading?
      <div className="bg-slate-500/70 top-0 left-0 absolute w-full h-full z-20 flex items-center justify-center  cursor-pointer">
       <Loader/>
      </div>:
      <label htmlFor="profile_image" className="bg-slate-500/70 top-0 left-0 absolute w-full h-full z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center  cursor-pointer">
       <img
        src="/assets/icons/camera.svg"
        alt="camera"
        width={25}
        height={25}
        className="text-white"
      />
      <input id="profile_image" className="hidden" type="file" onChange={selectPhoto} />
      </label>
      }
           </div>
        <p className="body-bold text-blue-500">Change profile photo</p>
    </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full mt-4">
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
        
        <Loader/> Loading...
        </div>):"Update Profile"}
        </Button>
     </div>
      </form>
      </div>
    </Form>
  )
}

export default UpdateProfile