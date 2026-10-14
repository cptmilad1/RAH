require('../../../config/loadEnv')

const nodeMailer = require('nodemailer')

function createTransporter() {
    const requiredSettings = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD', 'APP_URL']
    const missingSettings = requiredSettings.filter((setting) => !process.env[setting]?.trim())

    if (missingSettings.length > 0) {
        const error = new Error(`Email service is not configured. Missing: ${missingSettings.join(', ')}`)
        error.status = 503
        throw error
    }

    const port = Number(process.env.SMTP_PORT || 465)
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        const error = new Error('SMTP_PORT must be a valid port number.')
        error.status = 500
        throw error
    }

    let appUrl
    try {
        appUrl = new URL(process.env.APP_URL)
    } catch {
        const error = new Error('APP_URL must be a valid absolute URL.')
        error.status = 500
        throw error
    }

    if (!['http:', 'https:'].includes(appUrl.protocol)) {
        const error = new Error('APP_URL must use HTTP or HTTPS.')
        error.status = 500
        throw error
    }

    return nodeMailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: process.env.SMTP_SECURE
            ? process.env.SMTP_SECURE === 'true'
            : port === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    })
}

function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    })[character])
}

async function sendMail(email, subject, value, route, description, queryName = 'token') {
    const transporter = createTransporter()
    const appUrl = new URL(process.env.APP_URL)
    const link = new URL(route, appUrl)
    link.searchParams.set(queryName, value)
    const safeLink = escapeHtml(link.toString())

    try {
        const isVerificationCode = queryName === 'code'
        const codeText = isVerificationCode ? `\n\nکد تأیید شما: ${value}` : ''
        const codeHtml = isVerificationCode
            ? `<p>کد شش‌رقمی شما:</p><p dir="ltr" style="font-size:28px;font-weight:bold;letter-spacing:8px">${escapeHtml(value)}</p>`
            : ''
        return await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: email,
            subject,
            text: `${description}${codeText}\n\n${link.toString()}`,
            html: `<div dir="rtl" lang="fa"><p>${description}</p>${codeHtml}<p><a href="${safeLink}">تأیید ایمیل</a></p><p>یا کد را در صفحهٔ تأیید وارد کنید.</p></div>`,
        })
    } catch (deliveryError) {
        console.error('SMTP delivery failed:', deliveryError.code || deliveryError.message)
        const error = new Error('ایمیل ارسال نشد. تنظیمات SMTP را بررسی کنید و دوباره تلاش کنید.')
        error.status = 502
        throw error
    }
}

async function sendResetEmail(email, token) {
    return sendMail(email, 'بازیابی گذرواژهٔ راه', token, '/reset-password', 'برای تغییر گذرواژه روی پیوند زیر بزنید:')
}

async function sendVerificationEmail(email, token) {
    return sendMail(email, 'کد تأیید ایمیل راه', token, '/verify-email', 'برای تأیید نشانی ایمیل خود از این کد استفاده کنید:', 'code')
}

module.exports = { sendResetEmail, sendVerificationEmail }