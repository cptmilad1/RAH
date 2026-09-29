const { default: z, email, string } = require("zod");

const loginSchema = z.object({
    email: string().trim().email("invalid email type").toLowerCase(),
    password: string().min(5,"less password").max(72)
})
module.exports = loginSchema;