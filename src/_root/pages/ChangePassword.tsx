import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useChangePassword } from "@/lib/react-query/queries";
import { changePasswordValidation } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { Spinner } from "@nextui-org/react";
import { Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const PasswordField = ({ control, name, label, placeholder }: any) => {
  const [show, setShow] = useState(false);

  return (
    <FormField control={control} name={name} render={({ field }: any) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
            <Input type={show ? "text" : "password"} className="shad-input !pl-12 !pr-12" placeholder={placeholder} {...field} />
            <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-white/[0.45] transition hover:text-white" onClick={() => setShow((value) => !value)} aria-label={show ? "Hide password" : "Show password"}>
              {show ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </FormControl>
        <FormMessage className="text-red" />
      </FormItem>
    )} />
  );
};

const ChangePassword = () => {
  const { toast } = useToast();
  const { mutateAsync, isLoading } = useChangePassword();
  const form = useForm<z.infer<typeof changePasswordValidation>>({
    resolver: zodResolver(changePasswordValidation),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (values: z.infer<typeof changePasswordValidation>) => {
    const response = await mutateAsync(
      { currentPassword: values.currentPassword, newPassword: values.newPassword },
      { onError: (error: any) => toast({ variant: "destructive", title: error.message, className: "bg-red border-none" }) }
    );

    if (response?.message) {
      toast({ title: response.message });
      form.reset();
    }
  };

  return (
    <div className="common-container">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div className="content-panel rounded-3xl p-6 sm:p-8">
          <div className="mb-7 flex items-start gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-500/15 text-primary-500">
              <ShieldCheck size={24} />
            </span>
            <div>
              <p className="small-semibold uppercase tracking-[0.24em] text-primary-500">Security</p>
              <h1 className="mt-2 h2-bold">Change password</h1>
              <p className="mt-2 text-white/[0.58] small-medium md:base-regular">Update your password while you are signed in. We will ask for your current password first.</p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <PasswordField control={form.control} name="currentPassword" label="Current password" placeholder="Enter your current password" />
              <PasswordField control={form.control} name="newPassword" label="New password" placeholder="At least 8 characters" />
              <PasswordField control={form.control} name="confirmPassword" label="Confirm new password" placeholder="Repeat new password" />

              <Button type="submit" className="shad-button_primary mt-2" disabled={isLoading}>
                {isLoading ? <span className="flex flex-center gap-2"><Spinner size="sm" color="white" /> Updating...</span> : "Update password"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
