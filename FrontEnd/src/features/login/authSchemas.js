import { z } from 'zod'

const emailField = z
  .string()
  .trim()
  .email('نشانی ایمیل معتبر نیست.')

const passwordField = z
  .string()
  .min(8, 'گذرواژه باید دست‌کم ۸ نویسه باشد.')
  .max(72, 'گذرواژه نمی‌تواند بیشتر از ۷۲ نویسه باشد.')

export const loginSchema = z.object({
  email: emailField,
  password: passwordField,
})

export const signupSchema = z.object({
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
  email: emailField,
  phone: z
    .string()
    .trim()
    .refine((value) => value === '' || (value.length >= 7 && value.length <= 30), {
      message: 'شمارهٔ تماس باید بین ۷ تا ۳۰ نویسه باشد.',
    }),
  password: passwordField,
})

export const verificationSchema = z.object({
  code: z
    .string()
    .regex(/^\d{6}$/, 'کد تأیید باید دقیقاً ۶ رقم باشد.'),
})

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(1, 'کد بازیابی را وارد کنید.'),
  password: passwordField,
})
