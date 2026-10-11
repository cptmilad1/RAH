const { z } = require("zod");

const registerSchema = z.object({
    full_name: z.string().trim().min(2).max(100),
    username: z.string().trim().toLowerCase().min(3).max(50).regex(/^[a-z0-9_]+$/),
    email: z.email().trim().toLowerCase(),
    password: z.string().min(8).max(72),
    phone: z.string().trim().min(7).max(30).optional().or(z.literal('')),
    user_address: z.string().trim().max(500).optional(),
})
module.exports = registerSchema