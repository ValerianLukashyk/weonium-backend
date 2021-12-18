const express = require('express')
const router = express.Router()
// const nodemailer = require("nodemailer");
const verify = require('./verifyToken')
// const Mails = require('../models/Mail')
const AWS = require('aws-sdk');

AWS.config.update({ region: 'REGION' });


router.post('/', verify, (req, res, next) => {
    const params =
    {
        Destination: { /* required */
            CcAddresses: [
                'EMAIL_ADDRESS',
                'admin@weonium.com'
                /* more items */
            ],
            ToAddresses: [
                'EMAIL_ADDRESS',
                'weonium@gmail.com'
                /* more items */
            ]
        },
        Message: { /* required */
            Body: { /* required */
                Html: {
                    Charset: "UTF-8",
                    Data: "HTML_FORMAT_BODY"
                },
                Text: {
                    Charset: "UTF-8",
                    Data: "TEXT_FORMAT_BODY"
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: 'Test email'
            }
        },
        Source: 'SENDER_EMAIL_ADDRESS', /* required */
        ReplyToAddresses: [
            'EMAIL_ADDRESS',
            /* more items */
        ],
    };

    const sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();
    sendPromise.then(
        function (data) {
            console.log('MESSAGE DATA ----->  ', data);
            res.send(data)
        }).catch(
            function (err) {
                console.error(err, err.stack);
            });

    next()
})



module.exports = router
