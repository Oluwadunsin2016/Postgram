import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useResetPassword } from "@/lib/react-query/queries"
import { resetPasswordValidation } from "@/lib/validators"
import { zodResolver } from "@hookform/resolvers/zod"
import { Spinner } from "@nextui-org/react"
import { Eye, EyeOff, Lock } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useNavigate, useParams } from "react-router-dom"
import { z } from "zod"

const ResetPasswordForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { token = "" } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { mutateAsync, isLoading } = useResetPassword()
  const form = useForm<z.infer<typeof resetPasswordValidation>>({
    resolver: zodResolver(resetPasswordValidation),
    defaultValues: { password: "", confirmPassword: "" },
  })

  const onSubmit = async (values: z.infer<typeof resetPasswordValidation>) => {
    const response = await mutateAsync({ token, password: values.password }, {
      onError: (error: any) => toast({ variant: "destructive", title: error.message, className: "bg-red border-none" }),
    })
    if (response?.token) {
      toast({ title: "Password updated successfully" })
      navigate("/")
    }
  }

  return (
    <Form {...form}>
      <div className="w-full max-w-[29rem]">
        <div className="content-panel rounded-3xl p-6 sm:p-8">
          <p className="small-semibold uppercase tracking-[0.24em] text-primary-500">New password</p>
          <h1 className="mt-2 h2-bold">Secure your account</h1>
          <p className="mt-3 text-white/[0.58] small-medium md:base-regular">
            Choose a password that is at least 8 characters and hard to guess.
          </p>

          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-7 flex flex-col gap-5">
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
                    <Input type={showPassword ? "text" : "password"} className="shad-input !pl-12 !pr-12" placeholder="New password" {...field} />
                    <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-white/[0.45] transition hover:text-white" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-red" />
              </FormItem>
            )} />

            <FormField control={form.control} name="confirmPassword" render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
                    <Input type={showConfirmPassword ? "text" : "password"} className="shad-input !pl-12 !pr-12" placeholder="Confirm new password" {...field} />
                    <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-white/[0.45] transition hover:text-white" onClick={() => setShowConfirmPassword((value) => !value)} aria-label={showConfirmPassword ? "Hide password" : "Show password"}>
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-red" />
              </FormItem>
            )} />

            <Button type="submit" className="shad-button_primary" disabled={isLoading || !token}>
              {isLoading ? <span className="flex flex-center gap-2"><Spinner size="sm" color="white" /> Updating...</span> : "Reset password"}
            </Button>
          </form>

          <p className="mt-6 text-center text-white/60 small-regular">
            Remembered it?
            <Link to="/sign-in" className="ml-1 text-primary-500 small-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </Form>
  )
}

export default ResetPasswordForm
