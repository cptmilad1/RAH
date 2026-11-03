const { z } = require('zod')

const updateSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system', 'sepia', 'contrast']).optional(),
  font: z.enum(['vazirmatn', 'tahoma', 'arial', 'system', 'serif']).optional(),
  language: z.enum(['fa', 'en']).optional(),
  color: z.enum(['forest', 'ocean', 'violet', 'sunset', 'monochrome']).optional(),
}).strict().refine(
  (settings) => Object.keys(settings).length === 1,
  { message: 'Provide exactly one valid setting to update.' },
)

module.exports = updateSettingsSchema
