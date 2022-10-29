import User, {IUser} from "@models/users.model";
import { HydratedDocument } from "mongoose";

export default class AuthService {
    public users_model = User;

    public async signup(email: string, password: string): Promise<HydratedDocument<IUser>> {
        const newUser = new User({
            email, password
        });
        const user = newUser.save(); // calls the pre-save hook
        return user;
    }
}

