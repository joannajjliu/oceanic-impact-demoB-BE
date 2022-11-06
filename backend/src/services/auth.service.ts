import User, {IUser} from "@models/users.model";
import { HydratedDocument } from "mongoose";
import crypto from "crypto";
import EmailService from "./email.service";

export default class AuthService {
    private async generateNewToken(): Promise<string> {
        // generate a new token for email verification
        const token = crypto.randomBytes(32).toString("hex"); // generate 32 random bytes
        return token;
    }

    public async signup(email: string, password: string): Promise<HydratedDocument<IUser>> {
        const newUser = new User({
            email,
            password,
            emailVerificationInfo: {
                isVerified: false,
                token: {
                    value: await this.generateNewToken(),
                    expiresAt: new Date(Date.now() + parseInt(process.env.EMAIL_TOKEN_AGE || "2160000")), // 6 hours default
                },
            },
        });
        const user = newUser.save(); // calls the pre-save hook
        return user;
    }

    public async requestNewEmailToken(email: string, emailService: EmailService): Promise<boolean | null> {
        // requests a new email token for a user
        // returns true if the token was updated, false if there was an error, and null if the user doesn't exist or is already verified

        const user = await User.findOne({ email: email });
        if (!user) {
            return null;
        } else {
            if (user.emailVerificationInfo.isVerified) {
                return null;
            } else {
                user.emailVerificationInfo.token.value = await this.generateNewToken();
                user.emailVerificationInfo.token.expiresAt = new Date(Date.now() + parseInt(process.env.EMAIL_TOKEN_AGE || "2160000")); // extend the token age
                await user.save();

                const sentEmail = await emailService.sendVerificationEmail(user.email, user.emailVerificationInfo.token.value);

                return sentEmail;
            }
        }
        
    }
}

