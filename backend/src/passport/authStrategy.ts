import { Strategy as LocalStrategy } from "passport-local";
import User, { IUser } from "@models/users.model";
import { HydratedDocument } from "mongoose";

const localStrategy = new LocalStrategy(async function verify(
  email: string,
  password: string,
  cb: CallableFunction
) {
    try {
        const user: HydratedDocument<IUser> | null = await User.findOne({
            email: email,
        });

        if (!user) {
            return cb(null, false, { message: "Incorrect email or password." });
        } else {
            const isValid = await user.validatePassword(password);
            if (isValid) {
                if (!user.emailVerificationInfo.isVerified) {
                    return cb(null, false, { message: "Email is not yet verified." });
                }

                return cb(null, {
                    _id: user._id,
                    email: user.email,
                });
            }
            // Make sure to return the same error message as above to prevent
            // user enumeration attacks
            return cb(null, false, { message: "Incorrect email or password." }); 
        }
    } catch (e) {
        return cb(e);
    }
});

export default localStrategy;
