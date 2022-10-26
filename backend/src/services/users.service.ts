import User, {IUser} from "@models/users.model";

export default class UserService {
    public users_model = User;

    public async getUsers(): Promise<Array<IUser>> {
        const users = await this.users_model.find({}); // find all users
        return (users as any);
    }
}

