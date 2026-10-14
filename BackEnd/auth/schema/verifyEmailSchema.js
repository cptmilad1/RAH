const { z } = require("zod");

const verifyEmailSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Verification code must contain 6 digits."),
});

module.exports = verifyEmailSchema;
