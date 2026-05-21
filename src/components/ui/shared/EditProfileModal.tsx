import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useUpdateUser } from "@/lib/react-query/queries";
import { profileValidation } from "@/lib/validators";
import { Spinner } from "@nextui-org/react";

type EditProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: any;
};

const EditProfileModal = ({ isOpen, onClose, user }: EditProfileModalProps) => {
  const { toast } = useToast();
  const { mutateAsync: updateUser, isLoading: updatingUser } = useUpdateUser();

  const form = useForm<z.infer<typeof profileValidation>>({
    resolver: zodResolver(profileValidation),
    defaultValues: {
      name: user?.name || "",
      username: user?.username || "",
      email: user?.email || "",
      bio: user?.bio || "",
      location: user?.location || "",
    },
  });

  useEffect(() => {
    if (!user) return;
    form.reset({
      name: user.name || "",
      username: user.username || "",
      email: user.email || "",
      bio: user.bio || "",
      location: user.location || "",
    });
  }, [form, user]);

  async function onSubmit(values: z.infer<typeof profileValidation>) {
    const updatedUser = await updateUser(values);
    if (!updatedUser) {
      toast({ title: "Failed to update. Try again", variant: "destructive" });
      return;
    }
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-black/70 px-4 py-8 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-dark-2 p-5 shadow-[0_24px_90px_rgba(0,0,0,0.45)] md:p-6" onClick={(event) => event.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="small-semibold uppercase tracking-[0.24em] text-primary-500">Profile</p>
            <h2 className="h3-bold">Edit profile</h2>
          </div>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-white/60 hover:text-white" onClick={onClose}>
            <X size={19} />
          </button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
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
                  <FormLabel>Username</FormLabel>
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
                    <Textarea className="shad-textarea min-h-28" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input type="text" className="shad-input" placeholder="City, country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-2 flex justify-end gap-3 border-t border-white/10 pt-5">
              <Button type="button" className="shad-button_dark_4" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={!form.formState.isValid || updatingUser} className="shad-button_primary">
                {updatingUser ? <span className="flex items-center gap-2"><Spinner size="sm" color="white" /> Saving...</span> : "Save profile"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default EditProfileModal;
