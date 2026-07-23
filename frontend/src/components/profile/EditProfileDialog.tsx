import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDispatch } from 'react-redux'
import { Camera, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { editProfileSchema, type EditProfileInput } from '@/lib/validations'
import {
  useUpdateProfileMutation,
  useUpdateAvatarMutation,
  type User,
} from '@/services/userApi'
import { setUser } from '@/store/authSlice'

interface EditProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
}

const mapUserToAuth = (user: User) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  fullName: user.fullName,
  avatar: user.avatar,
  coverImage: user.coverImage,
  followers: user.followers,
  following: user.following,
  noOfFollower: Number(user.noOfFollower),
  noOfFollowing: Number(user.noOfFollowing),
})

export function EditProfileDialog({
  open,
  onOpenChange,
  user,
}: EditProfileDialogProps) {
  const dispatch = useDispatch()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [updateProfile, { isLoading: isUpdatingProfile }] =
    useUpdateProfileMutation()
  const [updateAvatar, { isLoading: isUpdatingAvatar }] =
    useUpdateAvatarMutation()

  const isSaving = isUpdatingProfile || isUpdatingAvatar

  const form = useForm<EditProfileInput>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      username: '',
      fullName: '',
      email: '',
      bio: '',
      website: '',
      location: '',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        username: user.username || '',
        fullName: user.fullName || '',
        email: user.email || '',
        bio: user.bio || '',
        website: user.website || '',
        location: user.location || '',
      })
      setAvatarFile(null)
      setAvatarPreview(null)
      setSubmitError(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [open, user, form])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const onSubmit = async (data: EditProfileInput) => {
    setSubmitError(null)

    try {
      let latestUser = user

      if (avatarFile) {
        const formData = new FormData()
        formData.append('avatar', avatarFile)
        const avatarResult = await updateAvatar(formData).unwrap()
        latestUser = avatarResult.user
      }

      const profileResult = await updateProfile({
        username: data.username,
        fullName: data.fullName,
        email: data.email,
        bio: data.bio,
        website: data.website || undefined,
        location: data.location || undefined,
      }).unwrap()

      dispatch(setUser(mapUserToAuth(profileResult.user ?? latestUser)))

      toast('Profile updated', {
        description: 'Your changes have been saved.',
      })
      onOpenChange(false)
    } catch (error: unknown) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        'Failed to update profile. Please try again.'
      setSubmitError(message)
      toast('Unable to save profile', { description: message })
    }
  }

  const displayAvatar = avatarPreview || user.avatar

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0">
        <DialogHeader className="p-4 border-b border-border">
          <DialogTitle className="text-center font-semibold">
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="p-4 space-y-4"
            >
              {submitError && (
                <Alert variant="destructive">
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <Avatar className="w-20 h-20 ring-2 ring-border">
                    <AvatarImage
  src={displayAvatar}
  className="h-full w-full object-cover"
/>
                    <AvatarFallback className="text-2xl">
                      {user.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    disabled={isSaving}
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSaving}
                >
                  Change profile photo
                </Button>
              </div>

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full name" {...field} />
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
                      <Input placeholder="Username" {...field} />
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
                      <Input
                        type="email"
                        placeholder="Email"
                        {...field}
                      />
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
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Bio"
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="Website" {...field} />
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
                      <Input placeholder="Location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-2 sm:justify-center">
                <Button type="submit" className="w-full sm:w-auto" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
