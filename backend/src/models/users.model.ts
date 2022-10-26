// Uses 
// https://stackoverflow.com/a/62672649
// for the pre-save hook for password hash

import { Schema, Document, model, CallbackError } from 'mongoose';
import bcrypt from 'bcrypt';

const HASH_ROUNDS = 10; // 10 hash rounds for bcrypt

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true, // unique emails
    },
    password: {
        type: String,
        required: true,
    }
});

export interface IUser extends Document {
    email: string;
    password: string; // the hash of the password
    validatePassword(password: string): boolean;
}

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
    return bcrypt.compare(pass, this.password);
};

const User = model<Document & IUser>('User', userSchema);

export default User;