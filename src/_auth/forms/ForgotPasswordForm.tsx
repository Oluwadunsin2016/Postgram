import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useForgotPassword } from "@/lib/react-query/queries"
import { forgotPasswordValidation } from "@/lib/validators"
import { zodResolver } from "@hookform/resolvers/zod"
import { Spinner } from "@nextui-org/react"
import { ArrowLeft, Mail } from "lucide-react"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import { z } from "zod"

const ForgotPasswordForm = () => {
  const { toast } = useToast()
  const { mutateAsync, isLoading } = useForgotPassword()
  const form = useForm<z.infer<typeof forgotPasswordValidation>>({
    resolver: zodResolver(forgotPasswordValidation),
    defaultValues: { email: "" },
  })

  const onSubmit = async (values: z.infer<typeof forgotPasswordValidation>) => {
    const response = await mutateAsync(values.email, {
      onError: (error: any) => toast({ variant: "destructive", title: error.message, className: "bg-red border-none" }),
    })
    toast({ title: response?.message || "Password reset instructions prepared" })
  }

  return (
    <Form {...form}>
      <div className="w-full max-w-[29rem]">
        <div className="content-panel rounded-3xl p-6 sm:p-8">
          <Link to="/sign-in" className="mb-7 inline-flex items-center gap-2 text-white/55 transition hover:text-white small-semibold">
            <ArrowLeft size={17} />
            Back to sign in
          </Link>
          <p className="small-semibold uppercase tracking-[0.24em] text-primary-500">Account recovery</p>
          <h1 className="mt-2 h2-bold">Forgot your password?</h1>
          <p className="mt-3 text-white/[0.58] small-medium md:base-regular">
            Enter your email and we’ll prepare a reset link for your account.
          </p>

          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-7 flex flex-col gap-5">
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
                    <Input type="email" className="shad-input !pl-12" placeholder="you@example.com" {...field} />
                  </div>
                </FormControl>
                <FormMessage className="text-red" />
              </FormItem>
            )} />

            <Button type="submit" className="shad-button_primary" disabled={isLoading}>
              {isLoading ? <span className="flex flex-center gap-2"><Spinner size="sm" color="white" /> Preparing...</span> : "Send reset link"}
            </Button>
          </form>

          <p className="mt-6 text-center text-white/50 small-regular">For security, the reset link is only sent to the email owner.</p>
        </div>
      </div>
    </Form>
  )
}

export default ForgotPasswordForm
