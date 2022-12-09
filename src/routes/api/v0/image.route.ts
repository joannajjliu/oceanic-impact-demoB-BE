// this file contains the index for the /api/v0/images routes
import { Router } from "express";
import ImageController from "@controllers/image.controller";
import { verifyAuth } from "@/middlewares/auth.middleware";
import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 500, // 500MB
  },
});

export default class imageRoute {
  public router: Router = Router();
  private imageController = new ImageController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/mine", verifyAuth, this.imageController.getMine); // GET /api/v0/image/mine
    this.router.post(
      "/",
      verifyAuth,
      upload.single("image"),
      this.imageController.postUpload
    );
    this.router.get("/:imageid", this.imageController.getImage);
  }
}
