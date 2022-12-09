import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import User, { IUser } from "@models/users.model";
import { HydratedDocument } from "mongoose";
import IJwtPayload from "@/interfaces/jwt_payload.interface";

const localStrategy = new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("JWT"), // e.g. Authorization: JWT <token>
    secretOrKey: process.env.JWT_SECRET || "supersecret",
    jsonWebTokenOptions: {
        maxAge: process.env.JWT_MAX_AGE || "30d", // 30 days default
    }
}, async function verify(
    jwt_payload: IJwtPayload,
    cb: CallableFunction
) {
    try {
        const user: HydratedDocument<IUser> | null = await User.findOne({
            _id: jwt_payload._id,
        });

        if (!user) {
            return cb(null, false, { message: "Bad JWT" });
        } else {
            if (!user.emailVerificationInfo.isVerified) {
                return cb(null, false, { message: "Email is not yet verified." });
            }

            return cb(null, {
                _id: user._id,
                email: user.email,
            });
        }
    } catch (e) {
        return cb(e);
    }
});

export default localStrategy;
