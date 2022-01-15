// const verify = require('./verifyToken')
const nodemailer = require("nodemailer");

async function sendConfirmEmail(name, email, confirmationCode) {
    const answer = null
    let transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: true,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    });

    let info = await transporter.sendMail({
        from: '"Valerian Weonium" <valerian@weonium.space>',
        to: email,
        subject: "Confirm your email address",
        html: `
                <h1>Email Confirmation</h1>
                <h2>Hello ${name}</h2>
                <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
                <a href=http://localhost/register/${confirmationCode}> Click here</a>
                
            `,
    }, );

    
    console.log("Message sent: %s", info);
    return info
}

module.exports = {
    sendConfirmEmail: sendConfirmEmail,


};