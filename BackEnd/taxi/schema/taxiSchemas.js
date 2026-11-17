const { z } = require('zod')

const addressSchema = z.string({ error: 'نشانی مبدأ و مقصد را وارد کنید.' })
  .trim()
  .min(3, 'نشانی باید دست‌کم ۳ نویسه باشد.')
  .max(500, 'نشانی نباید بیشتر از ۵۰۰ نویسه باشد.')

const createRideSchema = z.object({
  pickupAddress: addressSchema,
  destinationAddress: addressSchema,
  taxiType: z.enum(['standard', 'vip'], { error: 'نوع تاکسی معتبر نیست.' }),
  proposedFare: z.coerce.number({ error: 'کرایهٔ معتبر وارد کنید.' })
    .positive('کرایه باید بیشتر از صفر باشد.')
    .max(1000000, 'کرایه از حد مجاز بیشتر است.')
    .optional(),
  note: z.string({ error: 'یادداشت باید متنی باشد.' })
    .trim()
    .max(1000, 'یادداشت نباید بیشتر از ۱۰۰۰ نویسه باشد.')
    .optional()
    .default(''),
}).superRefine((value, context) => {
  if (value.taxiType === 'standard' && value.proposedFare === undefined) {
    context.addIssue({ code: 'custom', path: ['proposedFare'], message: 'کرایهٔ پیشنهادی برای تاکسی استاندارد الزامی است.' })
  }
})

const statusSchema = z.object({
  status: z.enum(['driver_arriving', 'driver_arrived', 'started', 'completed'], { error: 'وضعیت سفر معتبر نیست.' }),
})

const cancelSchema = z.object({
  reason: z.string({ error: 'دلیل لغو باید متنی باشد.' })
    .trim()
    .max(500, 'دلیل لغو نباید بیشتر از ۵۰۰ نویسه باشد.')
    .optional()
    .default(''),
})

const ratingSchema = z.object({
  score: z.coerce.number({ error: 'امتیازی از ۱ تا ۵ انتخاب کنید.' })
    .int('امتیاز باید عدد صحیح باشد.')
    .min(1, 'امتیازی از ۱ تا ۵ انتخاب کنید.')
    .max(5, 'امتیازی از ۱ تا ۵ انتخاب کنید.'),
  comment: z.string({ error: 'نظر باید متنی باشد.' })
    .trim()
    .max(500, 'نظر نباید بیشتر از ۵۰۰ نویسه باشد.')
    .optional()
    .default(''),
})

const vipFareSchema = z.object({
  fare: z.coerce.number({ error: 'کرایهٔ معتبر وارد کنید.' })
    .positive('کرایه باید بیشتر از صفر باشد.')
    .max(1000000, 'کرایه از حد مجاز بیشتر است.'),
})

const availabilitySchema = z.object({
  isOnline: z.boolean({ error: 'وضعیت آنلاین باید درست یا نادرست باشد.' }),
  isAvailable: z.boolean({ error: 'وضعیت دسترسی باید درست یا نادرست باشد.' }),
})

module.exports = { createRideSchema, statusSchema, cancelSchema, ratingSchema, vipFareSchema, availabilitySchema }