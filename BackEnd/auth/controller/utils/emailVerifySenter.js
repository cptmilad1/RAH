const nodeMailer = require('nodemailer')

const transporter = nodeMailer.createTransport({
    service : "gmail",
    auth : {
        user: "miladbehe1@gmail.com",
        pass: "milad2019bh"
    }
})


async function sendResetEmail(email, resetToken) {
    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`
    await transporter.sendMail({
        from : "miladbehe1@gmail.com",
        to : email,
        subject : "Password Reset Token",
        html : `
            <h1>${resetToken}</h1>
            <button href='${resetLink}'>Click to reset password</button>
            `
    })
}

module.exports = sendResetEmail