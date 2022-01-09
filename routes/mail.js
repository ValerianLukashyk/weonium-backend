const express = require('express')
const router = express.Router()
const verify = require('./verifyToken')
const nodemailer = require("nodemailer");

async function sendTestMail(req,res) {
    let transporter = nodemailer.createTransport({
        host: "smtp.titan.email",
        port: 465,
        secure: true,
        auth: {
            user: "valerian@weonium.space",
            pass: "sanpedro1990",
        },
    });

    let info = await transporter.sendMail({
        from: '"Valerian" <valerian@weonium.space>',
        to: "space.onion23@gmail.com",
        subject: "Hello",
        text: "Hello world?",
        html: "<b>Hello world?</b>",
    });
    
    res.send(info)
    console.log("Message sent: %s", info);
}


router.post('/', sendTestMail)



module.exports = router
