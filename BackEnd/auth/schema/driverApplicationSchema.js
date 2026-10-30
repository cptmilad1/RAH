const { z } = require('zod')

module.exports = z.object({
  province: z.string().trim().min(1).max(100),
  licenseNumber: z.string().trim().min(1).max(100),
  licenseExpiry: z.string().date(),
  vehicleMake: z.string().trim().min(1).max(100),
  vehicleModel: z.string().trim().min(1).max(100),
  vehicleYear: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1),
  vehicleColor: z.string().trim().min(1).max(50),
  plateNumber: z.string().trim().min(2).max(50),
})
