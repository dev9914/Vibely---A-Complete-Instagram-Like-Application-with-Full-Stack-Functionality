import * as z from 'zod'

/**
 * Validation Schemas using Zod
 * Provides type-safe form validation for the entire app
 */

// ========== AUTH SCHEMAS ==========

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(100, 'Password is too long'),
})

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(50, 'Full name is too long'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  avatar: z.instanceof(File).optional().or(z.string()).or(z.undefined()),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// ========== POST SCHEMAS ==========

export const createPostSchema = z.object({
  description: z
    .string()
    .min(1, 'Description is required')
    .max(2200, 'Description must be less than 2200 characters'),
  postImage: z.instanceof(File, {
  message: "Please select an image",
}),
})

export const commentSchema = z.object({
  text: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment must be less than 500 characters'),
})

// ========== MESSAGE SCHEMAS ==========

export const messageSchema = z.object({
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message is too long'),
})

// ========== PROFILE SCHEMAS ==========

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(50, 'Full name is too long')
    .optional(),
  email: z
    .string()
    .email('Invalid email address')
    .optional(),
  avatar: z.instanceof(File).optional(),
  coverImage: z.instanceof(File).optional(),
})

export const editProfileSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  fullName: z.string().min(1, 'Full name is required'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  bio: z.string().max(150, 'Bio must be less than 150 characters'),
  website: z.string().optional(),
  location: z.string().optional(),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// ========== TYPE EXPORTS ==========

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type CreatePostInput = z.infer<typeof createPostSchema>
export type CommentInput = z.infer<typeof commentSchema>
export type MessageInput = z.infer<typeof messageSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type EditProfileInput = z.infer<typeof editProfileSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
