const { z } = require("zod");

const loginSchema = z.object({
    email: z.email().trim().toLowerCase(),
    password: z.string().min(8).max(72)
})
module.exports = loginSchema;