import { z } from 'zod'

export const driverApplicationSchema = z.object({
  province: z.string().trim().min(1, 'ولایت کاری را انتخاب کنید.').max(100),
  licenseNumber: z.string().trim().min(1, 'شمارهٔ جواز رانندگی را وارد کنید.').max(100),
  licenseExpiry: z.string().min(1, 'تاریخ اعتبار جواز را وارد کنید.'),
  vehicleMake: z.string().trim().min(1, 'شرکت سازندهٔ موتر را وارد کنید.').max(100),
  vehicleModel: z.string().trim().min(1, 'مدل موتر را وارد کنید.').max(100),
  vehicleYear: z.coerce.number().int().min(1900, 'سال ساخت معتبر نیست.').max(new Date().getFullYear() + 1),
  vehicleColor: z.string().trim().min(1, 'رنگ موتر را وارد کنید.').max(50),
  plateNumber: z.string().trim().min(2, 'نمبر پلیت را وارد کنید.').max(50),
})
