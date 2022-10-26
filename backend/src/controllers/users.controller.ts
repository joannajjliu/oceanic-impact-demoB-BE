import { Request, Response } from 'express';
import userService from '@services/users.service';

export default class UsersController {
    public userService = new userService();

    public getUsers = async (req: Request, res: Response) => {
        try {
            const users = await this.userService.getUsers();
            res.status(200).json({users});
        } catch (error) {
            console.error(error);
            res.status(500).json({error});
        }
    }
}