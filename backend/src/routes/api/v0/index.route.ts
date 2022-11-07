// this file contains the index for the /api/v0 routes
// you can import routers here and mount them to this router
// the base path is /api/v0
import { Router } from "express";

import usersRoute from "./users.route";
import authRoute from "./auth.route";
import imageRoute from "./image.route";
import ListingsRoute from "./listings.route";
import profileRoute from "./profile.route";
export default class v0Route {
  public router: Router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    const usersRouter_ = new usersRoute();
    const authRouter_ = new authRoute();
    const imageRouter_ = new imageRoute();
    const listingsRouter_ = new ListingsRoute();
    const profileRouter_ = new profileRoute();
    this.router.use("/users", usersRouter_.router); // mount users router to /api/v0/users
    this.router.use("/auth", authRouter_.router); // mount auth router to /api/v0/auth
    this.router.use("/image", imageRouter_.router); // mount auth router to /api/v0/image
    this.router.use("/profile", profileRouter_.router); // mount auth router to /api/v0/profile
    this.router.use("/listings", listingsRouter_.router); // mount listings router to /api/v0/listings
  }
}
