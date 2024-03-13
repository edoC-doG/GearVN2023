const nodemailer = require('nodemailer');
const asyncHandler = require('express-async-handler');


const sendMail = asyncHandler(async ({ email, html, subject }) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            // TODO: replace `user` and `pass` values from <https://forwardemail.net>
            user: process.env.EMAIL_NAME,
            pass: process.env.EMAIL_APP_PWD,
        },
    });
    // send mail with defined transport object
    const info = await transporter.sendMail({
        from: '"GearVN 👻" <no-@gearvn.com>', // sender address
        to: email, // list of receivers
        subject: subject, // Subject line
        html: html, // html body
    });
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    //
    // NOTE: You can go to https://forwardemail.net/my-account/emails to see your email delivery status and preview
    //       Or you can use the "preview-email" npm package to preview emails locally in browsers and iOS Simulator
    //       <https://github.com/forwardemail/preview-email>
    //

    return info;
})


module.exports = sendMail