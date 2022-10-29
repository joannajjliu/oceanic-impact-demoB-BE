// the base path is /api/v0/users
import { Router } from 'express'
import UsersController from '@controllers/users.controller';
import Route from '@interfaces/route.interface';
import { verifyAuth } from '@/middlewares/auth.middleware';
export default class UsersRoute implements Route {
    public router: Router = Router();
    private userController = new UsersController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get('/', this.userController.getUsers); // GET /api/v0/users
        this.router.get('/me', verifyAuth, this.userController.getMe); // GET /api/v0/users/me
    }
}