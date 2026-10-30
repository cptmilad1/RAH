const { z } = require('zod')

const updateProfileSchema = z.object({
  full_name: z.string().trim().min(2).max(100),
  username: z.string().trim().toLowerCase().min(3).max(50).regex(/^[a-z0-9_]+$/),
  phone: z.string().trim().min(7).max(30).or(z.literal('')),
  user_address: z.string().trim().max(500),
  driver_province: z.string().trim().max(100).optional(),
})

module.exports = updateProfileSchema