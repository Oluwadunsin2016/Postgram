import * as z  from "zod"


export const signUpValidation = z.object({
name:z.string().min(2, {message:'Too short'}),
  username: z.string().min(2).max(50), 
email:z.string().email(),
password:z.string().min(8, {message:'Password must be at least 8 characters'}),
})
export const signInValidation = z.object({
email:z.string().email(),
password:z.string().min(8, {message:'Password must be at least 8 characters'}),
})
export const forgotPasswordValidation = z.object({
email:z.string().email(),
})
export const resetPasswordValidation = z.object({
password:z.string().min(8, {message:'Password must be at least 8 characters'}),
confirmPassword:z.string().min(8, {message:'Password must be at least 8 characters'}),
}).refine((value) => value.password === value.confirmPassword, {
message: "Passwords do not match",
path: ["confirmPassword"],
})
export const changePasswordValidation = z.object({
currentPassword:z.string().min(8, {message:'Password must be at least 8 characters'}),
newPassword:z.string().min(8, {message:'Password must be at least 8 characters'}),
confirmPassword:z.string().min(8, {message:'Password must be at least 8 characters'}),
}).refine((value) => value.newPassword === value.confirmPassword, {
message: "Passwords do not match",
path: ["confirmPassword"],
})

export const profileValidation = z.object({
name:z.string().min(2, {message:'Too short'}),
  username: z.string().min(2).max(50), 
email:z.string().email(),
bio:z.string().min(5, {message:'Too short'}),
location:z.string().max(100).optional(),
})

export const postValidation = z.object({
imageUrl:z.string().optional(),
caption:z.string().max(2200).optional(),
file:z.array(z.custom<File>()).optional(),
location:z.string().max(100).optional(),
tags:z.string().optional(),
taggedUsers:z.array(z.string()).optional(),
}).refine((value) => Boolean(value.caption?.trim()) || Boolean(value.file?.length) || Boolean(value.imageUrl), {
message: "Add text, images, or videos before posting",
path: ["caption"],
})
