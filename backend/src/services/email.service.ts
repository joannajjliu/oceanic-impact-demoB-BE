import nodemailer from 'nodemailer';
import User, {IUser} from "@models/users.model";
import fs from 'fs';
import path from 'path';

export default class EmailService {
  private async getTransporter(account: any): Promise<nodemailer.Transporter | any> {
    if (process.env.NODE_ENV === "testing") {
      const transport = {
        sendMail: async (mailOptions: any) => {
          console.log("Mock email sent: ", mailOptions);
        }
      }
      return transport;
    } else {
      let transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SMTP_URL || "smtp.ethereal.email",
        port: parseInt(process.env.EMAIL_SMTP_PORT || "587"),
        secure: false, // true for 465, false for other ports
        auth: {
          user: account.user, 
          pass: account.pass,
        },
      });
      return transporter;
    }
  }

  public async sendVerificationEmail(
    email: string,
    token: string
  ): Promise<boolean> {
    const verification_url = `${process.env.ROOT_URL || "http://localhost:3000"}/api/v0/auth/verify?token=${token}&email=${email}`;
    try {
      let account
        if (process.env.NODE_ENV !== "testing") {
          account = process.env.EMAIL_PASS ? {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
          } : await nodemailer.createTestAccount(); // create a test account if no email credentials are provided
        } else {
          account = {}
        }
        
        const transporter = await this.getTransporter(account);

        const verfiyEmailHTML = await fs.promises.readFile(path.join(__dirname, "../emails/verifyEmail.html"), "utf8"); // read the html file
        
        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: `"Oceanic Impact" <${process.env.EMAIL_USER}>`,
            to: [email], // list of receivers
            subject: "Welcome to Oceanic Impact",
            text: `Please verify your email using the following link (expires in 6 hours): ${verification_url}`,
            html: verfiyEmailHTML.replace('$VERIFICATION_URL', verification_url),
        });

        if (process.env.NODE_ENV === "development") {
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }
        
        return true;
    } catch (e) {
        console.error("Error sending email: ", e);
        return false;
    }
  }

  public async verifyEmail(email: string, token: string): Promise<boolean | null> {
    // verifies the email of a user using the token from their email
    // returns true if the email was verified, false if the token is invalid, and null if the user doesn't exist

    const user = await User.findOne({ email: email });
    if (!user) {
        return null;
    } else if (user.emailVerificationInfo.isVerified) {
        return true;
    } else {
        if (user.emailVerificationInfo.token.value === token || process.env.NODE_ENV === "testing") { // allow the token to be verified in testing mode
            if (user.emailVerificationInfo.token.expiresAt < new Date()) {
                return false;
            } else {
                user.emailVerificationInfo.isVerified = true;
                await user.save();
                return true;
            }
        } else {
            return false;
        }
    }
}
}
