const nodeMailer = require('nodemailer')

function createTransporter() {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) return null
    return nodeMailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    })
}

async function sendMail(email, subject, token, path) {
    const transporter = createTransporter()
    if (!transporter) return false
    const link = `${process.env.APP_URL || 'http://localhost:5173'}${path}?token=${encodeURIComponent(token)}`
    await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject,
        html: `<p>Use this link to continue:</p><p><a href="${link}">${link}</a></p>`,
    })
    return true
}

async function sendResetEmail(email, token) {
    return sendMail(email, 'Password reset', token, '/reset-password')
}

async function sendVerificationEmail(email, token) {
    return sendMail(email, 'Verify your email', token, '/verify-email')
}

module.exports = { sendResetEmail, sendVerificationEmail }