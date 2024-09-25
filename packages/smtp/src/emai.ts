const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "202.61.198.18",
    port: 25,
    secure: false,
});

// async..await is not allowed in global scope, must use a wrapper
async function main() {
    // send mail with defined transport object
    const info = await transporter.sendMail({
        from: '"Maddison Foo Koch 👻" <henri@selfmail.app>', // sender address
        to: "henri.me@skiff.com", // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
        html: "<b>Hello world?</b>", // html body
    });

    console.log("Message sent: %s", info.messageId);
}

main().catch(console.error);