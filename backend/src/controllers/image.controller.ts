import { Request, Response } from "express";
import userService from "@services/users.service";
import Image, { IImage } from "@/models/image.model";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

export default class ImageController {
  public userService = new userService();

  public postUpload = async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Upload requires image" });
      }
      let image = new Image({
        img: {
          data: req.file.buffer,
          contentType: "image/png",
        },
        author: req.user!._id,
      });

      image = await image.save();

      return res.status(200).json({
        message: "Successfully uploaded image",
        imageID: image._id,
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({
        message: "Server error",
      });
    }
  };

  public getMine = async (req: Request, res: Response) => {
    try {
      const images = await Image.find({ author: req.user!._id });

      res.status(200).json({
        images: images.map((image) => image._id),
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({
        message: "Server error",
      });
    }
  };

  public getImage = async (req: Request, res: Response) => {
    try {
      if (
        !req.params.imageid ||
        !mongoose.isValidObjectId(req.params.imageid)
      ) {
        return res.status(400).json({
          error: "Please supply valid image ID",
        });
      }
      const image = await Image.findOne({ _id: req.params!.imageid });
      if (!image) {
        return res.status(404).json({
          error: "image not found",
        });
      }
      const imageData = Buffer.from(image.img.data).toString("base64");
      return res.status(200).json({
        imageData,
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({
        message: "Server error",
      });
    }
  };
}
