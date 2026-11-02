const { z } = require('zod')

const resetPasswordSchema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/i),
  newPassword: z.string().min(8).max(72),
})

module.exports = resetPasswordSchema
