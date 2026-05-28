import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  try {
    const isEthereal = process.env.EMAIL_USER.includes('@ethereal.email');
    console.log("isEthereal:", isEthereal);
    const transporter = nodemailer.createTransport(
      isEthereal 
        ? {
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS
            }
          }
        : {
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS
            }
          }
    );

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'yassinerou221@gmail.com',
      subject: 'Test',
      text: 'Test message'
    });
    console.log("Success:", info.messageId);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
