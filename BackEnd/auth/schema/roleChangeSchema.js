const { z } = require('zod')

module.exports = z.object({
  role: z.enum(['admin', 'user']),
})
