import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
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
import { Textarea } from "../ui/textarea"
import FileUploader from "../ui/shared/FileUploader"
import { postValidation } from "@/lib/validators"
import { Models } from "appwrite"
import { useUserContext } from "@/context/AuthContext"
// import { useUpdatePost } from "@/lib/react-query/queriesAndMutation"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { useCreatePost, useUpdatePost } from "@/lib/react-query/queries"
 
type PostFormProps={
post?:Models.Document;
action:'Create'|'Update'
}

const PostForm = ({post,action}:PostFormProps) => {
const {mutateAsync:createPost,isLoading:isLoadingCreate}=useCreatePost()
const {mutateAsync:updatePost,isLoading:isLoadingUpdate}=useUpdatePost()

const {user} = useUserContext()
const {toast}=useToast()
const navigate =useNavigate()

const form = useForm<z.infer<typeof postValidation>>({
    resolver: zodResolver(postValidation),
    defaultValues: {
      caption: post ? post?.caption:"",
      location: post ? post?.location:"",
      imageUrl:post?post?.imageUrl:'',
      tags: post ? post?.tags.join(','):"",
    },
  })
 
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof postValidation>) {
if (post && action==='Update') {
   const updatedPost=await updatePost({
   ...values,
   postId:post._id,
   imageUrl:post?.imageUrl
   })

   if (!updatedPost) {
    toast({title:'Please, try again'})
   }

   return navigate(`/posts/${post._id}`)
}

   const newPost=await createPost({
   ...values,
   userId:user._id
   })
   if (!newPost) toast({title:'Please try again'})
    navigate('/')
  }
  return (
     <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-9 !w-full max-w-5xl">
        <FormField
          control={form.control}
          name="caption"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Caption</FormLabel>
              <FormControl>
                <Textarea className="shad-textarea custom-scrollbar" {...field} />
              </FormControl>
              <FormMessage className="shad-form_messsage" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Add Photos</FormLabel>
              <FormControl>
                <FileUploader fieldChange={field.onChange} mediaUrl={post?.imageUrl} />
              </FormControl>
              <FormMessage className="shad-form_messsage" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Add Location</FormLabel>
              <FormControl>
                <Input type="text" className="shad-input"  {...field}/>
              </FormControl>
              <FormMessage className="shad-form_messsage" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add Tags (separated by comma " , ")</FormLabel>
              <FormControl>
                <Input type="text" className="shad-input" placeholder="JS, React, NextJs"  {...field}/>
              </FormControl>
              <FormMessage className="shad-form_messsage" />
            </FormItem>
          )}
        />
        <div className="flex gap-4 text-center justify-end">
        <Button type="button" className='shad-button_dark_4'>Cancel</Button>
        <Button type="submit" className="shad-button_primary white-space-nowrap" disabled={isLoadingCreate||isLoadingUpdate}>{isLoadingCreate||isLoadingUpdate?'Loading...':`${action} Post` }</Button>
        </div>
      </form>
    </Form>
  )
}

export default PostForm