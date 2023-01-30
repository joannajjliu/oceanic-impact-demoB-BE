// Uses 
// https://stackoverflow.com/a/62672649
// for the pre-save hook for password hash

import { Schema, model, CallbackError } from 'mongoose';
import bcrypt from 'bcrypt';

const HASH_ROUNDS = 10; // 10 hash rounds for bcrypt

export interface IUser {
    email: string;
    password: string; // the hash of the password
    emailVerificationInfo: {
        isVerified: boolean;
        token: {
            value: string;
            expiresAt: Date;
        }
    }
    validatePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
    email: {
        type: String,
        required: true,
        unique: true, // unique emails
    },
    password: {
        type: String,
        required: true,
    },
    emailVerificationInfo: {
        isVerified: {
            type: Boolean,
            required: true,
            default: true,
        },
        token: {
            expiresAt: {
                type: Date,
                required: true,
            },
            value: {
                type: String,
                required: true,
            },
        },
    }
});

userSchema.pre('save', async function (next) {
    const thisObj = this as IUser;
    
    if (!this.isModified('password')) {
        // skip if password is the same
        return next();
    }

    try {
        // salt and hash the password before saving to the DB
        const salt = await bcrypt.genSalt(HASH_ROUNDS); 
        thisObj.password = await bcrypt.hash(thisObj.password, salt);
        return next();
    } catch (e) {
        return next(e as CallbackError | undefined);
    }
});

userSchema.methods.validatePassword = async function (pass: string) {
    return await bcrypt.compare(pass, this.password);
};

const User = model<IUser>('User', userSchema);

export default User;