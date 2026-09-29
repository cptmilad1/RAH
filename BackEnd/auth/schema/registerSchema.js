const { default: z, string, email } = require("zod");

const registerShema = z.object({
    full_name: string().trim().min(5,"full name must be least 5 char...").max(100,"full name must be less than 100 char"),
    username: string().trim().toLowerCase().min(5,"username must be least 5 char..."),
    email: string().email("invalid email type!").trim().toLowerCase(),
    password: string().min(5,"password must be least 5 char").max(72),
    phone: string().min(10).max(12)
})
module.exports = registerShema