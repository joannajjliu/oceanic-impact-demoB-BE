import User, {IUser} from "@models/users.model";
import { HydratedDocument } from "mongoose";

export default class UserService {
    public users_model = User;

    public async getUsers(): Promise<Array<HydratedDocument<IUser>>> {
        const users = await this.users_model.find({}); // find all users
        return users;
    }

    public async getUserById(id: string): Promise<HydratedDocument<IUser> | null> {
        const user = await this.users_model.findById(id); // find user by id
        return user as HydratedDocument<IUser> | null;
    }
}

