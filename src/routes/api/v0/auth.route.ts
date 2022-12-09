// the base path is /api/v0/auth
import { Router } from "express";
import AuthController from "@controllers/auth.controller";
import Route from "@interfaces/route.interface";

export default class AuthRoute implements Route {
    public router: Router = Router();
    private authController = new AuthController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post("/login", this.authController.login); // POST /api/v0/auth/login
        this.router.post('/', this.authController.signup); // POST /api/v0/auth/
        this.router.get('/verify', this.authController.verifyEmail); // GET /api/v0/auth/verify?token=...&email=...
    }
}