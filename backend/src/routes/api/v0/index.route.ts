// this file contains the index for the /api/v0 routes
// you can import routers here and mount them to this router
// the base path is /api/v0
import { Router } from 'express'

import usersRoute from './users.route';
import authRoute from './auth.route';
export default class v0Route {
    public router: Router = Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {  
        const usersRouter_ = new usersRoute();
        const authRouter_ = new authRoute();
        this.router.use('/users', usersRouter_.router); // mount users router to /api/v0/users
        this.router.use('/auth', authRouter_.router); // mount auth router to /api/v0/auth
    }
}