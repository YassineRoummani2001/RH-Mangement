import nodemailer from 'nodemailer';

export const sendMail = async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;

    if (!to || !subject || (!text && !html)) {
      return res.status(400).json({ success: false, message: 'Veuillez fournir un destinataire, un sujet et un contenu.' });
    }

    let transporter;

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const isEthereal = process.env.EMAIL_USER.includes('@ethereal.email');
      
      transporter = nodemailer.createTransport(
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
    } else {
      // Fallback to Ethereal Test Account to prevent crashes
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, 
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log("⚠️ Aucune configuration Gmail (.env). Utilisation du mode de test (Ethereal).");
    }

    const mailOptions = {
      from: process.env.EMAIL_USER || '"RH Management" <no-reply@rh.ma>',
      to: to,
      subject: subject,
      text: text,
      html: html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.messageId);
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("👉 URL de prévisualisation de l'email : %s", nodemailer.getTestMessageUrl(info));
    }

    res.json({ success: true, message: 'Email envoyé avec succès', info });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'envoi de l\'email: ' + error.message });
  }
};
