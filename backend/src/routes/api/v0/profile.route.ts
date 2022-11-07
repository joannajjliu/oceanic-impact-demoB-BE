// the base path is /api/v0/users
import { Router } from "express";
import ProfileController from "@controllers/profile.controller";
import Route from "@interfaces/route.interface";
import { verifyAuth } from "@/middlewares/auth.middleware";

export default class ProfileRoute implements Route {
  public router: Router = Router();
  private profileController = new ProfileController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", verifyAuth, this.profileController.getMe); // GET /api/v0/profile
    this.router.patch("/", verifyAuth, this.profileController.editProfile);
    this.router.get("/:profileID", this.profileController.getProfileById); // GET /api/v0/profile
  }
}
