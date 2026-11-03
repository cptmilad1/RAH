import { z } from 'zod'

export const profileEditSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, 'نام باید دست‌کم ۲ نویسه باشد.')
    .max(100, 'نام نمی‌تواند بیشتر از ۱۰۰ نویسه باشد.'),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'نام کاربری باید دست‌کم ۳ نویسه باشد.')
    .max(50, 'نام کاربری نمی‌تواند بیشتر از ۵۰ نویسه باشد.')
    .regex(/^[a-z0-9_]+$/, 'نام کاربری فقط می‌تواند شامل حروف انگلیسی، عدد و _ باشد.'),
  phone: z.string().trim().refine((value) => value === '' || (value.length >= 7 && value.length <= 30), {
    message: 'شماره تماس باید بین ۷ تا ۳۰ نویسه باشد.',
  }),
  user_address: z.string().trim().max(500, 'نشانی نمی‌تواند بیشتر از ۵۰۰ نویسه باشد.'),
  driver_province: z.string().trim().max(100).optional(),
})

export const driverProfileEditSchema = profileEditSchema.extend({
  driver_province: z.string().trim().min(1, 'ولایت کاری را انتخاب کنید.').max(100),
})