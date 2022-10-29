// the base path is /api/v0/auth
import { Router } from "express";
import AuthController from "@controllers/auth.controller";
import Route from "@interfaces/route.interface";
import passport from "passport";

export default class AuthRoute implements Route {
    public router: Router = Router();
    private authController = new AuthController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(
          "/login", // POST /api/v0/auth/login
          passport.authenticate("local", {
            successRedirect: process.env.AUTH_SUCCESS_REDIRECT || '/',
            failureRedirect: process.env.AUTH_FAILURE_REDIRECT || '/login',
          })
        );
        this.router.post('/', this.authController.signup); // POST /api/v0/auth/
        this.router.post('/logout', this.authController.logout); // POST /api/v0/auth/logout
    }
}