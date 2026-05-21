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
import { useUserContext } from "@/context/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { useCreatePost, useGetAllUsers, useUpdatePost } from "@/lib/react-query/queries"
import { Image, Loader2, MapPin, Search, Send, Tag, Type, UserPlus, X } from "lucide-react"
import { useCallback, useMemo, useState } from "react"
 
type PostFormProps={
post?:any;
action:'Create'|'Update'
onSuccess?:()=>void;
onCancel?:()=>void;
}

const PostForm = ({post,action,onSuccess,onCancel}:PostFormProps) => {
const {mutateAsync:createPost,isLoading:isLoadingCreate}=useCreatePost()
const {mutateAsync:updatePost,isLoading:isLoadingUpdate}=useUpdatePost()
const {data:users=[]}=useGetAllUsers()

const {user} = useUserContext()
const {toast}=useToast()
const navigate =useNavigate()
const [taggedUserSearch, setTaggedUserSearch] = useState("");
const initialExistingMedia = post?.media?.length
  ? post.media
  : post?.imageUrl
    ? [{ url: post.imageUrl, type: "image" as const, name: "Current post media" }]
    : [];
const [existingMedia, setExistingMedia] = useState(initialExistingMedia);
const handleExistingMediaChange = useCallback((media: typeof initialExistingMedia) => {
  setExistingMedia(media);
}, []);

const form = useForm<z.infer<typeof postValidation>>({
    resolver: zodResolver(postValidation),
    defaultValues: {
      caption: post ? post?.caption || "" : "",
      location: post ? post?.location || "" : "",
      imageUrl: post ? post?.imageUrl || "" : "",
      file: [],
      tags: post ? post?.tags?.join(",") || "" : "",
      taggedUsers: post?.taggedUsers?.map((taggedUser:any) => taggedUser?._id || taggedUser) || [],
    },
  })
const captionValue = form.watch("caption") || "";
const selectedFiles = form.watch("file") || [];
const taggedUserIds = form.watch("taggedUsers") || [];
const isSubmitting = isLoadingCreate || isLoadingUpdate;
const selectedTaggedUsers = useMemo(
  () => users.filter((creator:any) => taggedUserIds.includes(creator._id)),
  [taggedUserIds, users]
);
const taggableUsers = useMemo(() => {
  const searchValue = taggedUserSearch.trim().toLowerCase();
  return users
    .filter((creator:any) => creator._id !== user?._id && !taggedUserIds.includes(creator._id))
    .filter((creator:any) => {
      if (!searchValue) return true;
      return creator.name?.toLowerCase().includes(searchValue) || creator.username?.toLowerCase().includes(searchValue);
    })
    .slice(0, 6);
}, [taggedUserIds, taggedUserSearch, user?._id, users]);

const addTaggedUser = (creatorId:string) => {
  form.setValue("taggedUsers", [...taggedUserIds, creatorId], { shouldDirty: true, shouldValidate: true });
  setTaggedUserSearch("");
};

const removeTaggedUser = (creatorId:string) => {
  form.setValue("taggedUsers", taggedUserIds.filter((id:string) => id !== creatorId), { shouldDirty: true, shouldValidate: true });
};
 
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof postValidation>) {
if (post && action==='Update') {
   const updatedPost=await updatePost({
   ...values,
   postId:post._id,
   imageUrl:post?.imageUrl,
   existingMedia,
   })

   if (!updatedPost) {
    toast({title:'Please, try again'})
   }

   if (onSuccess) {
    onSuccess()
    return
   }

   return navigate(`/posts/${post._id}`)
}

   const newPost=await createPost({
   ...values,
   userId:user._id
   })
   if (!newPost) toast({title:'Please try again'})
    if (onSuccess) onSuccess()
    else navigate('/')
  }
  return (
     <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-6xl">
        <section className="content-panel rounded-3xl p-5 md:p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="small-semibold uppercase tracking-[0.22em] text-white/35">Composer</p>
              <h2 className="body-bold">{action === "Create" ? "New feed post" : "Update feed post"}</h2>
            </div>
            <span className="rounded-full bg-primary-500/10 px-3 py-1 text-primary-500 small-semibold">
              {selectedFiles.length || post?.media?.length || post?.imageUrl ? "Media post" : captionValue.trim() ? "Text post" : "Draft"}
            </span>
          </div>

          <div className="flex flex-col gap-6">
            <FormField
              control={form.control}
              name="caption"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-white/80">
                    <Type size={16} className="text-primary-500" />
                    Caption
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="shad-textarea min-h-[11rem] custom-scrollbar"
                      placeholder="What do you want to share?"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex items-center justify-between">
                    <FormMessage className="shad-form_messsage" />
                    <span className="tiny-medium text-white/35">{captionValue.length}/2200</span>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-white/80">
                    <Image size={16} className="text-primary-500" />
                    Media
                  </FormLabel>
                  <FormControl>
                    <FileUploader
                      fieldChange={field.onChange}
                      mediaUrl={post?.imageUrl}
                      media={post?.media || []}
                      existingMediaChange={action === "Update" ? handleExistingMediaChange : undefined}
                    />
                  </FormControl>
                  <FormMessage className="shad-form_messsage" />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-white/80">
                      <MapPin size={16} className="text-primary-500" />
                      Location
                    </FormLabel>
                    <FormControl>
                      <Input type="text" className="shad-input" placeholder="Add a location"  {...field}/>
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
                    <FormLabel className="flex items-center gap-2 text-white/80">
                      <Tag size={16} className="text-primary-500" />
                      Tags
                    </FormLabel>
                    <FormControl>
                      <Input type="text" className="shad-input" placeholder="travel, design, moments"  {...field}/>
                    </FormControl>
                    <FormMessage className="shad-form_messsage" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="taggedUsers"
              render={() => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-white/80">
                    <UserPlus size={16} className="text-primary-500" />
                    Tag people
                  </FormLabel>
                  <div className="rounded-2xl border border-dark-4 bg-dark-3/70 p-3">
                    {selectedTaggedUsers.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {selectedTaggedUsers.map((creator:any) => (
                          <button
                            key={creator._id}
                            type="button"
                            onClick={() => removeTaggedUser(creator._id)}
                            className="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 py-1 pl-1 pr-3 text-light-1 small-medium"
                          >
                            <img
                              src={creator?.imageUrl || "/assets/images/default_user_image.png"}
                              alt={creator?.name || "Tagged user"}
                              className="h-7 w-7 rounded-full object-cover"
                            />
                            <span>{creator.name}</span>
                            <X size={13} className="text-light-3" />
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 rounded-xl border border-dark-4 bg-dark-2 px-3">
                      <Search size={16} className="text-light-4" />
                      <input
                        type="text"
                        value={taggedUserSearch}
                        onChange={(event) => setTaggedUserSearch(event.target.value)}
                        placeholder="Search people to tag"
                        className="h-11 flex-1 bg-transparent text-light-1 outline-none placeholder:text-light-4 small-regular"
                      />
                    </div>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {taggableUsers.map((creator:any) => (
                        <button
                          key={creator._id}
                          type="button"
                          onClick={() => addTaggedUser(creator._id)}
                          className="flex items-center gap-3 rounded-xl p-2 text-left transition hover:bg-dark-4"
                        >
                          <img
                            src={creator?.imageUrl || "/assets/images/default_user_image.png"}
                            alt={creator?.name || "Creator"}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                          <span className="min-w-0">
                            <span className="block truncate text-light-1 small-semibold">{creator.name}</span>
                            <span className="block truncate text-light-4 tiny-medium">@{creator.username}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <FormMessage className="shad-form_messsage" />
                </FormItem>
              )}
            />
          </div>

          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-dark-4 pt-5 sm:flex-row sm:justify-end">
            <Button type="button" className='shad-button_dark_4 gap-2' onClick={() => onCancel ? onCancel() : navigate(-1)}>
              <X size={17} />
              Cancel
            </Button>
            <Button type="submit" className="shad-button_primary gap-2 white-space-nowrap" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
              {isSubmitting ? "Publishing..." : `${action} Post`}
            </Button>
          </div>
        </section>
      </form>
    </Form>
  )
}

export default PostForm
